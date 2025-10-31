import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Player from "../Player";

interface PlayerSheetContextType {
  open: () => void;
  close: () => void;
  setBgColor(color: string): void;
}

const PlayerSheetContext = createContext<PlayerSheetContextType | null>(null);

export const PlayerContext = ({ children }: { children: ReactNode }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [bgColor, setBgColor] = useState("black");

  const open = () => {
    bottomSheetRef.current?.expand();
  };

  const close = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <PlayerSheetContext.Provider value={{ open, close, setBgColor }}>
      {children}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[1, "100%"]}
        index={-1}
        style={{ paddingTop: 75 }}
        backgroundStyle={{ backgroundColor: bgColor }}
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
