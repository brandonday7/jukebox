#include "config.h"
#include "http.h"
#include "methods.h"
#include "ui.h"
#include "display.h"
#include "tests.h"
#include <WiFi.h>
#include <algorithm>

// System
bool runTests = false;
enum Page {
  NONE,
  VIBES,
  PLAYABLES,
  PLAYING
};
Page page = VIBES;
Page prevPage = NONE;
int errorCount = 0;
unsigned long lastShiftTime = 0;
const unsigned long SHIFT_LIMIT_MS = 1UL * 500;

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
String nowPlayingTitle;
String nowPlayingArtist;

// Playback
bool playing = false;
const int imgSize = 12;
uint16_t imgBuffer[imgSize * imgSize] = {};

// Energy Saving Modes
unsigned long lastActivityTime = 0;
bool screenDimmed = false;
bool inactivityMode = false;
// Turn off after 2 hours
const unsigned long POWER_DOWN_LIMIT_MS = 1UL * 2 * 60 * 60 * 1000;
// Dim screen after 2 minutes
const unsigned long DIM_LIMIT_MS = 1UL * 2 * 60 * 1000;

// Common helper methods
void selectVibe(int index) {
  page = PLAYABLES;
  if (vibeTitlesLoaded && !playablesLoaded && errorCount < 3) {
    playables = withLoading<std::vector<Playable>>([&]() {
        return getPlayables(vibeTitles[index]);
    });

    if (playables.size() > 0) {
      playablesLoaded = true;

      renderMenu(getPlayableOptions(playables), highlightedPlayableIndex, &maxPlayableDepthIndex);
    } else {
      playablesLoaded = false;
      delay(1000);
      page = VIBES;
      return;
    };
  };
}

void selectPlayable(int index) {
  page = PLAYING;
  withLoading([&]() {
    return fetchPlayableArtwork(playables[highlightedPlayableIndex].artworkUrl, imgBuffer, imgSize);
  });
  nowPlayingTitle = playables[highlightedPlayableIndex].title;
  nowPlayingArtist = playables[highlightedPlayableIndex].artistName;
  renderNowPlaying(nowPlayingTitle, nowPlayingArtist, imgBuffer, imgSize);
  playing = true;
  // playing = play(
  //   playing,
  //   playables[highlightedPlayableIndex].spId,
  //   playables[highlightedPlayableIndex].type
  // );
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  if (runTests) {
    runTestSuite();
    runTests = false;
  }
  // Seed random number generator.
  srand(esp_random());
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

  if (errorCount >= 3) {
    printFullScreen("We're having some issues. Try restarting Jukebox.");
    delay(60000);
    return;
  };

  if (!vibeTitlesLoaded && errorCount < 3) {
    vibeTitles = withLoading<std::vector<String>>([&]() {
      return getVibeTitles();
    });

    if (vibeTitles.size() > 0) {
      vibeTitlesLoaded = true;

      renderMenu(vibeTitles, highlightedVibeIndex, &maxVibeDepthIndex);
    } else {
      delay(1000);
      return;
    };
  };

  int encPosition = encoder.getCount();
  static int lastEncPosition = 0;

  processShiftPress();

  if (shiftButtonPressed) {
    onUiAction(&lastActivityTime, &screenDimmed);

    now = millis();
    if (now - lastShiftTime <= SHIFT_LIMIT_MS) {
      if (nowPlayingTitle.length() > 0 && nowPlayingArtist.length() > 0) {
        prevPage = page;
        page = PLAYING;
        renderNowPlaying(nowPlayingTitle, nowPlayingArtist, imgBuffer, imgSize);
      }
    }
    lastShiftTime = now;
    shiftButtonPressed = false;
  }

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

  if (playbackButtonPressed == true) {
    onUiAction(&lastActivityTime, &screenDimmed);

    if (shiftButtonLatched == true) {
      if (page == VIBES && vibeTitles.size()) {
        highlightedVibeIndex = pickRandomVibe(vibeTitles.size());
        printFullScreen(vibeTitles[highlightedVibeIndex]);
        delay(1000);
        encoder.setCount(0);
        lastEncPosition = 0;
        selectVibe(highlightedVibeIndex);
      } else if (page == PLAYABLES && playablesLoaded) {
        highlightedPlayableIndex = pickRandomPlayable(playables.size());
        printFullScreen(playables[highlightedPlayableIndex].title);
        delay(1000);
        selectPlayable(highlightedPlayableIndex);
      }

      shiftButtonLatched = false;
    } else {
      if (page == PLAYING) {
        renderIndicator();
      }

      if (playing) {
        playing = pause(playing);
      } else {
        playing = play(playing);
      };

      if (page == PLAYING) {
        renderIndicator(true);
      }
    }

    playbackButtonPressed = false;
  };

  if (backButtonPressed == true) {
    onUiAction(&lastActivityTime, &screenDimmed);

    if (shiftButtonLatched == true) {
      if (page == VIBES) {
        highlightedVibeIndex = 0;
        encoder.setCount(0);
        lastEncPosition = 0;
        vibeTitles = {};
        vibeTitlesLoaded = false;
      } else if (page == PLAYABLES) {
        highlightedPlayableIndex = 0;
        encoder.setCount(0);
        lastEncPosition = 0;
        playables = {};
        playablesLoaded = false;
        selectVibe(highlightedVibeIndex);
      }

      shiftButtonLatched = false;
    } else {
      if (page == PLAYABLES) {
        page = VIBES;
        playablesLoaded = false;
        highlightedPlayableIndex = 0;
        encoder.setCount(highlightedVibeIndex);
        renderMenu(vibeTitles, highlightedVibeIndex, &maxVibeDepthIndex);
      } else if (page == PLAYING && prevPage == VIBES) {
        prevPage = NONE;
        page = VIBES;
        renderMenu(vibeTitles, highlightedVibeIndex, &maxVibeDepthIndex);
      } else if (page == PLAYING) {
        page = PLAYABLES;
        renderMenu(getPlayableOptions(playables), highlightedPlayableIndex, &maxPlayableDepthIndex);
      }
    }

    backButtonPressed = false;
  };

  if (encSwitchPressed) {
    onUiAction(&lastActivityTime, &screenDimmed);

    if (page == VIBES) {
      encoder.setCount(0);
      lastEncPosition = 0;
      selectVibe(highlightedVibeIndex);
    } else if (page == PLAYABLES && playables.size()) {
      selectPlayable(highlightedPlayableIndex);
    }
    encSwitchPressed = false;
  }
}