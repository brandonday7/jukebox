import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="vibes"
        options={{
          title: "Vibes",
          tabBarIcon: ({ color }) => <Text>🎵</Text>, // Use actual icons
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => <Text>➕</Text>,
        }}
      />
    </Tabs>
  );
}
