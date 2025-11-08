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

export const useVibeState = create<VibeState>((set) => ({
  vibes: undefined,
  selectedPlayable: undefined,
  fetchVibes: async () => {
    const vibes = await getVibes();
    set(() => ({ vibes }));
  },
  removeVibe: async (title) => {
    set(({ vibes }) => ({ vibes: vibes?.filter((v) => v.title !== title) }));
    await deleteVibe(title);
  },
  createVibe: async (title, playables) => {
    set(({ vibes }) => ({ vibes: [...(vibes || []), vibe] }));
    const vibe = await createVibe(title, playables);
  },
  insertPlayables: async (title, playables, index) => {
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
  },
  removePlayable: async (title, spId) => {
    set(({ vibes = [] }) => {
      const playables =
        vibes
          .find((v) => v.title === title)
          ?.playables?.filter((p) => p.spId !== spId) || [];
      return {
        vibes: vibes.map((v) => (v.title === title ? { ...v, playables } : v)),
      };
    });
    await removePlayable(title, spId);
  },
  setSelectedPlayable: (playable) => {
    set(() => ({ selectedPlayable: playable }));
  },
}));
