import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { createContext, useContext, useRef, type ReactNode } from "react";
import PlayerSheet from "../PlayerSheet";

interface PlayerSheetContextType {
  openSheet: () => void;
  closeSheet: () => void;
}

const PlayerSheetContext = createContext<PlayerSheetContextType | null>(null);

export const PlayerSheetProvider = ({ children }: { children: ReactNode }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const openSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const closeSheet = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <PlayerSheetContext.Provider value={{ openSheet, closeSheet }}>
      {children}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[1, "100%"]}
        index={-1}
        style={{ paddingTop: 75 }}
      >
        <BottomSheetView>
          <PlayerSheet />
        </BottomSheetView>
      </BottomSheet>
    </PlayerSheetContext.Provider>
  );
};

export default PlayerSheetProvider;

export const usePlayerSheet = () => {
  const context = useContext(PlayerSheetContext);
  if (!context) {
    throw new Error("usePlayerSheet must be used within PlayerSheetProvider");
  }
  return context;
};
