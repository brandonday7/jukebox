#ifndef DISPLAY_H
#define DISPLAY_H

#include <Arduino.h>
#include <TFT_eSPI.h>

struct MenuOption {
  String title;
  String subTitle;
};

void displayInit();
void changeScreenBrightness(int brightness);
void turnScreenOff();
void clearDisplay();
void printFullScreen(String message, bool large = false);

void renderMenu(std::vector<String> options, int highlightedIndex, int* maxDepthPtr);
void renderMenu(std::vector<MenuOption> options, int highlightedIndex, int* maxDepthPtr);
int getScrollBoundary(int numLines, int highlightedIndex, int* maxDepthPtr);
void resetMenuState();

std::vector<String> toMultiline(String str, int maxLines, int availableSpace = -1);
void renderNowPlaying(String title, String artistName, uint16_t* bufferPtr, int size);

void startLoading();
void stopLoading();
void renderLoading(int frame);

void renderIndicator(bool hide = false);
void traceTitleBorder(String title);

#endif