import type { PlayableType } from "@/api";

export const openSpotifyLink = (type?: PlayableType, spId?: string) =>
  type && spId
    ? `https://open.spotify.com/${type}/${spId}`
    : "https://open.spotify.com";
