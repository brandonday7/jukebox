import { get } from "./http";

const BASE_URL = "http://localhost:3000";
const makeUrl = (endpoint: string) => `${BASE_URL}${endpoint}`;

export interface VibeData {
  title: string;
  playables: PlayableData[];
}

export type PlayableType = "album" | "playlist";

export interface PlayableData {
  type: PlayableType;
  title: string;
  artworkUrl?: string;
  artistName: string;
  spId: string;
}

export const getVibes = async () => get<VibeData[]>(makeUrl("/vibes"));
