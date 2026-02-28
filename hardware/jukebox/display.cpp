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

void printFullScreen(String message, bool autoDots) {
  tft.fillScreen(TFT_BLACK);
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

void showTitles(const char* titles[6], int highlightedIndex) {
  tft.fillScreen(TFT_BLACK);
  
  int lineHeight = tft.fontHeight() + 4;
  
  for (int i = 0; i < 6; i++) {
    tft.setCursor(10, 10 + i * lineHeight);

    if (i == highlightedIndex) {
      tft.setTextColor(TFT_WHITE, TFT_BLUE);
    } else {
      tft.setTextColor(TFT_WHITE, TFT_BLACK);
    }
    tft.print(titles[i]);
  }
}