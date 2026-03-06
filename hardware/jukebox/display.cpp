#include "display.h"

TFT_eSPI tft = TFT_eSPI();

String truncate(String str, int horizontalSpace = tft.width()) {
  if (tft.textWidth(str) <= horizontalSpace) {
    return str;
  }

  str += "...";
  while (tft.textWidth(str) > horizontalSpace) {
    str = str.substring(0, str.length() - 4) + "...";
  }
  return str;
}

String toUpperCase(String str) {
  std::transform(str.begin(), str.end(), str.begin(), ::toupper);
  return str;
}

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

void renderNowPlaying(String title, String artistName, uint16_t* bufferPtr, int size) {
  clearDisplay();
  int fileWidth = size;
  int fileHeight = size;
  int desiredSize = 100;
  int scale = desiredSize / size;
  // Depending on original file dimensions, image may not scale to exactly 100px;
  int renderedSize = size * scale;

  int padding = 15;
  int cursorX = padding;
  int cursorY = (tft.height() - renderedSize) / 2;

  for (int y = 0; y < fileHeight; y++) {
    for (int x = 0; x < fileWidth; x++) {
      uint16_t color = bufferPtr[y * fileWidth + x];
      tft.fillRect(cursorX + (x * scale), cursorY + (y * scale), scale, scale, color);
    }
  }

  int displayTextRoom = tft.width() - 3 * padding - renderedSize;
  // tft.setTextSize(2);
  int titleFontHeight = tft.fontHeight();
  int artistFontHeight = tft.fontHeight();
  int totalTextHeight = titleFontHeight + artistFontHeight + 4;

  int maxTitleLines = 2;
  int maxArtistLines = 1;
  int numLines = maxTitleLines + maxArtistLines;

  if (title.indexOf(" ") == -1) {
    tft.setCursor(2 * padding + renderedSize, (tft.height() - totalTextHeight) / 2);
    tft.print(truncate(title, displayTextRoom));
  } else {
    totalTextHeight += titleFontHeight + 4;
    std::vector<int> spaceIndices;
    for (int i = 0; i < title.length(); i++) {
      if (title[i] == ' ') {
        spaceIndices.insert(spaceIndices.begin(), i);
      }
    }

    String firstLine = title;
    int spaceIndex = 0;

    while (tft.textWidth(firstLine) > displayTextRoom) {
      if (spaceIndex < spaceIndices.size()) {
        firstLine = firstLine.substring(0, spaceIndices[spaceIndex]);
        spaceIndex++;
      } else {
        break;
      }
    }
    int textCursorX = 2 * padding + renderedSize;
    int textCursorY = (tft.height() - totalTextHeight) / 2;
    tft.setCursor(textCursorX, textCursorY);
    tft.print(firstLine);

    int titleHeight = titleFontHeight;
    if (firstLine != title) {
      tft.setCursor(textCursorX, textCursorY += titleFontHeight + 4);
      String secondLine = title.substring(spaceIndices[spaceIndex - 1] + 1, title.length());
      tft.print(truncate(secondLine, displayTextRoom));
      titleHeight += titleFontHeight;
    }

    tft.setTextSize(2);
    tft.setCursor(textCursorX, textCursorY += artistFontHeight + 4);
    tft.setTextColor(TFT_LIGHTGREY, TFT_BLACK);
    tft.print(truncate(artistName, displayTextRoom));
  }
}



