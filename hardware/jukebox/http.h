#ifndef HTTP_H
#define HTTP_H

#include <Arduino.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

struct HttpResponse {
  int statusCode;
  String body;
  bool success;
  String error;
};

String makeUrl(String endpoint);
String encodeUrlParam(String str);
HttpResponse get(String url);
HttpResponse post(String url, String jsonBody = "");
JsonDocument jsonParse(String jsonString);

#endif