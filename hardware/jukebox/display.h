#ifndef DISPLAY_H
#define DISPLAY_H

#include <Arduino.h>
#include <TFT_eSPI.h>

void displayInit();
void clearDisplay();
void printFullScreen(String message, bool autoDots = false);
void showMenu(std::vector<String> options, int highlightedIndex, int* maxDepthPtr);

#endif