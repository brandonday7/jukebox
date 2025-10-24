import {
  createVibe,
  deleteVibe,
  getVibes,
  insertPlayable,
  removePlayable,
  type PlayableData,
  type VibeData,
} from "@/api";
import { create } from "zustand";

interface VibeState {
  vibes?: VibeData[];
  fetchVibes(): void;
  removeVibe(title: string): void;
  createVibe(title: string, playables: PlayableData[]): void;
  insertPlayable(title: string, playable: PlayableData, index?: number): void;
  removePlayable(title: string, spId: string): void;
}

export const useVibeState = create<VibeState>((set) => ({
  vibes: undefined,
  fetchVibes: async () => {
    const vibes = await getVibes();
    set(() => ({ vibes }));
  },
  removeVibe: async (title) => {
    await deleteVibe(title);
    set(({ vibes }) => ({ vibes: vibes?.filter((v) => v.title !== title) }));
  },
  createVibe: async (title, playables) => {
    const vibe = await createVibe(title, playables);
    set(({ vibes }) => ({ vibes: [...(vibes || []), vibe] }));
  },
  insertPlayable: async (title, playable, index) => {
    const { playables: newPlayables } = await insertPlayable(
      title,
      playable,
      index
    );
    set(({ vibes }) => ({
      vibes: vibes?.map((v) =>
        v.title === title ? { ...v, playables: newPlayables } : v
      ),
    }));
  },
  removePlayable: async (title, spId) => {
    await removePlayable(title, spId);
    set(({ vibes = [] }) => {
      const playables =
        vibes
          .find((v) => v.title === title)
          ?.playables?.filter((p) => p.spId !== spId) || [];
      return {
        vibes: vibes.map((v) => (v.title === title ? { ...v, playables } : v)),
      };
    });
  },
}));
