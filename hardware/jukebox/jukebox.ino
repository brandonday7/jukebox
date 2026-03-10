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
  if (WiFi.status() != WL_CONNECTED) {
    // TODO: keep this block and send error message to LCD screen
    Serial.println("WiFi not connected!");
    delay(5000);
    return;
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
    if (playing) {
      playing = pause(playing);
    } else {
      playing = play(playing);
    };
    playbackButtonPressed = false;
  };

  if (backButtonPressed == true) {
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