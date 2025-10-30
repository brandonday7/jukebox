import { usePlaybackState } from "@/state/playbackState";
import { useVibeState } from "@/state/vibesState";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "react-native";
import { styled } from "styled-components/native";
import Artwork from "./common/Artwork";
import Header from "./common/Header";
import type { PlayableData } from "@/api";

const Root = styled.ScrollView`
  background-color: white;
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
  const { vibes, setSelectedPlayable } = useVibeState();
  const { play } = usePlaybackState();
  const router = useRouter();

  const onSelect = (playable: PlayableData) => {
    play(playable.type, playable.spId);
    setSelectedPlayable(playable);
    router.push("/vibes/player");
  };

  const vibe = vibes?.find((v) => v.title === name);

  if (!vibe) {
    return <Text>No vibe {name} exists.</Text>;
  }

  const { playables } = vibe;

  return (
    <Root>
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
          >
            <Artwork url={playable.artworkUrl} />
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
