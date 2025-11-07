import { searchArtists, type Artist, type PlayableData } from "@/api";
import debounce from "@/lib/debounce";
import { create } from "zustand";

interface SearchState {
  searchText: string;
  artistSearchResults?: Artist[] | "loading";
  playableSearchResults?: PlayableData[] | "loading";
  fetchArtistSearchResults(searchText: string): void;
  reset(): void;
  //   fetchPlayableSearchResults(searchText: string): void;
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
    reset: () =>
      set(() => ({
        searchText: "",
        artistSearchResults: undefined,
        playableSearchResults: undefined,
      })),

    //   fetchPlayableSearchResults: async (searchText) => {
    //     set(() => ({ playableSearchResults: "loading", searchText }));
    //     const playableSearchResults = await searchPlayables(searchText);
    //     const searchTextRefreshed = get().searchText;
    //     if (searchText === searchTextRefreshed) {
    //       set(() => ({ playableSearchResults }));
    //     }
    //   },
  };
});
