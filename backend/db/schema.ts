import { Schema, model } from "mongoose";

// Schema
export const playableSchema = new Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  artistName: { type: String, required: true },
  artworkUrl: { type: String, required: true },
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

export const MAC: PlayableData = {
  type: "album",
  title: "This Old Dog",
  artistName: "Mac Demarco",
  artworkUrl:
    "https://i.scdn.co/image/ab67616d00001e029f1b21f21b13ff2d3e891f6b",
  spId: "4NNq2vwTapv4fSJcrZbPH7",
};

export const ZEP: PlayableData = {
  type: "album",
  title: "Houses of the Holy",
  artistName: "Led Zeppelin",
  artworkUrl:
    "https://i.scdn.co/image/ab67616d00001e021aa47e71c4edfeaddb65cd54",
  spId: "0GqpoHJREPp0iuXK3HzrHk",
};

export const OLDIES: VibeData = {
  title: "Oldies",
  playables: [
    {
      type: "album",
      title: "Born To Run",
      artistName: "Bruce Springsteen",
      artworkUrl:
        "https://i.scdn.co/image/ab67616d00001e02503143a281a3f30268dcd9f9",
      spId: "43YIoHKSrEw2GJsWmhZIpu",
    },
    ZEP,
  ],
  hidden: false,
};

export const WEEKEND_MORNING: VibeData = {
  title: "Weekend Morning",
  playables: [
    MAC,
    {
      type: "album",
      title: "Wild Onion",
      artistName: "Twin Peaks",
      artworkUrl:
        "https://i.scdn.co/image/ab67616d0000b2735b130d3d128d873e144dbfc1",
      spId: "4azDWORrvSCLcJwuojAqMw",
    },
  ],
  hidden: false,
};

// Spotify
export const spAccountSchema = new Schema({
  userName: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Number, required: true },
});

export const SpAccount = model("SpAccount", spAccountSchema);

export interface SpAccountData {
  userName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
