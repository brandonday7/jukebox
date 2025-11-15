import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import PlayerSheetContext from "./ui/Player/PlayerContext";
import SystemContext from "./ui/System/SystemContext";

const RootLayout = () => {
  return (
    <SystemContext>
      <GestureHandlerRootView>
        <PlayerSheetContext>
          <Stack />
        </PlayerSheetContext>
      </GestureHandlerRootView>
    </SystemContext>
  );
};

export default RootLayout;
