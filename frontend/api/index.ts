import { get, post } from "./http";

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

export const play = async (type: PlayableType, spId: string) =>
  post<{ playing: boolean }>(makeUrl("/play"), { type, spId });
export const pause = async () => post<{ playing: boolean }>(makeUrl("/pause"));
export const back = async () => post<{ playing: boolean }>(makeUrl("/back"));
export const next = async () => post<{ playing: boolean }>(makeUrl("/next"));
