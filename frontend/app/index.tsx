import {
  back,
  getVibes,
  next,
  pause,
  play,
  type PlayableData,
  type VibeData,
} from "../api/index";
import { useEffect, useState } from "react";
import { Button, Text, View, TouchableOpacity } from "react-native";

const Root = View;

const Index = () => {
  const [playing, setPlaying] = useState(false);
  const [vibes, setVibes] = useState<VibeData[]>();
  const [selectedVibe, setSelectedVibe] = useState<VibeData>();
  const [selectedPlayable, setSelectedPlayable] = useState<PlayableData>();

  const fetchVibes = async () => {
    const vibes = await getVibes();
    setVibes(vibes);
  };

  const playSelectedPlayable = async (playable: PlayableData) => {
    const { playing } = await play(playable.type, playable.spId);
    setPlaying(playing);
  };

  const pausePlayback = async () => {
    const { playing } = await pause();
    setPlaying(playing);
  };

  const previousTrack = async () => {
    const { playing } = await back();
    setPlaying(playing);
  };

  const nextTrack = async () => {
    const { playing } = await next();
    setPlaying(playing);
  };

  useEffect(() => {
    if (!vibes) {
      fetchVibes();
    }
  }, [vibes]);

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
                      key={p.title}
                      onPress={() => {
                        setPlaying(false);
                        setSelectedPlayable(p);
                      }}
                    >
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
        <Button onPress={() => previousTrack()} title="Back"></Button>
        <Button
          disabled={!playing && !selectedPlayable}
          onPress={() => {
            return playing
              ? pausePlayback()
              : selectedPlayable
              ? playSelectedPlayable(selectedPlayable)
              : null;
          }}
          title={playing ? "Pause" : "Play"}
        ></Button>
        <Button onPress={() => nextTrack()} title="Next"></Button>
      </View>
    </Root>
  );
};

export default Index;
