#include "display.h"

TFT_eSPI tft = TFT_eSPI();
volatile bool isLoading = false;
TaskHandle_t animTaskHandle = NULL;

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
  if (isLoading) {
    return;
  }

  tft.fillScreen(TFT_BLACK);
}

void printFullScreen(String message) {
  if (isLoading) {
    return;
  }

  clearDisplay();
  tft.setTextColor(TFT_WHITE);
  tft.setTextDatum(MC_DATUM);
  tft.setTextSize(2);

  tft.drawString(message, tft.width() / 2, tft.height() / 2);
  tft.setTextDatum(TL_DATUM);
}

// Vibe titles
void renderMenu(std::vector<String> options, int highlightedIndex, int* maxDepthPtr) {
  if (isLoading) {
    return;
  }

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
  if (isLoading) {
    return;
  }

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
  if (isLoading) {
    return;
  }

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
  // tft.setTextSize(3);
  int titleFontHeight = tft.fontHeight();
  int artistFontHeight = tft.fontHeight();

  std::vector<String> titleLines = toMultiline(title, 3, displayTextRoom);
  std::vector<String> artistLines = toMultiline(artistName, 3, displayTextRoom);

  int totalTextHeight = 0;
  for (int i = 0; i < titleLines.size(); i++) {
    totalTextHeight += titleFontHeight + 4;
  }
  for (int i = 0; i < artistLines.size(); i++) {
    totalTextHeight += artistFontHeight + 4;
  }

  int textCursorX = 2 * padding + renderedSize;
  int textCursorY = (tft.height() - totalTextHeight) / 2;

  for (int i = 0; i < titleLines.size(); i++) {
    tft.setCursor(textCursorX, textCursorY);
    tft.print(titleLines[i]);
    textCursorY += titleFontHeight + 4;
  }

  tft.setTextColor(TFT_LIGHTGREY, TFT_BLACK);

  for (int i = 0; i < artistLines.size(); i++) {
    tft.setCursor(textCursorX, textCursorY);
    tft.print(artistLines[i]);
    textCursorY += titleFontHeight + 4;
  }
}

std::vector<String> toMultiline(String str, int maxLines, int availableSpace) {
  if (availableSpace == -1) {
    availableSpace = tft.width();
  }
  std::vector<String> lines;

  while (str.length() && lines.size() <= maxLines) {
    std::vector<int> spaceIndices;
    for (int i = 0; i < str.length(); i++) {
      if (str[i] == ' ') {
        spaceIndices.insert(spaceIndices.begin(), i);
      }
    }

    if (spaceIndices.size() == 0 || lines.size() == maxLines - 1) {
      lines.push_back(truncate(str, availableSpace));
      str = "";
      break;
    }

    String nextWord = str.substring(0, spaceIndices[spaceIndices.size() - 1]);
    if (tft.textWidth(nextWord) > availableSpace) {
        lines.push_back(truncate(str, availableSpace));
        str = "";
        break;
    }

    String line = str;
    int spaceIndex = 0;

    while (tft.textWidth(line) > availableSpace) {
      if (spaceIndex < spaceIndices.size()) {
        line = line.substring(0, spaceIndices[spaceIndex]);
        spaceIndex++;
      } else {
        break;
      }
    }

    lines.push_back(line);
    str = str.substring(line.length());
    str.trim();
  }

  return lines;
}

void animationTask(void* param) {
  int frame = 0;
  while (isLoading) {
      renderLoading(frame);
      frame = (frame + 1) % 4;
      vTaskDelay(200 / portTICK_PERIOD_MS);
  }
  vTaskDelete(NULL);
}

void startLoading() {
  if (!isLoading) {
    clearDisplay();
    isLoading = true;
    xTaskCreatePinnedToCore(animationTask, "loading", 4096, NULL, 1, &animTaskHandle, 0);
  }
}

void stopLoading() {
  isLoading = false;
  vTaskDelay(50 / portTICK_PERIOD_MS);  // let animation task exit cleanly
  clearDisplay();
}

void renderLoading(int frame) {
  // int speed = 400;
  int width = 30;
  int height = 30;
  int smR = 5;
  int lgR = 10;
  int cursorX = (tft.width() - width) / 2;
  int cursorY = (tft.height() - height) / 2;

  tft.fillCircle(cursorX, cursorY, smR, TFT_WHITE);
  tft.fillCircle(cursorX + width, cursorY, smR, TFT_WHITE);
  tft.fillCircle(cursorX + width, cursorY + height, smR, TFT_WHITE);
  tft.fillCircle(cursorX, cursorY + width, smR, TFT_WHITE);
  // Offset starting position to top-right circle.
  // int count = 0;
  // int maxCount = delayTime / speed;

  if (frame == 0) {
    tft.fillCircle(cursorX, cursorY + width, lgR, TFT_BLACK);
    tft.fillCircle(cursorX, cursorY + width, smR, TFT_WHITE);
    tft.fillCircle(cursorX, cursorY, lgR, TFT_WHITE);
  } else if (frame == 1) {
    tft.fillCircle(cursorX, cursorY, lgR, TFT_BLACK);
    tft.fillCircle(cursorX, cursorY, smR, TFT_WHITE);
    tft.fillCircle(cursorX + width, cursorY, lgR, TFT_WHITE);
  } else if (frame == 2) {
    tft.fillCircle(cursorX + width, cursorY, lgR, TFT_BLACK);
    tft.fillCircle(cursorX + width, cursorY, smR, TFT_WHITE);
    tft.fillCircle(cursorX + width, cursorY + height, lgR, TFT_WHITE);
  } else {
    tft.fillCircle(cursorX, cursorY + width, lgR, TFT_WHITE);
    tft.fillCircle(cursorX + width, cursorY + height, lgR, TFT_BLACK);
    tft.fillCircle(cursorX + width, cursorY + height, smR, TFT_WHITE);
  }

  return;
}

// void renderLoading(int delayTime) {
//   clearDisplay();
//   int speed = 400;
//   int width = 30;
//   int height = 30;
//   int smR = 5;
//   int lgR = 10;
//   int cursorX = (tft.width() - width) / 2;
//   int cursorY = (tft.height() - height) / 2;

//   tft.fillCircle(cursorX, cursorY, smR, TFT_WHITE);
//   tft.fillCircle(cursorX + width, cursorY, lgR, TFT_WHITE);
//   tft.fillCircle(cursorX + width, cursorY + height, smR, TFT_WHITE);
//   tft.fillCircle(cursorX, cursorY + width, smR, TFT_WHITE);
//   // Offset starting position to top-right circle.
//   int count = 0;
//   int maxCount = delayTime / speed;

//   while (count < maxCount) {
//     count++;
//     int largeIndex = count % 4;

//     if (largeIndex == 0) {
//       tft.fillCircle(cursorX, cursorY + width, lgR, TFT_BLACK);
//       tft.fillCircle(cursorX, cursorY + width, smR, TFT_WHITE);
//       tft.fillCircle(cursorX, cursorY, lgR, TFT_WHITE);
//     } else if (largeIndex == 1) {
//       tft.fillCircle(cursorX, cursorY, lgR, TFT_BLACK);
//       tft.fillCircle(cursorX, cursorY, smR, TFT_WHITE);
//       tft.fillCircle(cursorX + width, cursorY, lgR, TFT_WHITE);
//     } else if (largeIndex == 2) {
//       tft.fillCircle(cursorX + width, cursorY, lgR, TFT_BLACK);
//       tft.fillCircle(cursorX + width, cursorY, smR, TFT_WHITE);
//       tft.fillCircle(cursorX + width, cursorY + height, lgR, TFT_WHITE);
//     } else {
//       tft.fillCircle(cursorX, cursorY + width, lgR, TFT_WHITE);
//       tft.fillCircle(cursorX + width, cursorY + height, lgR, TFT_BLACK);
//       tft.fillCircle(cursorX + width, cursorY + height, smR, TFT_WHITE);
//     }
//     delay(speed);
//   }
//   return;
// }

