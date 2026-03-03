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
};

void connectToWiFi();
std::vector<String> getVibeTitles();
std::vector<Playable> getPlayables(String title);
std::vector<MenuOption> getPlayableOptions(std::vector<Playable> playables);
bool play(bool prev, String spId = "", String type = "");
bool pause(bool prev);

#endif