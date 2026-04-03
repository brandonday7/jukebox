#include "ui.h"
#include "display.h"
#include <ESP32Encoder.h>

#define PLAYBACK_BUTTON_PIN 4
#define BACK_BUTTON_PIN 5
#define SHIFT_BUTTON_PIN 27
#define ENC_SW_PIN 13
#define ENC_A_PIN 26
#define ENC_B_PIN 25
#define DEBOUNCE_MS 50

volatile bool playbackButtonChanged = false;
volatile unsigned long lastPlaybackIsrTime = 0;
bool playbackButtonLatched = false;
bool playbackButtonPressed = false;

volatile bool backButtonChanged = false;
volatile unsigned long lastBackIsrTime = 0;
bool backButtonLatched = false;
bool backButtonPressed = false;

volatile bool shiftButtonChanged = false;
unsigned long lastShiftIsrTime = 0;
bool shiftButtonLatched = false;
bool shiftButtonPressed = false;

volatile bool encSwitchChanged = false;
volatile unsigned long lastEncSwitchIsrTime = 0;
bool encSwitchLatched = false;
bool encSwitchPressed = false;

ESP32Encoder encoder;

void IRAM_ATTR playbackButtonISR() {
  playbackButtonChanged = true;
}

void IRAM_ATTR backButtonISR() {
  backButtonChanged = true;
}

void IRAM_ATTR shiftButtonISR() {
  shiftButtonChanged = true;
}

void IRAM_ATTR encSwitchISR() {
  encSwitchChanged = true;
}

void uiInit() {
  pinMode(PLAYBACK_BUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PLAYBACK_BUTTON_PIN), playbackButtonISR, CHANGE);

  pinMode(BACK_BUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(BACK_BUTTON_PIN), backButtonISR, CHANGE);

  pinMode(SHIFT_BUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(SHIFT_BUTTON_PIN), shiftButtonISR, CHANGE);

  pinMode(ENC_SW_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_SW_PIN), encSwitchISR, CHANGE);

  ESP32Encoder::useInternalWeakPullResistors = puType::up;
  encoder.attachSingleEdge(ENC_A_PIN, ENC_B_PIN);
  encoder.setCount(0);
  encoder.setFilter(1023);
}

void onUiAction(long unsigned* lastActivityTime, bool* screenDimmedPtr) {
  *lastActivityTime = millis();

  bool screenDimmed = *screenDimmedPtr == true;
  if (screenDimmed) {
    changeScreenBrightness(63);
    *screenDimmedPtr = false;
  }
}

void processPlaybackPress() {
  unsigned long now = millis();
  if (playbackButtonChanged && now - lastPlaybackIsrTime > DEBOUNCE_MS) {
    playbackButtonChanged = false;
    lastPlaybackIsrTime = now;

    bool pinState = digitalRead(PLAYBACK_BUTTON_PIN);

    if (pinState == LOW && !playbackButtonLatched) {
      playbackButtonLatched = true;
      playbackButtonPressed = true;
    } else if (pinState == HIGH && playbackButtonLatched) {
      playbackButtonLatched = false;
    }
  }
}


void processBackPress() {
  unsigned long now = millis();
  if (backButtonChanged && now - lastBackIsrTime > DEBOUNCE_MS) {
    backButtonChanged = false;
    lastBackIsrTime = now;

    bool pinState = digitalRead(BACK_BUTTON_PIN);

    if (pinState == LOW && !backButtonLatched) {
      backButtonLatched = true;
      backButtonPressed = true;
    } else if (pinState == HIGH && backButtonLatched) {
      backButtonLatched = false;
    }
  }
}

void processEncSwitchPress() {
  unsigned long now = millis();
  if (encSwitchChanged && now - lastEncSwitchIsrTime > DEBOUNCE_MS) {
    encSwitchChanged = false;
    lastEncSwitchIsrTime = now;

    bool pinState = digitalRead(ENC_SW_PIN);

    if (pinState == LOW && !encSwitchLatched) {
      encSwitchLatched = true;
      encSwitchPressed = true;
    } else if (pinState == HIGH && encSwitchLatched) {
      encSwitchLatched = false;
    }
  }
}


void processShiftPress() {
  unsigned long now = millis();
  if (shiftButtonChanged && now - lastShiftIsrTime > DEBOUNCE_MS) {
    shiftButtonChanged = false;
    lastShiftIsrTime = now;

    bool pinState = digitalRead(SHIFT_BUTTON_PIN);

    if (pinState == LOW && !shiftButtonLatched) {
      shiftButtonLatched = true;
      shiftButtonPressed = true;
    } else if (pinState == HIGH && shiftButtonLatched) {
      shiftButtonLatched = false;
    }
  }
}