#include "display.h"

TFT_eSPI tft = TFT_eSPI();

void displayInit() {
  tft.begin();
  clearDisplay();
  tft.setRotation(1);
  tft.setTextFont(1);
  tft.setTextSize(2);
  printFullScreen("Jukebox starting...");
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

void printFullScreen(String message) {
  clearDisplay();
  tft.setTextColor(TFT_WHITE);
  tft.setTextDatum(MC_DATUM);
  tft.setTextSize(2);

  tft.drawString(message, tft.width() / 2, tft.height() / 2);
  tft.setTextDatum(TL_DATUM);
}

// Vibe titles
void renderMenu(std::vector<String> options, int highlightedIndex, int* maxDepthPtr) {
  tft.setTextSize(2);
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
    String artistName = options[i + lowerLimit].subTitle;
    tft.setTextColor(TFT_LIGHTGREY, TFT_BLACK);
    tft.print(truncate(toUpperCase(artistName)));

    tft.fillRect(0, cursorY += lineHeight + 2, tft.width(), 2, TFT_WHITE);
    tft.setTextSize(2);
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

String toUpperCase(String str) {
  std::transform(str.begin(), str.end(), str.begin(), ::toupper);
  return str;
}


void renderNowPlaying(String title, String artistName, uint16_t* bufferPtr, int size) {
  clearDisplay();
  int scale = 100 / size;
  int imgWidth = size;
  int imgHeight = size;
  int cursorX = 30;
  int cursorY = 70;

  for (int y = 0; y < imgHeight; y++) {
    for (int x = 0; x < imgWidth; x++) {
      uint16_t color = bufferPtr[y * imgWidth + x];
      tft.fillRect(cursorX + (x * scale), cursorY + (y * scale), scale, scale, color);
    }
  }
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setCursor(140, 115);
  tft.print(title);
}



