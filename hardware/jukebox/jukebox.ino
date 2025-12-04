#include "config.h"
#include "http.h"
#include "methods.h"
#include <WiFi.h>

// System
enum Page {
  VIBES,
  PLAYABLES,
  PLAYING
};
Page page = PLAYABLES;
String error = "";

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
int playbackButtonState = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=== Jukebox Starting ===");
  pinMode(PLAYBACK_BUTTON_PIN, INPUT_PULLUP);

  connectToWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    // TODO: keep this block and set an LED or reconnect to Wifi instead
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

  playbackButtonState = digitalRead(PLAYBACK_BUTTON_PIN);

  if (playbackButtonState == LOW) {
    if (playing) {
      playing = pause(playing);
    } else {
      playing = play(playing);
    };
  };
  // Serial.println(playbackButtonState);
  // delay(200);
  
  // if (vibeTitlesLoaded && page == PLAYABLES && !playablesLoaded && error == "") {
  //   playables = getPlayables(vibeTitles[0]);

  //   if (playables.size() > 0) {
  //     playablesLoaded = true;
  //   } else {
  //     error = "Failed to load playables. Try restarting Jukebox.";
  //   }; 
  // };
}