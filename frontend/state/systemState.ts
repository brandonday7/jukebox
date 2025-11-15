import { wakeServer } from "@/api";
import { create } from "zustand";

interface SystemState {
  awake: boolean;
  countdown: number;
  awakeServer(): void;
  setCountdown(countdown: number): void;
}

export const useSystemState = create<SystemState>((set) => ({
  awake: false,
  countdown: 60,
  awakeServer: async () => {
    set(() => ({ awake: false }));
    const { awake } = await wakeServer();
    set(() => ({ awake }));
  },
  setCountdown: (countdown) => set(() => ({ countdown })),
}));
