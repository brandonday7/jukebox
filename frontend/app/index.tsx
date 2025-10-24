import type { PlayableData, VibeData } from "../api/index";
import { useEffect, useState } from "react";
import {
  Button,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
  type ImageSourcePropType,
} from "react-native";
import Destroyer from "./Destroyer";
import Creator from "./Creator";
import { useVibeState } from "@/state/vibesState";
import { usePlaybackState } from "@/state/playbackState";

const Root = ScrollView;

const Index = () => {
  const { fetchVibes, vibes } = useVibeState();
  const { playing, play, pause, back, next } = usePlaybackState();

  const [selectedVibe, setSelectedVibe] = useState<VibeData>();
  const [selectedPlayable, setSelectedPlayable] = useState<PlayableData>();

  useEffect(() => {
    if (!vibes) {
      fetchVibes();
    }
  }, [vibes, fetchVibes]);

  // If the selected vibe or playable has been removed, un-select them.
  useEffect(() => {
    if (
      vibes &&
      selectedVibe &&
      !vibes.find((v) => v.title === selectedVibe.title)
    ) {
      setSelectedVibe(undefined);
    }

    if (
      selectedVibe &&
      selectedPlayable &&
      !selectedVibe.playables.find((p) => p.spId === selectedPlayable.spId)
    ) {
      setSelectedPlayable(undefined);
    }
  }, [vibes, selectedVibe, selectedPlayable]);

  return (
    <Root>
      {vibes ? (
        <View>
          {vibes.map((v) => (
            <View key={v.title}>
              <TouchableOpacity onPress={() => setSelectedVibe(v)}>
                <Text
                  style={
                    selectedVibe?.title === v.title
                      ? { backgroundColor: "#444", color: "white" }
                      : {}
                  }
                >
                  {v.title}
                </Text>
              </TouchableOpacity>
              {selectedVibe?.title === v.title ? (
                <View style={{ paddingLeft: 50, backgroundColor: "#ccc" }}>
                  {v.playables.map((p) => (
                    <TouchableOpacity
                      style={{ display: "flex", flexDirection: "row", gap: 10 }}
                      key={p.title}
                      onPress={() => setSelectedPlayable(p)}
                    >
                      {p.artworkUrl ? (
                        <Image
                          source={p.artworkUrl as ImageSourcePropType}
                          style={{ width: 20, height: 20, borderRadius: 4 }}
                        />
                      ) : null}
                      <Text
                        style={
                          selectedPlayable?.spId === p.spId
                            ? { backgroundColor: "#666", color: "white" }
                            : {}
                        }
                      >
                        {p.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          gap: 20,
          marginTop: 10,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button onPress={() => back()} title="Back" />
        <Button
          disabled={!playing && !selectedPlayable}
          onPress={() => {
            return playing
              ? pause()
              : selectedPlayable
              ? play(selectedPlayable.type, selectedPlayable.spId)
              : null;
          }}
          title={playing ? "Pause" : "Play"}
        />
        <Button onPress={() => next()} title="Next" />
      </View>
      <Destroyer vibe={selectedVibe} playable={selectedPlayable} />
      <Creator />
    </Root>
  );
};

export default Index;
