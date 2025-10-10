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
