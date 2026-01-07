#include "config.h"
#include "http.h"
#include "methods.h"
#include "ui.h"
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

// Playables
std::vector<Playable> playables;
bool playablesLoaded = false;
int highlightedPlayableIndex = 0;

// Playback
bool playing = false;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=== Jukebox Starting ===");
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
    } else if (page == PLAYING) {
      page = PLAYABLES;
    }
    backButtonPressed = false;
  };

  int encPosition = encoder.getCount();
  static int lastEncPosition = 0;

  if (encPosition < 0) {
    encoder.setCount(0);
    encPosition = 0;
  } else if (encPosition >= vibeTitles.size()) {
    encoder.setCount(vibeTitles.size() - 1);
    encPosition = vibeTitles.size() - 1;
  }

  if (encPosition != lastEncPosition) {
    int maxIndex = static_cast<int>(vibeTitles.size()) - 1;
    highlightedVibeIndex = std::clamp(encPosition, 0, maxIndex);
    lastEncPosition = encPosition;

    Serial.print("Vibe: ");
    Serial.println(vibeTitles[highlightedVibeIndex]);
  }

  if (encSwitchPressed) {
    if (page == VIBES) {
      page = PLAYABLES;
      if (vibeTitlesLoaded && !playablesLoaded && error == "") {
        playables = getPlayables(vibeTitles[highlightedVibeIndex]);

        if (playables.size() > 0) {
          playablesLoaded = true;
        } else {
          error = "Failed to load playables. Try restarting Jukebox.";
        }; 
      };
    } else if (page == PLAYABLES) {
      Serial.println("Will play selection!");
    }
    encSwitchPressed = false;
  }
}