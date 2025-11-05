import { Stack } from "expo-router";
import { styled } from "styled-components/native";
import { lighter } from "../helpers/color";
import { useThemeState } from "@/state/themeState";

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
  const { colorValues, defaultColor } = useThemeState();

  const color = colorValues ? lighter(...colorValues, 0.1) : defaultColor;

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
