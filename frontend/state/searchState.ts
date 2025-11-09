import {
  getArtistAlbums,
  getPlaylist,
  searchArtists,
  type Artist,
  type PlayableData,
} from "@/api";
import debounce from "@/lib/debounce";
import { create } from "zustand";

interface SearchState {
  searchText: string;
  artistSearchResults?: Artist[] | "loading";
  playableSearchResults?: PlayableData[] | "loading";
  fetchArtistSearchResults(searchText: string): void;
  fetchArtistAlbums(spId: string, artistName: string): void;
  fetchPlaylist(spId: string): void;
  reset(): void;
}

export const useSearchState = create<SearchState>((set, get) => {
  const debouncedArtistSearch = debounce(async (searchText: string) => {
    const { artists } = await searchArtists(searchText);
    const currentText = get().searchText;
    if (searchText === currentText) {
      set({ artistSearchResults: artists });
    }
  }, 500);

  return {
    searchText: "",
    artistSearchResults: undefined,
    playableSearchResults: undefined,
    fetchArtistSearchResults: async (searchText) => {
      if (!searchText) {
        set(() => ({ artistSearchResults: undefined, searchText }));
        return;
      }

      set(() => ({ artistSearchResults: "loading", searchText }));
      debouncedArtistSearch(searchText);
    },
    fetchArtistAlbums: async (spId, artistName) => {
      set(() => ({ playableSearchResults: "loading", searchText: "" }));
      const { albums } = await getArtistAlbums(spId, artistName);
      set(() => ({ playableSearchResults: albums }));
    },
    fetchPlaylist: async (spId) => {
      set(() => ({ playableSearchResults: "loading", searchText: "" }));
      const { playlist } = await getPlaylist(spId);
      set(() => ({ playableSearchResults: [playlist] }));
    },
    reset: () =>
      set(() => ({
        searchText: "",
        artistSearchResults: undefined,
        playableSearchResults: undefined,
      })),
  };
});
