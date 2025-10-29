import { styled } from "styled-components/native";

const SHADOW_STYLES = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
};

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

const Fallback = styled.View<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
  background-color: #ddd;
`;

const FallbackText = styled.Text`
  font-size: 30px;
`;

interface Props {
  url?: string;
  size?: number;
}

const Artwork = ({ url, size = 170 }: Props) => {
  return (
    <Root style={SHADOW_STYLES}>
      {url ? (
        <AlbumArt source={{ uri: url }} size={size} />
      ) : (
        <Fallback size={size}>
          <FallbackText>🎵</FallbackText>
        </Fallback>
      )}
    </Root>
  );
};

export default Artwork;
