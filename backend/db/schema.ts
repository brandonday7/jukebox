import { Schema, model } from "mongoose";

// Schema
export const playableSchema = new Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  artistName: { type: String, required: true },
  artworkUrl: { type: String, required: false },
  spId: { type: String, required: true },
});

export const vibeSchema = new Schema({
  title: { type: String, required: true, unique: true },
  playables: { type: [playableSchema], required: true },
  hidden: { type: Boolean, required: false },
});

export const librarySchema = new Schema({
  title: { type: String, required: true },
  vibes: { type: [vibeSchema], required: true },
});

// Models
export const Library = model("Library", librarySchema);
export const Vibe = model("Vibe", vibeSchema);
export const Playable = model("Playable", playableSchema);

// Interfaces
export type PlayableType = "album" | "playlist";
export interface PlayableData {
  type: PlayableType;
  title: string;
  artistName: string;
  artworkUrl?: string;
  spId: string;
}

export interface VibeData {
  title: string;
  playables: PlayableData[];
  hidden: boolean;
}

export interface LibraryData {
  title: string;
  vibes: VibeData[];
}

// Spotify
export const spAccountSchema = new Schema({
  userName: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Number, required: true },
  defaultDeviceId: { type: String, required: false },
});

export const SpAccount = model("SpAccount", spAccountSchema);

export interface SpAccountData {
  userName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  defaultDeviceId?: string;
}
