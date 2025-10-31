import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PlayerSheetProvider } from "./ui/contexts/PlayerSheetContext";

const RootLayout = () => {
  return (
    <GestureHandlerRootView>
      <PlayerSheetProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PlayerSheetProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
