#include "ui.h"
#include <ESP32Encoder.h>

#define PLAYBACK_BUTTON_PIN 4
#define BACK_BUTTON_PIN 5
#define ENC_SW_PIN 13
#define ENC_A_PIN 26
#define ENC_B_PIN 25

volatile bool playbackButtonPressed = false;
volatile unsigned long lastPlaybackIsrTime = 0;

volatile bool backButtonPressed = false;
volatile unsigned long lastBackIsrTime = 0;

volatile bool encSwitchPressed = false;
volatile unsigned long lastEncSwitchIsrTime = 0;

ESP32Encoder encoder;

void IRAM_ATTR playbackButtonISR() {
  unsigned long now = millis();
  if (now - lastPlaybackIsrTime > 200) {
    playbackButtonPressed = true;
    lastPlaybackIsrTime = now;
  }
}

void IRAM_ATTR backButtonISR() {
  unsigned long now = millis();
  if (now - lastBackIsrTime > 200) {
    backButtonPressed = true;
    lastBackIsrTime = now;
  }
}

void IRAM_ATTR encSwitchISR() {
  unsigned long now = millis();
  if (now - lastEncSwitchIsrTime > 200) {
    encSwitchPressed = true;
    lastEncSwitchIsrTime = now;
  }
}

void uiInit() {
  pinMode(PLAYBACK_BUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PLAYBACK_BUTTON_PIN), playbackButtonISR, FALLING);

  pinMode(BACK_BUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(BACK_BUTTON_PIN), backButtonISR, FALLING);

  pinMode(ENC_SW_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_SW_PIN), encSwitchISR, FALLING);

  ESP32Encoder::useInternalWeakPullResistors = puType::up;
  encoder.attachSingleEdge(ENC_A_PIN, ENC_B_PIN);
  encoder.setCount(0);
  encoder.setFilter(1023);
}