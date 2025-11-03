import { styled } from "styled-components/native";
import Artwork from "../common/Artwork";
import { useVibeState } from "@/state/vibesState";
import colorHash, { lighter, toHSLA } from "../helpers/color";
import { useEffect } from "react";
import { usePlayer } from "./PlayerContext";

const Root = styled.TouchableOpacity<{ color: string }>`
  position: absolute;
  bottom: 0px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 20px 25px 30px 25px;
  background-color: ${({ color }) => color};
  shadow-color: "#444";
  shadow-opacity: 0.2;
  shadow-radius: 3px;
`;

const Details = styled.View`
  display: flex;
  justify-content: center;
  gap: 2px;
`;

const PlayableName = styled.Text`
  color: black;
  font-size: 15px;
  font-weight: 600;
`;

const ArtistName = styled.Text`
  color: black;
  font-size: 13px;
  font-weight: 600;
`;

const Opener = () => {
  const { selectedPlayable } = useVibeState();
  const { setBgColor, open } = usePlayer();

  const colorValues = selectedPlayable
    ? colorHash.hsl(selectedPlayable.title)
    : null;

  useEffect(() => {
    if (colorValues) {
      setBgColor(toHSLA(...colorValues, 1));
    }
  }, [colorValues, setBgColor]);

  if (!selectedPlayable || !colorValues) {
    return null;
  }

  return (
    <Root onPress={() => open()} color={lighter(...colorValues, 0.1)}>
      <Artwork
        url={selectedPlayable.artworkUrl}
        size={50}
        title={selectedPlayable.title}
      />
      <Details>
        <PlayableName>{selectedPlayable.title}</PlayableName>
        <ArtistName>{selectedPlayable.artistName}</ArtistName>
      </Details>
    </Root>
  );
};

export default Opener;
