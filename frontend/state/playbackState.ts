import { back, next, pause, play, type PlayableType } from "@/api";
import { create } from "zustand";

interface PlaybackState {
  playing: boolean | "loading";
  play(type: PlayableType, spId: string): void;
  pause(): void;
  back(): void;
  next(): void;
}

export const usePlaybackState = create<PlaybackState>((set) => ({
  playing: false,
  play: async (type, spId) => {
    set(() => ({ playing: "loading" }));
    const { playing } = await play(type, spId);
    set(() => ({ playing }));
  },
  pause: async () => {
    set(() => ({ playing: "loading" }));
    const { playing } = await pause();
    set(() => ({ playing }));
  },
  back: async () => {
    set(() => ({ playing: "loading" }));
    const { playing } = await back();
    set(() => ({ playing }));
  },
  next: async () => {
    set(() => ({ playing: "loading" }));
    const { playing } = await next();
    set(() => ({ playing }));
  },
}));
