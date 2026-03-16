#include "methods.h"
#include "config.h"
#include "http.h"
#include "display.h"
#include <WiFi.h>
#include <cstdlib>
#include <ctime>
#include <set>

std::set<int> vibeIndexHistory;
std::set<int> playableIndexHistory;

void connectToWiFi() {
    printFullScreen("Jukebox starting...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while(WiFi.status() != WL_CONNECTED) {
        delay(100);
    }
}

void activateSpotifyDevice() {
    String url = makeUrl("/ping?activateDefaultDevice=true");
    HttpResponse res = get(url);
}

std::vector<String> getVibeTitles() {
    String url = makeUrl("/vibeTitles");
    HttpResponse res = get(url);
    std::vector<String> vibeTitles;

    if (res.success) {
        errorCount = 0;
        Serial.println(res.body);
        JsonDocument doc = jsonParse(res.body);
        JsonArray arr = doc["vibes"];

        for (int i = 0; i < arr.size(); i++) {
            vibeTitles.push_back(arr[i].as<String>());
        }
    } else {
        errorCount++;
    }
    return vibeTitles;
};

std::vector<Playable> getPlayables(String title) {
    String url = makeUrl("/vibe/" + encodeUrlParam(title));
    Serial.println(url);
    HttpResponse res = get(url);
    std::vector<Playable> playables;

    if (res.success) {
        errorCount = 0;
        Serial.println(res.body);
        JsonDocument doc = jsonParse(res.body);
        JsonArray arr = doc["playables"];

        for (int i = 0; i < arr.size(); i++) {
            Playable playable;
            playable.title = arr[i]["title"].as<String>();
            playable.type = arr[i]["type"].as<String>();
            playable.artistName = arr[i]["artistName"].as<String>();
            playable.spId = arr[i]["spId"].as<String>();
            playable.artworkUrl = arr[i]["artworkUrl"].as<String>();

            playables.push_back(playable);
        }
    } else {
        errorCount++;
    }
    return playables;
};

std::vector<MenuOption> getPlayableOptions(std::vector<Playable> playables) {
    std::vector<MenuOption> options;

    for (int i = 0; i < playables.size(); i++) {
        MenuOption option;
        option.title = playables[i].title;
        option.subTitle = playables[i].artistName;
        options.push_back(option);
    }
    return options;
}

void fetchPlayableArtwork(String artworkUrl, uint16_t* bufferPtr, int size) {
    String params = "?size=" + String(size);

    if (artworkUrl != "null" && artworkUrl.length() > 0) {
        params = params + "&imageUrl=" + encodeUrlParam(artworkUrl);
    }

    String url = makeUrl("/artwork" + params);
    HttpResponse res = get(url);

    if (res.success) {
        errorCount = 0;
        JsonDocument doc = jsonParse(res.body);
        JsonArray pixels = doc["pixels"];
        for (int i = 0; i < size * size; i++) {
            bufferPtr[i] = pixels[i].as<uint16_t>();
        }
    } else {
        errorCount++;
    }
}

// Playback methods
bool play(bool prev, String spId, String type) {
    String url = makeUrl("/play");
    StaticJsonDocument<50> body;
    body["spId"] = spId;
    body["type"] = type;

    char bodyJsonBuffer[60]; // Create a character array to store the JSON string
    serializeJson(body, bodyJsonBuffer); // Serialize the JsonDocument to the buffer

    HttpResponse res = post(url, bodyJsonBuffer);

    if (res.success) {
        errorCount = 0;
        JsonDocument doc = jsonParse(res.body);
        return doc["playing"];
    } else {
        errorCount++;
    }
    printFullScreen("The specified playback device inaccessible to our app right now. If you wish to listen on this device, try initiating playback from the Spotify app directly.");
    return prev;
};

bool pause(bool prev) {
    String url = makeUrl("/pause");
    HttpResponse res = post(url);

    if (res.success) {
        errorCount = 0;
        JsonDocument doc = jsonParse(res.body);
        return doc["playing"];
    } else {
        errorCount++;
    }
    return prev;
};

int selectFreshRandomIndex(int size, std::set<int>* unavailableIndices) {
    int min = 0;
    int max = size - 1;
    bool choosing = true;
    int index = -1;

    if (unavailableIndices->size() >= size) {
        unavailableIndices->clear();
    }
    while (choosing) {
        index = rand() % (max - min + 1) + min;
        if (unavailableIndices->count(index) == 0) {
            choosing = false;
        }
    }
    unavailableIndices->insert(index);
    return index;
}

int selectRandomVibe(int size) {
    return selectFreshRandomIndex(size, &vibeIndexHistory);
}
void clearVibeHistory() {
    vibeIndexHistory.clear();
}

int selectRandomPlayable(int size) {
    return selectFreshRandomIndex(size, &playableIndexHistory);
}
void clearPlayableHistory() {
    playableIndexHistory.clear();
}

