#include "display.h"

TFT_eSPI tft = TFT_eSPI();

void displayInit() {
  tft.begin();
  tft.setRotation(1);

  printFullScreen("Jukebox starting", true);
  delay(1000);
}

void clearDisplay() {
  tft.fillScreen(TFT_BLACK);
}

String truncate(String str) {
  int screenWidth = tft.width();
  if (tft.textWidth(str) <= screenWidth) {
    return str;
  }
  
  str += "...";
  while (tft.textWidth(str) > screenWidth) {
    str = str.substring(0, str.length() - 4) + "...";
  }
  return str;
}

void printFullScreen(String message, bool autoDots) {
  clearDisplay();
  tft.setTextColor(TFT_WHITE);
  int cursorX = 20;
  int cursorY = 60;
  tft.setTextSize(2);
  tft.setCursor(cursorX, cursorY);

  if (autoDots) {
    String dotsMessage = "";
    for (int i = 0; i < 3; i++) {
      dotsMessage += ".";
      tft.fillRect(cursorX, cursorY, tft.textWidth(message + "..."), tft.fontHeight(), TFT_BLACK);
      tft.setCursor(cursorX, cursorY);
      tft.print(message + dotsMessage);
      delay(500);
    }
  } else {
    tft.print(message);
  }
}

void showMenu(std::vector<String> options, int highlightedIndex, int* maxDepthPtr) {
  clearDisplay();
  
  int lineHeight = tft.fontHeight() + 4;
  int numLines = std::floor(tft.height() / lineHeight);
  int lowerLimit = 0;
  int upperLimit = numLines - 1;
  int maxDepth = *maxDepthPtr;

  maxDepth = std::max(highlightedIndex, maxDepth);

  if (highlightedIndex < maxDepth - upperLimit) {
    maxDepth = highlightedIndex + upperLimit;
  }

  *maxDepthPtr = maxDepth;

  int indexOffset = maxDepth - upperLimit;

  if (indexOffset > 0) {
    lowerLimit += indexOffset;
    upperLimit += indexOffset;
  }
  
  for (int i = 0; i < numLines; i++) {
    tft.setCursor(0, i * lineHeight);

    if (i + lowerLimit == highlightedIndex) {
      tft.setTextColor(TFT_BLACK, TFT_WHITE);
    } else {
      tft.setTextColor(TFT_WHITE, TFT_BLACK);
    }
    tft.print(truncate(options[i + lowerLimit]));
  }
}