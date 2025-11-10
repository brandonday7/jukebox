import { back, next, pause, play, type PlayableType } from "@/api";
import { create } from "zustand";

interface PlaybackState {
  playing: boolean | "loading";
  play(type?: PlayableType, spId?: string): void;
  pause(): void;
  back(): void;
  next(): void;
}

export const usePlaybackState = create<PlaybackState>((set) => ({
  playing: false,
  play: async (type, spId) => {
    try {
      set(() => ({ playing: "loading" }));
      const { playing } = await play(type, spId);
      set(() => ({ playing }));
    } catch {
      set(() => ({ playing: false }));
    }
  },
  pause: async () => {
    try {
      set(() => ({ playing: "loading" }));
      const { playing } = await pause();
      set(() => ({ playing }));
    } catch {
      set(() => ({ playing: true }));
    }
  },
  back: async () => {
    try {
      set(() => ({ playing: "loading" }));
      const { playing } = await back();
      set(() => ({ playing }));
    } catch {
      set(() => ({ playing: false }));
    }
  },
  next: async () => {
    try {
      set(() => ({ playing: "loading" }));
      const { playing } = await next();
      set(() => ({ playing }));
    } catch {
      set(() => ({ playing: false }));
    }
  },
}));
