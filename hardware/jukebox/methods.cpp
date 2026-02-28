#include "methods.h"
#include "config.h"
#include "http.h"
#include "display.h"
#include <WiFi.h>

void connectToWiFi() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    printFullScreen("Connecting to WiFi", true);

    while(WiFi.status() != WL_CONNECTED) {
        delay(100);
    }

    clearDisplay();
}

std::vector<String> getVibeTitles() {
    String url = makeUrl("/vibeTitles");
    HttpResponse res = get(url);
    std::vector<String> vibeTitles;

    if (res.success) {
        Serial.println(res.body);
        JsonDocument doc = jsonParse(res.body);
        JsonArray arr = doc["vibes"];

        for (int i = 0; i < arr.size(); i++) {
            vibeTitles.push_back(arr[i].as<String>());
        }
    };
    return vibeTitles;
};

std::vector<Playable> getPlayables(String title) {
    String url = makeUrl("/vibe/" + title);
    HttpResponse res = get(url);
    std::vector<Playable> playables;

    if (res.success) {
        Serial.println(res.body);
        JsonDocument doc = jsonParse(res.body);
        JsonArray arr = doc["playables"];

        for (int i = 0; i < arr.size(); i++) {
            Playable playable;
            playable.title = arr[i]["title"].as<String>();
            playable.type = arr[i]["type"].as<String>();
            playable.artistName = arr[i]["artistName"].as<String>();
            playable.spId = arr[i]["spId"].as<String>();

            playables.push_back(playable);
        }
    };
    return playables;
};

// Playback methods
bool play(bool prev, String spId, String type) {
    String url = makeUrl("/play");
    StaticJsonDocument<50> body;
    body["spId"] = spId;
    body["type"] = type;

    char bodyJsonBuffer[50]; // Create a character array to store the JSON string
    serializeJson(body, bodyJsonBuffer); // Serialize the JsonDocument to the buffer

    HttpResponse res = post(url, bodyJsonBuffer);

    if (res.success) {
        JsonDocument doc = jsonParse(res.body);
        return doc["playing"];
    };
    return prev;
};

bool pause(bool prev) {
    String url = makeUrl("/pause");
    HttpResponse res = post(url);

    if (res.success) {
        JsonDocument doc = jsonParse(res.body);
        return doc["playing"];
    };
    return prev;
};