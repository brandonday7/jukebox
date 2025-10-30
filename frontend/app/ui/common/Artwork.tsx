import { styled } from "styled-components/native";

import ColorHash from "color-hash";
import { toHSLA } from "../helpers";

const colorHash = new ColorHash();

const SHADOW_STYLES = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.4,
};

const DEFAULT_SIZE = 170;

const Root = styled.View`
  display: flex;
  flex-direction: row;
  width: "100%";
  justify-content: space-between;
`;

const AlbumArt = styled.Image<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 4px;
`;

interface Props {
  title: string;
  url?: string;
  size?: number;
}

const Artwork = ({ title, url, size = DEFAULT_SIZE }: Props) => {
  return (
    <Root style={SHADOW_STYLES}>
      {url ? (
        <AlbumArt source={{ uri: url }} size={size} />
      ) : (
        <BlankArtwork size={size} title={title} />
      )}
    </Root>
  );
};

export default Artwork;

const BlankRoot = styled.View<{ size: number; color?: string }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
  background-color: ${({ color }) => color || "#ddd"};
  padding: 20px;
`;

const BlankTitle = styled.Text`
  font-size: 20px;
  font-weight: 800;
  color: white;
  text-align: center;
`;

interface BlankArtworkProps {
  title?: string;
  size?: number;
}

export const BlankArtwork = ({
  title = "",
  size = DEFAULT_SIZE,
}: BlankArtworkProps) => {
  const color = toHSLA(...colorHash.hsl(title), 1);

  return (
    <BlankRoot size={size} color={color}>
      <BlankTitle>{title}</BlankTitle>
    </BlankRoot>
  );
};
