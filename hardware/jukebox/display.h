#ifndef DISPLAY_H
#define DISPLAY_H

#include <Arduino.h>
#include <TFT_eSPI.h>

void displayInit();
void clearDisplay();
void printFullScreen(String message, bool autoDots = false);
void showTitles(const char* titles[6], int highlightedIndex);

#endif