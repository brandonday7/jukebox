import { usePlaybackState } from "@/state/playbackState";
import { useVibeState } from "@/state/vibesState";
import { useLocalSearchParams } from "expo-router";
import { Alert, Text } from "react-native";
import { styled } from "styled-components/native";
import Artwork from "./common/Artwork";
import Header from "./common/Header";
import type { PlayableData } from "@/api";
import ColorHash from "color-hash";
import { toHSLA } from "./helpers";
import { usePlayerSheet } from "./contexts/PlayerSheetContext";

const colorHash = new ColorHash();

const Root = styled.ScrollView<{ color: string }>`
  background-color: ${({ color }) => color};
`;

const PlayablesContainer = styled.View`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  padding-vertical: 15px;
  gap: 15px;
`;

const PressablePlayable = styled.TouchableOpacity`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  max-width: 170px;
`;

const DummyPlayable = styled.View`
  flex-grow: 1;
  max-width: 170px;
`;

const Details = styled.View`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const PlayableName = styled.Text`
  color: black;
  font-size: 16px;
`;

const ArtistName = styled.Text`
  color: #444;
  font-size: 14px;
`;

const Vibe = () => {
  const { name } = useLocalSearchParams();
  const { vibes, setSelectedPlayable, removePlayable } = useVibeState();
  const { play } = usePlaybackState();
  const { openSheet } = usePlayerSheet();

  const onSelect = (playable: PlayableData) => {
    play(playable.type, playable.spId);
    setSelectedPlayable(playable);
    openSheet();
  };

  const vibe = vibes?.find((v) => v.title === name);

  if (!vibe) {
    return <Text>No vibe {name} exists.</Text>;
  }

  const { playables } = vibe;
  const color = colorHash.hsl(vibe.title);

  return (
    <Root color={toHSLA(...color, 0.5)}>
      <Header
        title={vibe.title}
        mixItUp={() =>
          onSelect(playables[Math.floor(Math.random() * playables.length)])
        }
      />
      <PlayablesContainer>
        {playables.map((playable) => (
          <PressablePlayable
            key={playable.spId}
            onPress={() => onSelect(playable)}
            onLongPress={() => {
              Alert.alert(
                "Remove playable",
                `Are you sure you want to remove '${playable.title}' from ${vibe.title}?`,
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Remove",
                    onPress: () => removePlayable(vibe.title, playable.spId),
                    style: "default",
                  },
                ]
              );
            }}
          >
            <Artwork
              url={playable.artworkUrl}
              title={`${playable.title} - ${playable.artistName}`}
            />
            <Details>
              <PlayableName numberOfLines={1}>{playable.title}</PlayableName>
              <ArtistName numberOfLines={1}>{playable.artistName}</ArtistName>
            </Details>
          </PressablePlayable>
        ))}
        {playables.length % 2 === 1 ? <DummyPlayable /> : null}
      </PlayablesContainer>
    </Root>
  );
};

export default Vibe;
