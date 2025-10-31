import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import PlayerSheetContext from "./ui/Player/PlayerContext";

const RootLayout = () => {
  return (
    <GestureHandlerRootView>
      <PlayerSheetContext>
        <Stack screenOptions={{ headerShown: false }} />
      </PlayerSheetContext>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
