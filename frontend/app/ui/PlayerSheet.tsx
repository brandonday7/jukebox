import { usePlaybackState } from "@/state/playbackState";
import { styled } from "styled-components/native";
import Artwork from "./common/Artwork";
import { useVibeState } from "@/state/vibesState";
import colorHash, { toHSLA } from "./helpers/color";

const Root = styled.View<{ color: string }>`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
  background-color: ${({ color }) => color};
`;

const Details = styled.View`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 20px;
`;

const PlayableName = styled.Text`
  color: black;
  font-size: 20px;
`;

const ArtistName = styled.Text`
  color: #444;
  font-size: 16px;
`;

const Controls = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  padding: 90px 50px 20px 50px;
`;

const StyledText = styled.Text`
  font-size: 16px;
  color: white;
`;

const Button = styled.TouchableOpacity`
  width: 75px;
  height: 75px;
  border-radius: 100px;
  background-color: #444;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlayerSheet = () => {
  const { playing, play, pause, back, next } = usePlaybackState();
  const { selectedPlayable } = useVibeState();

  if (!selectedPlayable) {
    return null;
  }

  const color = colorHash.hsl(
    `${selectedPlayable.title} - ${selectedPlayable.artistName}`
  );

  return (
    <Root color={toHSLA(...color, 0.5)}>
      <Artwork
        url={selectedPlayable.artworkUrl}
        size={250}
        title={`${selectedPlayable.title} - ${selectedPlayable.artistName}`}
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
              play(selectedPlayable.type, selectedPlayable.spId);
            }
          }}
        >
          <StyledText>
            {playing === true ? "Pause" : playing === false ? "Play" : "..."}
          </StyledText>
        </Button>
        <Button onPress={() => next()}>
          <StyledText>Next</StyledText>
        </Button>
      </Controls>
    </Root>
  );
};

export default PlayerSheet;
