#ifndef UI_H
#define UI_H

#include <Arduino.h>
#include <ESP32Encoder.h>

extern volatile bool playbackButtonPressed;
extern volatile bool backButtonPressed;
extern volatile bool encSwitchPressed;
extern ESP32Encoder encoder;

void uiInit();

#endif