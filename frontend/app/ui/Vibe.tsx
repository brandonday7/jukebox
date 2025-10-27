import { usePlaybackState } from "@/state/playbackState";
import { useVibeState } from "@/state/vibesState";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "react-native";
import { styled } from "styled-components/native";
import spotifyImage from "../../assets/spotify.png";

const Root = styled.ScrollView`
  flex: 1;
  background-color: white;
  padding-top: 80px;
`;

const PlayablesContainer = styled.View`
  flex: 1;
  width: 100%;
  justify-content: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
`;

const PressablePlayable = styled.TouchableOpacity`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  width: 170px;
`;

const AlbumArtContainer = styled.View``;

const AlbumArt = styled.Image`
  width: 170px;
  height: 170px;
  border-radius: 4px;
`;

const Details = styled.View`
  display: flex;
  align-items: center;
  gap: 5;
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
  const { vibes } = useVibeState();
  const { play } = usePlaybackState();
  const router = useRouter();

  const vibe = vibes?.find((v) => v.title === name);

  if (!vibe) {
    return <Text>No vibe {name} exists.</Text>;
  }

  const { playables } = vibe;

  console.log("******", playables);

  return (
    <Root>
      <PlayablesContainer>
        {playables.map((playable) => (
          <PressablePlayable
            key={playable.spId}
            onPress={() => {
              play(playable.type, playable.spId);
              router.push("/vibes/player");
            }}
          >
            <AlbumArtContainer
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
              }}
            >
              {playable.artworkUrl ? (
                <AlbumArt source={{ uri: playable.artworkUrl }} />
              ) : (
                <AlbumArt
                  source={spotifyImage}
                  style={{ width: 110, height: 110 }}
                />
              )}
            </AlbumArtContainer>
            <Details>
              <PlayableName>{playable.title}</PlayableName>
              <ArtistName>{playable.artistName}</ArtistName>
            </Details>
          </PressablePlayable>
        ))}
      </PlayablesContainer>
    </Root>
  );
};

export default Vibe;
