import {
  createVibe,
  deleteVibe,
  getVibes,
  insertPlayables,
  removePlayable,
  type PlayableData,
  type VibeData,
} from "@/api";
import { create } from "zustand";

interface VibeState {
  vibes?: VibeData[];
  selectedPlayable?: PlayableData;
  fetchVibes(): void;
  removeVibe(title: string): void;
  createVibe(title: string, playables: PlayableData[]): void;
  insertPlayables(
    title: string,
    playables: PlayableData[],
    index?: number
  ): void;
  removePlayable(title: string, spId: string): void;
  setSelectedPlayable(playable?: PlayableData): void;
}

export const useVibeState = create<VibeState>((set, get) => ({
  vibes: undefined,
  selectedPlayable: undefined,
  fetchVibes: async () => {
    try {
      const vibes = await getVibes();
      set(() => ({ vibes }));
    } catch {
      set(() => ({ vibes: [] }));
    }
  },
  removeVibe: async (title) => {
    const prevVibes = get().vibes;

    try {
      set(({ vibes }) => ({ vibes: vibes?.filter((v) => v.title !== title) }));
      await deleteVibe(title);
    } catch {
      set(() => ({ vibes: prevVibes }));
    }
  },
  createVibe: async (title, playables) => {
    const prevVibes = get().vibes;
    try {
      const vibe = await createVibe(title, playables);
      set(({ vibes }) => ({ vibes: [...(vibes || []), vibe] }));
    } catch {
      set(() => ({ vibes: prevVibes }));
    }
  },
  insertPlayables: async (title, playables, index) => {
    const prevVibes = get().vibes;

    try {
      const { playables: newPlayables } = await insertPlayables(
        title,
        playables,
        index
      );
      set(({ vibes }) => ({
        vibes: vibes?.map((v) =>
          v.title === title ? { ...v, playables: newPlayables } : v
        ),
      }));
    } catch {
      set(() => ({ vibes: prevVibes }));
    }
  },
  removePlayable: async (title, spId) => {
    const prevVibes = get().vibes;

    try {
      set(({ vibes = [] }) => {
        const playables =
          vibes
            .find((v) => v.title === title)
            ?.playables?.filter((p) => p.spId !== spId) || [];
        return {
          vibes: vibes.map((v) =>
            v.title === title ? { ...v, playables } : v
          ),
        };
      });
      await removePlayable(title, spId);
    } catch {
      set(() => ({ vibes: prevVibes }));
    }
  },
  setSelectedPlayable: (playable) => {
    set(() => ({ selectedPlayable: playable }));
  },
}));
