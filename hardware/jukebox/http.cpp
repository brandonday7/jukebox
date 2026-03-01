#include "http.h"
#include "config.h"

String makeUrl(String endpoint) {
    return SERVER_URL + endpoint;
};

String encodeUrlParam(String str) {
  String encodedStr = "";
  for (int i = 0; i < str.length(); i++) {
    char c = str[i];
    if (isAlphaNumeric(c) || c == '-' || c == '_' || c == '.' || c == '~') {
      encodedStr += c;
    } else {
      char buf[4];
      sprintf(buf, "%%%02X", (unsigned char)c);
      encodedStr += buf;
    }
  }
  return encodedStr;
}

HttpResponse get(String url) {
    HttpResponse response;
    HTTPClient http;
  
    Serial.println("GET: " + url);
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", API_KEY);
  
    int httpCode = http.GET();
    response.statusCode = httpCode;
    
    if (httpCode > 0) {
        response.body = http.getString();
        response.success = (httpCode >= 200 && httpCode < 300);
        
        if (response.success) {
        Serial.println("GET Success: " + String(httpCode));
        } else {
        Serial.println("GET Failed: " + String(httpCode));
        response.error = "HTTP Error: " + String(httpCode);
        }
    } else {
        response.success = false;
        response.error = http.errorToString(httpCode);
        Serial.println("GET Error: " + response.error);
    }
    
    http.end();
    return response;
}

HttpResponse post(String url, String jsonBody) {
    HttpResponse response;
    HTTPClient http;
    
    Serial.println("POST: " + url);

    if (jsonBody != "") {
        Serial.println("Body: " + jsonBody);
    }
    
    http.begin(url);
    
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", API_KEY);
    
    int httpCode = http.POST(jsonBody);
    response.statusCode = httpCode;
    
    if (httpCode > 0) {
        response.body = http.getString();
        response.success = (httpCode >= 200 && httpCode < 300);
        
        if (response.success) {
        Serial.println("POST Success: " + String(httpCode));
        } else {
        Serial.println("POST Failed: " + String(httpCode));
        response.error = "HTTP Error: " + String(httpCode);
        }
    } else {
        response.success = false;
        response.error = http.errorToString(httpCode);
        Serial.println("POST Error: " + response.error);
    }
    
    http.end();
    return response;
}

JsonDocument jsonParse(String jsonString) {
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, jsonString);

    if (error) {
        Serial.print("JSON Parse Error: ");
        Serial.println(error.c_str());
    }

    return doc;
}