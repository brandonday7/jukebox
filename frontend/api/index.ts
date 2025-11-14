import { del, get, post } from "./http";

const BASE_URL = "https://jukebox-server-5kap.onrender.com";
// const BASE_URL = "http://localhost:3000";
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

export interface Artist {
  name: string;
  imageUrl: string;
  spId: string;
}

export interface Device {
  id: string;
  name: string;
  isActive: boolean;
  type: "Computer" | "TV" | "Smartphone";
}

export const wakeServer = async () => get<{ awake: boolean }>(makeUrl("/ping"));

export const getVibes = async () => get<VibeData[]>(makeUrl("/vibes"));

export const play = async (type?: PlayableType, spId?: string) =>
  post<{ playing: boolean }>(makeUrl("/play"), { type, spId });
export const pause = async () => post<{ playing: boolean }>(makeUrl("/pause"));
export const back = async () => post<{ playing: boolean }>(makeUrl("/back"));
export const next = async () => post<{ playing: boolean }>(makeUrl("/next"));

export const deleteVibe = async (title: string) =>
  del(makeUrl("/vibe"), { title });

export const createVibe = async (title: string, playables: PlayableData[]) =>
  post<VibeData>(makeUrl("/vibe"), { title, playables });

export const insertPlayables = async (
  title: string,
  playables: PlayableData[],
  index?: number
) =>
  post<{ playables: PlayableData[] }>(makeUrl("/vibe/insertPlayables"), {
    title,
    playables,
    index,
  });

export const removePlayable = async (title: string, spId: string) =>
  del(makeUrl("/vibe/removePlayable"), { title, spId });

export const searchArtists = async (searchText: string) =>
  get<{ artists: Artist[] }>(makeUrl("/searchArtists"), { query: searchText });

export const getArtistAlbums = async (spId: string, artistName: string) =>
  get<{ albums: PlayableData[] }>(makeUrl("/artistAlbums"), {
    spId,
    artistName,
  });

export const getPlaylist = async (spId: string) =>
  get<{ playlist: PlayableData }>(makeUrl("/searchPlaylist"), {
    spId,
  });

export const getDevices = async () => get<Device[]>(makeUrl("/devices"));
export const updateDefaultDevice = async (deviceId: string) =>
  post(makeUrl("/defaultDevice"), { deviceId });
