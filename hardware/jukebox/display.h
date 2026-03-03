#ifndef DISPLAY_H
#define DISPLAY_H

#include <Arduino.h>
#include <TFT_eSPI.h>

struct MenuOption {
  String title;
  String subTitle;
};

void displayInit();
void clearDisplay();
void printFullScreen(String message, bool autoDots = false);

void renderMenu(std::vector<String> options, int highlightedIndex, int* maxDepthPtr);
void renderMultilineMenu(std::vector<MenuOption> options, int highlightedIndex, int* maxDepthPtr);
#endif