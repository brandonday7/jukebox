#ifndef METHODS_H
#define METHODS_H

#include <Arduino.h>
#include <vector> 

struct Playable {
  String title;
  String artistName;
  String type; // "album" or "playlist"
  String spId;
};

void connectToWiFi();
std::vector<String> getVibeTitles();
std::vector<Playable> getPlayables(String title);
bool play(bool prev, String spId = "", String type = "");
bool pause(bool prev);

#endif