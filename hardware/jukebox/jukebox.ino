#include "config.h"
#include "http.h"
#include "methods.h"
#include "ui.h"
#include "display.h"
#include "tests.h"
#include <WiFi.h>
#include <algorithm>

bool runTests = false;

// System
enum Page {
  VIBES,
  PLAYABLES,
  PLAYING
};
Page page = VIBES;
String error = "";
int backButtonState = 0;

// Vibes
std::vector<String> vibeTitles;
bool vibeTitlesLoaded = false;
int highlightedVibeIndex = 0;
int maxVibeDepthIndex = 0;

// Playables
std::vector<Playable> playables;
bool playablesLoaded = false;
int highlightedPlayableIndex = 0;
int maxPlayableDepthIndex = 0;

// Playback
bool playing = false;
const int imgSize = 12;
uint16_t imgBuffer[imgSize * imgSize] = {};

// Energy Saving Modes
unsigned long lastActivityTime = 0;
bool screenDimmed = false;
bool inactivityMode = false;
// Turn off after 2 hours
const unsigned long POWER_DOWN_LIMIT_MS = 2UL * 60 * 60 * 1000;
// Dim screen after 2 minutes
const unsigned long DIM_LIMIT_MS = 2UL * 60 * 1000;

void setup() {
  Serial.begin(115200);
  delay(1000);

  if (runTests) {
    runTestSuite();
    runTests = false;
  }
  displayInit();
  uiInit();
  connectToWiFi();
  activateSpotifyDevice();
}

void loop() {
  if (!inactivityMode && WiFi.status() != WL_CONNECTED) {
    // TODO: keep this block and send error message to LCD screen
    Serial.println("WiFi not connected!");
    delay(5000);
    return;
  }

  unsigned long now = millis();

  if (now - lastActivityTime > POWER_DOWN_LIMIT_MS) {
    printFullScreen("Goodbye!");
    delay(1000);
    turnScreenOff();
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
    inactivityMode = true;
  }

  if (inactivityMode) {
    Serial.println("Inactivity mode. Returning early...");
    delay(60000);
    return;
  }

  if (now - lastActivityTime > DIM_LIMIT_MS && !screenDimmed) {
    changeScreenBrightness(1);
    screenDimmed = true;
  }

  if (error != "") {
    Serial.println("Error in loop: " + error);
    delay(5000);
  };

  if (!vibeTitlesLoaded && error == "") {
    vibeTitles = withLoading<std::vector<String>>([&]() {
      return getVibeTitles();
    });

    if (vibeTitles.size() > 0) {
      vibeTitlesLoaded = true;

      renderMenu(vibeTitles, highlightedVibeIndex, &maxVibeDepthIndex);
    } else {
      error = "Failed to load vibes. Try restarting Jukebox.";
    };
  };

  if (playbackButtonPressed == true) {
    onUiAction(&lastActivityTime, &screenDimmed);

    if (playing) {
      playing = pause(playing);
    } else {
      playing = play(playing);
    };
    playbackButtonPressed = false;
  };

  if (backButtonPressed == true) {
    onUiAction(&lastActivityTime, &screenDimmed);

    if (page == PLAYABLES) {
      page = VIBES;
      playablesLoaded = false;
      highlightedPlayableIndex = 0;
      encoder.setCount(highlightedVibeIndex);
      renderMenu(vibeTitles, highlightedVibeIndex, &maxVibeDepthIndex);
    } else if (page == PLAYING) {
      page = PLAYABLES;
      renderMenu(getPlayableOptions(playables), highlightedPlayableIndex, &maxPlayableDepthIndex);
    }
    backButtonPressed = false;
  };

  int encPosition = encoder.getCount();
  static int lastEncPosition = 0;

  if (encPosition < 0) {
    encoder.setCount(0);
    encPosition = 0;
  } else if (page == VIBES && encPosition >= vibeTitles.size()) {
    encoder.setCount(vibeTitles.size() - 1);
    encPosition = vibeTitles.size() - 1;
  } else if (page == PLAYABLES && encPosition >= playables.size()) {
    encoder.setCount(playables.size() - 1);
    encPosition = playables.size() - 1;
  }

  if (encPosition != lastEncPosition) {
    onUiAction(&lastActivityTime, &screenDimmed);
  }

  if (page == VIBES && encPosition != lastEncPosition) {
    int maxIndex = static_cast<int>(vibeTitles.size()) - 1;
    highlightedVibeIndex = std::clamp(encPosition, 0, maxIndex);
    lastEncPosition = encPosition;

    renderMenu(vibeTitles, highlightedVibeIndex, &maxVibeDepthIndex);
  }

  if (page == PLAYABLES && playables.size() && encPosition != lastEncPosition) {
    int maxIndex = static_cast<int>(playables.size()) - 1;
    highlightedPlayableIndex = std::clamp(encPosition, 0, maxIndex);
    lastEncPosition = encPosition;

    renderMenu(getPlayableOptions(playables), highlightedPlayableIndex, &maxPlayableDepthIndex);
  }

  if (encSwitchPressed) {
    onUiAction(&lastActivityTime, &screenDimmed);

    if (page == VIBES) {
      page = PLAYABLES;
      encoder.setCount(0);
      lastEncPosition = 0;
      if (vibeTitlesLoaded && !playablesLoaded && error == "") {
        playables = withLoading<std::vector<Playable>>([&]() {
            return getPlayables(vibeTitles[highlightedVibeIndex]);
        });

        if (playables.size() > 0) {
          playablesLoaded = true;

          renderMenu(getPlayableOptions(playables), highlightedPlayableIndex, &maxPlayableDepthIndex);
        } else {
          error = "Failed to load playables. Press back and try again.";
        };
      };
    } else if (page == PLAYABLES) {
      page = PLAYING;
      withLoading([&]() {
        return fetchPlayableArtwork(playables[highlightedPlayableIndex].artworkUrl, imgBuffer, imgSize);
      });
      playing = true;
      renderNowPlaying(
        playables[highlightedPlayableIndex].title,
        playables[highlightedPlayableIndex].artistName,
        imgBuffer,
        imgSize
      );
      playing = play(
        playing,
        playables[highlightedPlayableIndex].spId,
        playables[highlightedPlayableIndex].type
      );
    }
    encSwitchPressed = false;
  }
}