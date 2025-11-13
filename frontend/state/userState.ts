import { getDevices, updateDefaultDevice, type Device } from "@/api";
import { create } from "zustand";

interface UserState {
  devices?: Device[] | "loading";
  fetchDevices(): void;
  setDefaultDevice(deviceId: string): void;
}

export const useUserState = create<UserState>((set) => ({
  devices: undefined,
  fetchDevices: async () => {
    set(() => ({ devices: "loading" }));

    try {
      const devices = await getDevices();
      set(() => ({ devices }));
    } catch {
      set(() => ({ devices: undefined }));
    }
  },
  setDefaultDevice: async (deviceId: string) => {
    try {
      await updateDefaultDevice(deviceId);
    } catch {}
  },
}));
