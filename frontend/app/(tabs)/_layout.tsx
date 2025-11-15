import { Tabs } from "expo-router";
import { lighter } from "../ui/helpers/color";
import { styled } from "styled-components/native";
import { useThemeState } from "@/state/themeState";

const StyledText = styled.Text<{ focused: boolean }>`
  margin-top: 10px;
  opacity: ${({ focused }) => (focused ? 1 : 0.5)};
`;

export default function TabLayout() {
  const { colorValues } = useThemeState();

  const color = colorValues ? lighter(...colorValues, 0.05) : "#fff";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: color,
          borderTopWidth: 1,
        },
        tabBarIconStyle: { marginBottom: 8 },
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "#aaa",
      }}
    >
      <Tabs.Screen
        name="vibes"
        options={{
          title: "Vibes",
          tabBarIcon: ({ focused }) => (
            <StyledText focused={focused}>🎵</StyledText>
          ),
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: "Devices",
          tabBarIcon: ({ focused }) => (
            <StyledText focused={focused}>📱</StyledText>
          ),
        }}
      />
    </Tabs>
  );
}
