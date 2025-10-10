export interface Playable {
  type: "album" | "playlist";
  title: string;
  artistName: string;
  artworkUrl?: string;
  spId: string;
}

export interface Catalog {
  title: string;
  playables: Playable[];
}

export interface Library {
  title: string;
  catalogs: Catalog[];
}

export const MAC = {
  type: "album" as const,
  title: "This Old Dog",
  artistName: "Mac Demarco",
  artworkUrl:
    "https://i.scdn.co/image/ab67616d00001e029f1b21f21b13ff2d3e891f6b",
  spId: "4NNq2vwTapv4fSJcrZbPH7",
};
