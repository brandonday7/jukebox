export interface Playable {
  type: "album" | "playlist";
  title: string;
  artistName: string;
  artworkUrl?: string;
  spId: string;
}

export interface Catalog {
  id: string;
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

export const ZEP = {
  type: "album" as const,
  title: "Houses of the Holy",
  artistName: "Led Zeppelin",
  artworkUrl:
    "https://i.scdn.co/image/ab67616d00001e021aa47e71c4edfeaddb65cd54",
  spId: "0GqpoHJREPp0iuXK3HzrHk",
};
