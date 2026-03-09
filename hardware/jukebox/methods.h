#ifndef METHODS_H
#define METHODS_H

#include <Arduino.h>
#include <vector> 
#include "display.h"

struct Playable {
  String title;
  String artistName;
  String type; // "album" or "playlist"
  String spId;
  String artworkUrl;
};

void connectToWiFi();
void activateSpotifyDevice();
std::vector<String> getVibeTitles();
std::vector<Playable> getPlayables(String title);
std::vector<MenuOption> getPlayableOptions(std::vector<Playable> playables);
void fetchPlayableArtwork(String artworkUrl, uint16_t* bufferPtr, int size = 10);
bool play(bool prev, String spId = "", String type = "");
bool pause(bool prev);

template <typename T>
T withLoading(std::function<T()> httpFn) {
  startLoading();
  T result = httpFn();
  stopLoading();
  return result;
}

// Void specialization of withLoading
inline void withLoading(std::function<void()> httpFn) {
  startLoading();
  httpFn();
  stopLoading();
}
#endif