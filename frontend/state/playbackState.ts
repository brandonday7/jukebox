import { back, next, pause, play, type PlayableType } from "@/api";
import { Alert, Linking } from "react-native";
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
      Alert.alert(
        "Device not found",
        "Spotify has made your playback device inaccessible to our app right now. If you wish to listen on this device, you can start playback from the Spotify app directly. Otherwise, you can change the playback device in the devices tab.",
        [
          {
            text: "Open Spotify app",
            onPress: () => Linking.openURL(getSpotifyLink(type, spId)),
            style: "default",
          },
          {
            text: "Close",
            style: "cancel",
          },
        ]
      );
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

const getSpotifyLink = (type?: PlayableType, spId?: string) =>
  type && spId
    ? `https://open.spotify.com/${type}/${spId}`
    : "https://open.spotify.com";
