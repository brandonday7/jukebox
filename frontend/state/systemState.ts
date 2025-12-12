import {
  clearLoginAttempts,
  clearPasscode,
  getLoginAttempts,
  getPasscode,
  setLoginAttempts,
  setPasscode,
  wakeServer,
} from "@/api";
import { create } from "zustand";

interface SystemState {
  awake: boolean;
  countdown: number;
  awakeServer(): void;
  setCountdown(countdown: number): void;
  passcode?: string;
  fetchPasscode(): void;
  setPasscode(passcode: string): void;
  loginAttempts?: number;
  fetchLoginAttempts(): void;
  setLoginAttempts(attempts: number): void;
  clearLogin(): void;
}

export const useSystemState = create<SystemState>((set) => ({
  awake: false,
  countdown: 50,
  passcode: undefined,
  loginAttempts: undefined,
  awakeServer: async () => {
    set(() => ({ awake: false }));
    const { awake } = await wakeServer();
    set(() => ({ awake }));
  },
  setCountdown: (countdown) => set(() => ({ countdown })),
  fetchPasscode: async () => {
    const passcode = await getPasscode();
    set(() => ({ passcode: passcode || "" }));
  },
  setPasscode: async (passcode) => {
    set(() => ({ passcode }));
    await setPasscode(passcode);
  },
  fetchLoginAttempts: async () => {
    const loginAttempts = await getLoginAttempts();
    set(() => ({
      loginAttempts: loginAttempts ? Number(loginAttempts) : 0,
    }));
  },
  setLoginAttempts: async (loginAttempts) => {
    set(() => ({ loginAttempts }));
    await setLoginAttempts(loginAttempts);
  },
  clearLogin: async () => {
    set(() => ({ passcode: undefined, loginAttempts: undefined }));
    await clearPasscode();
    await clearLoginAttempts();
  },
}));
