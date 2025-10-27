import type { PlayableData } from "@/api";
import { usePlaybackState } from "@/state/playbackState";
import { styled } from "styled-components/native";

const Root = styled.View`
  display: flex;
  flex-direction: row;
  width: "100%";
  justify-content: space-between;
  background-color: #67b399;
  padding: 120px 50px 20px 50px;
`;

const StyledText = styled.Text`
  font-size: 18px;
  color: white;
`;

const Button = styled.TouchableOpacity`
  width: 50px;
  color: #444;
`;

interface Props {
  selectedPlayable?: PlayableData;
}

const Player = ({ selectedPlayable }: Props) => {
  const { playing, play, pause, back, next } = usePlaybackState();

  return (
    <Root>
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
    </Root>
  );
};

export default Player;
