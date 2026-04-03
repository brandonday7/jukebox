#ifndef UI_H
#define UI_H

#include <Arduino.h>
#include <ESP32Encoder.h>

extern bool playbackButtonPressed;
extern bool backButtonPressed;
extern bool shiftButtonPressed;
extern bool shiftButtonLatched;
extern bool encSwitchPressed;

extern ESP32Encoder encoder;

void uiInit();
void onUiAction(long unsigned* lastActivityTime, bool* screenDimmedPtr);
void processPlaybackPress();
void processBackPress();
void processEncSwitchPress();
void processShiftPress();

#endif