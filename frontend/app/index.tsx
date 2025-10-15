import { useEffect, useState } from "react";
import { Button, Text, View, TouchableOpacity } from "react-native";

const Root = View;

type PlayableType = "album" | "playlist";
interface PlayableData {
  type: PlayableType;
  title: string;
  artworkUrl?: string;
  artistName: string;
  spId: string;
}

const Index = () => {
  const [playing, setPlaying] = useState(false);
  const [vibes, setVibes] =
    useState<{ title: string; playables: PlayableData[] }[]>();
  const [selectedVibe, setSelectedVibe] = useState<string>();
  const [selectedPlayable, setSelectedPlayable] = useState<PlayableData>();

  const fetchVibes = async () => {
    const vibes = await fetch("http://localhost:3000/vibes");
    setVibes(await vibes.json());
  };

  const play = async (playable: PlayableData) => {
    await fetch(
      `http://localhost:3000/play?type=${playable.type}&spId=${playable.spId}`
    );
    setPlaying(true);
  };

  const pause = async () => {
    await fetch("http://localhost:3000/pause");
    setPlaying(false);
  };

  const back = async () => {
    await fetch("http://localhost:3000/back");
    setPlaying(false);
  };

  const next = async () => {
    await fetch("http://localhost:3000/next");
    setPlaying(false);
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
              <TouchableOpacity onPress={() => setSelectedVibe(v.title)}>
                <Text
                  style={
                    selectedVibe === v.title
                      ? { backgroundColor: "#444", color: "white" }
                      : {}
                  }
                >
                  {v.title}
                </Text>
              </TouchableOpacity>
              {selectedVibe === v.title ? (
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
        <Button onPress={() => back()} title="Back"></Button>
        <Button
          disabled={!playing && !selectedPlayable}
          onPress={() => {
            return playing
              ? pause()
              : selectedPlayable
              ? play(selectedPlayable)
              : null;
          }}
          title={playing ? "Pause" : "Play"}
        ></Button>
        <Button onPress={() => next()} title="Next"></Button>
      </View>
    </Root>
  );
};

export default Index;
