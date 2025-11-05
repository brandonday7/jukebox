import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { createContext, useContext, useRef, type ReactNode } from "react";
import Player from ".";
import Opener from "./Opener";
import { useThemeState } from "@/state/themeState";
import { toHSLA } from "../helpers/color";

interface PlayerSheetContextType {
  open: () => void;
  close: () => void;
}

const PlayerSheetContext = createContext<PlayerSheetContextType | null>(null);

export const PlayerContext = ({ children }: { children: ReactNode }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { colorValues, defaultColor } = useThemeState();

  const open = () => {
    bottomSheetRef.current?.expand();
  };

  const close = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <PlayerSheetContext.Provider value={{ open, close }}>
      {children}
      <Opener />
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[1, "100%"]}
        index={-1}
        style={{ paddingTop: 75 }}
        backgroundStyle={{
          backgroundColor: colorValues
            ? toHSLA(...colorValues, 1)
            : defaultColor,
        }}
      >
        <BottomSheetView>
          <Player />
        </BottomSheetView>
      </BottomSheet>
    </PlayerSheetContext.Provider>
  );
};

export default PlayerContext;

export const usePlayer = () => {
  const context = useContext(PlayerSheetContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerContext");
  }
  return context;
};
