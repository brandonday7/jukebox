#ifndef UI_H
#define UI_H

#include <Arduino.h>
#include <ESP32Encoder.h>

extern volatile bool playbackButtonPressed;
extern volatile bool backButtonPressed;
extern bool shiftLatched;
extern bool shiftPressed;
extern volatile bool encSwitchPressed;

extern ESP32Encoder encoder;

void uiInit();
void onUiAction(long unsigned* lastActivityTime, bool* screenDimmedPtr);
void processShiftPress();

#endif