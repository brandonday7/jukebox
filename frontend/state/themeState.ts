import type ColorHash from "color-hash";
import { create } from "zustand";

interface ThemeState {
  colorValues?: ColorHash.ColorValueArray;
  setColorValues(values: ColorHash.ColorValueArray): void;
  defaultColor: string;
}

export const useThemeState = create<ThemeState>((set) => ({
  colorValues: undefined,
  defaultColor: "#fff",
  setColorValues: (colorValues) => {
    set(() => ({ colorValues }));
  },
}));
