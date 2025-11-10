import { usePlaybackState } from "@/state/playbackState";
import { styled } from "styled-components/native";
import Artwork from "../common/Artwork";
import { useVibeState } from "@/state/vibesState";
import { useThemeState } from "@/state/themeState";

const Root = styled.View`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding: 100px 20px 0 20px;
`;

const Details = styled.View`
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 20px;
`;

const PlayableName = styled.Text`
  color: white;
  font-size: 30px;
  font-weight: 600;
  text-align: center;
`;

const ArtistName = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: 300;
  text-align: center;
`;

const Controls = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-around;
  padding: 90px 50px 20px 50px;
`;

const StyledText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: white;
`;

const Button = styled.TouchableOpacity`
  width: 80px;
  height: 80px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline-width: 2px;
  outline-color: white;
`;

const Player = () => {
  const { playing, play, pause, back } = usePlaybackState();
  const { selectedPlayable } = useVibeState();
  const { colorValues } = useThemeState();

  if (!selectedPlayable || !colorValues) {
    return null;
  }

  return (
    <Root>
      <Artwork
        url={selectedPlayable.artworkUrl}
        size={250}
        title={selectedPlayable.title}
      />
      <Details>
        <PlayableName>{selectedPlayable.title}</PlayableName>
        <ArtistName>{selectedPlayable.artistName}</ArtistName>
      </Details>
      <Controls>
        <Button onPress={() => back()}>
          <StyledText>Back</StyledText>
        </Button>
        <Button
          disabled={!selectedPlayable}
          onPress={() => {
            if (playing === true) {
              pause();
            } else if (playing === false && selectedPlayable) {
              // Resume playback, don't pass params
              play();
            }
          }}
        >
          <StyledText>
            {playing === true ? "Pause" : playing === false ? "Play" : "..."}
          </StyledText>
        </Button>
      </Controls>
    </Root>
  );
};

export default Player;
