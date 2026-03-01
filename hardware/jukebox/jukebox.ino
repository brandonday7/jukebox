#include "config.h"
#include "http.h"
#include "methods.h"
#include "ui.h"
#include "display.h"
#include <WiFi.h>
#include <algorithm>

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

void setup() {
  Serial.begin(115200);
  delay(1000);

  displayInit();
  uiInit();
  connectToWiFi();
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
    vibeTitles = getVibeTitles();

    if (vibeTitles.size() > 0) {
      vibeTitlesLoaded = true;

      showMenu(vibeTitles, highlightedVibeIndex, &maxVibeDepthIndex);
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
      showMenu(vibeTitles, highlightedVibeIndex, &maxVibeDepthIndex);
    } else if (page == PLAYING) {
      page = PLAYABLES;
      showMenu(getPlayableTitles(playables), highlightedPlayableIndex, &maxPlayableDepthIndex);
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

    showMenu(vibeTitles, highlightedVibeIndex, &maxVibeDepthIndex);
  }

  if (page == PLAYABLES && playables.size() && encPosition != lastEncPosition) {
    int maxIndex = static_cast<int>(playables.size()) - 1;
    highlightedPlayableIndex = std::clamp(encPosition, 0, maxIndex);
    lastEncPosition = encPosition;

    showMenu(getPlayableTitles(playables), highlightedPlayableIndex, &maxPlayableDepthIndex);
  }

  if (encSwitchPressed) {
    if (page == VIBES) {
      page = PLAYABLES;
      if (vibeTitlesLoaded && !playablesLoaded && error == "") {
        playables = getPlayables(vibeTitles[highlightedVibeIndex]);

        if (playables.size() > 0) {
          playablesLoaded = true;

          showMenu(getPlayableTitles(playables), highlightedPlayableIndex, &maxPlayableDepthIndex);
          Serial.print("Playable: ");
          Serial.println(playables[highlightedPlayableIndex].title);
        } else {
          error = "Failed to load playables. Press back and try again.";
        };
      };
    } else if (page == PLAYABLES) {
      page = PLAYING;
      playing = play(
        playing,
        playables[highlightedPlayableIndex].spId,
        playables[highlightedPlayableIndex].type
      );
      printFullScreen(playables[highlightedPlayableIndex].title);
    }
    encSwitchPressed = false;
  }
}