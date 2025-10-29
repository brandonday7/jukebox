import { Stack } from "expo-router";
import { styled } from "styled-components/native";

const MixItUp = styled.TouchableOpacity``;

const MixItUpText = styled.Text`
  font-size: 30px;
  margin-left: 1px;
`;

interface Props {
  title: string;
  mixItUp?(): void;
}

const Header = ({ title, mixItUp }: Props) => {
  return (
    <Stack.Screen
      options={{
        title,
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
