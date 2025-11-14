import { wakeServer } from "@/api";
import { create } from "zustand";

interface SystemState {
  awake: boolean;
  timeWaiting?: number;
  awakeServer(): void;
  setTimeWaiting(timeWaiting: number): void;
}

export const useSystemState = create<SystemState>((set) => ({
  awake: true,
  serverLastAwoken: undefined,
  awakeServer: async () => {
    set(() => ({ timeWaiting: 1 }));
    const { awake } = await wakeServer();
    set(() => ({ awake, timeWaiting: undefined }));
  },
  setTimeWaiting: (timeWaiting) => {
    set(() => ({ timeWaiting }));
  },
}));
