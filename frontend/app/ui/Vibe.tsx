import { usePlaybackState } from "@/state/playbackState";
import { useVibeState } from "@/state/vibesState";
import { useLocalSearchParams } from "expo-router";
import { Alert, Text } from "react-native";
import { styled } from "styled-components/native";
import Artwork from "./common/Artwork";
import Header from "./common/Header";
import type { PlayableData } from "@/api";
import colorHash, { lighter } from "./helpers/color";
import { usePlayer } from "./Player/PlayerContext";
import { useRef } from "react";
import Editor, { type BottomSheetRef } from "./Editor";
import { useThemeState } from "@/state/themeState";

const Root = styled.ScrollView<{ color: string }>`
  background-color: ${({ color }) => color};
`;

const PlayablesContainer = styled.View<{ playing: boolean }>`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 15px;
  gap: 15px;
  padding-bottom: ${({ playing }) => (playing ? 95 : 15)}px;
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
  const { vibes, setSelectedPlayable, removePlayable, selectedPlayable } =
    useVibeState();
  const { colorValues, setColorValues } = useThemeState();
  const { play } = usePlaybackState();
  const { open } = usePlayer();
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const onSelect = (playable: PlayableData) => {
    play(playable.type, playable.spId);
    setSelectedPlayable(playable);
    setColorValues(colorHash.hsl(playable.title));
    open();
  };

  const vibe = vibes?.find((v) => v.title === name);

  if (!vibe) {
    return <Text>No vibe {name} exists.</Text>;
  }

  const { playables } = vibe;

  return (
    <>
      <Root color={colorValues ? lighter(...colorValues, 0.2) : "#fff"}>
        <Header
          title={vibe.title}
          mixItUp={() =>
            onSelect(playables[Math.floor(Math.random() * playables.length)])
          }
        />
        <PlayablesContainer playing={!!selectedPlayable}>
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
              <Artwork url={playable.artworkUrl} title={playable.title} />
              <Details>
                <PlayableName numberOfLines={1}>{playable.title}</PlayableName>
                <ArtistName numberOfLines={1}>{playable.artistName}</ArtistName>
              </Details>
            </PressablePlayable>
          ))}
          <PressablePlayable onPress={() => bottomSheetRef.current?.open()}>
            <Artwork title="+ Add" />
            <Details>
              <PlayableName numberOfLines={1}></PlayableName>
              <ArtistName numberOfLines={1}></ArtistName>
            </Details>
          </PressablePlayable>
          {(playables.length + 1) % 2 === 1 ? <DummyPlayable /> : null}
        </PlayablesContainer>
      </Root>
      <Editor
        initialPage="selectFormat"
        vibeTitle={vibe.title}
        ref={bottomSheetRef}
      />
    </>
  );
};

export default Vibe;
