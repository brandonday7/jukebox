import { useVibeState } from "@/state/vibesState";
import { Stack } from "expo-router";
import { styled } from "styled-components/native";
import colorHash, { lighter } from "../helpers/color";

const MixItUp = styled.TouchableOpacity``;

const MixItUpText = styled.Text`
  font-size: 30px;
  margin-left: 1.5px;
`;

interface Props {
  title: string;
  mixItUp?(): void;
}

const Header = ({ title, mixItUp }: Props) => {
  const { selectedPlayable } = useVibeState();

  const colorValues = selectedPlayable
    ? colorHash.hsl(selectedPlayable?.title)
    : null;

  const color = colorValues ? lighter(...colorValues, 0.1) : "#fff";

  return (
    <Stack.Screen
      options={{
        title,
        headerStyle: { backgroundColor: color },
        headerRight: mixItUp
          ? () => (
              <MixItUp onPress={() => mixItUp()}>
                <MixItUpText>💿</MixItUpText>
              </MixItUp>
            )
          : undefined,
      }}
    />
  );
};

export default Header;
