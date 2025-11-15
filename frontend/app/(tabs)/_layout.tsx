import { useVibeState } from "@/state/vibesState";
import { Tabs } from "expo-router";
import colorHash, { lighter } from "../ui/helpers/color";
import { styled } from "styled-components/native";

const StyledText = styled.Text`
  margin-top: 10px;
`;

export default function TabLayout() {
  const { selectedPlayable } = useVibeState();

  const colorValues = selectedPlayable
    ? colorHash.hsl(selectedPlayable?.title)
    : null;

  const color = colorValues ? lighter(...colorValues, 0.05) : "#fff";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: color,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "black",
      }}
    >
      <Tabs.Screen
        name="vibes"
        options={{
          title: "Vibes",
          tabBarIcon: ({ color }) => <StyledText>🎵</StyledText>,
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: "Devices",
          tabBarIcon: ({ color }) => <StyledText>📱</StyledText>,
        }}
      />
    </Tabs>
  );
}
