import { getDevices, updateDefaultDevice, type Device } from "@/api";
import { Alert } from "react-native";
import { create } from "zustand";

interface UserState {
  devices?: Device[] | "loading";
  fetchDevices(): void;
  clearDevices(): void;
  setDefaultDevice(deviceId: string): void;
}

export const useUserState = create<UserState>((set, get) => ({
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
  clearDevices: () => set(() => ({ devices: undefined })),
  setDefaultDevice: async (deviceId: string) => {
    const devices = get().devices;
    try {
      if (devices && devices !== "loading") {
        set(() => ({
          devices: devices.map((d) =>
            d.id === deviceId
              ? { ...d, isDefault: true }
              : { ...d, isDefault: false }
          ),
        }));
      }
      await updateDefaultDevice(deviceId);
    } catch {
      if (devices && devices !== "loading") {
        set(() => ({ devices }));
      }
      Alert.alert(
        "Device not found",
        "Spotify has suddenly made this device inaccessible to our app right now. Please select another one.",
        [
          {
            text: "Ok",
            style: "default",
          },
        ]
      );
    }
  },
}));
