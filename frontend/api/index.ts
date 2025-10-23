import { del, get, post } from "./http";

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

export const deleteVibe = async (title: string) =>
  del(makeUrl("/vibe"), { title });

export const createVibe = async (title: string, playables: PlayableData[]) =>
  post(makeUrl("/vibe"), { title, playables });

export const insertPlayable = async (
  title: string,
  playable: PlayableData,
  index?: number
) => post(makeUrl("/vibe/insertPlayable"), { title, playable, index });

export const removePlayable = async (title: string, spId: string) =>
  del(makeUrl("/vibe/removePlayable"), { title, spId });
