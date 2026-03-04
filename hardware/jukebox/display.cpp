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

// Vibe titles
void renderMenu(std::vector<String> options, int highlightedIndex, int* maxDepthPtr) {
  int optionHeight = tft.fontHeight() + 4;
  int numLines = std::floor(tft.height() / optionHeight);
  numLines = std::min(numLines, static_cast<int>(options.size()));
  int lowerLimit = getScrollBoundary(numLines, highlightedIndex, maxDepthPtr);
  
  clearDisplay();

  for (int i = 0; i < numLines; i++) {
    tft.setCursor(0, i * optionHeight);

    if (i + lowerLimit == highlightedIndex) {
      tft.setTextColor(TFT_BLACK, TFT_WHITE);
    } else {
      tft.setTextColor(TFT_WHITE, TFT_BLACK);
    }
    tft.print(truncate(options[i + lowerLimit]));
  }
}

// Playable titles
void renderMenu(std::vector<MenuOption> options, int highlightedIndex, int* maxDepthPtr) {
  int lineHeight = tft.fontHeight();
  int optionHeight = 2 * lineHeight + 12;
  int numLines = std::floor(tft.height() / optionHeight);
  numLines = std::min(numLines, static_cast<int>(options.size()));
  int lowerLimit = getScrollBoundary(numLines, highlightedIndex, maxDepthPtr);
  
  clearDisplay();

  for (int i = 0; i < numLines; i++) {
    int cursorY = i * optionHeight;
    tft.setCursor(0, cursorY);

    if (i + lowerLimit == highlightedIndex) {
      tft.setTextColor(TFT_BLACK, TFT_WHITE);
    } else {
      tft.setTextColor(TFT_WHITE, TFT_BLACK);
    }
    tft.print(truncate(options[i + lowerLimit].title));

    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.setCursor(0, cursorY += lineHeight + 4);
    tft.print(truncate(options[i + lowerLimit].subTitle));

    tft.fillRect(0, cursorY += lineHeight + 2, tft.width(), 2, TFT_WHITE);
  }
}

int getScrollBoundary(int numLines, int highlightedIndex, int* maxDepthPtr) {
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
  }

  return lowerLimit;
}