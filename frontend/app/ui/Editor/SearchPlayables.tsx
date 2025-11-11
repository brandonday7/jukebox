import type { PlayableData } from "@/api";
import { useEffect, useState } from "react";
import { styled } from "styled-components/native";
import Artwork from "../common/Artwork";
import Button from "../common/Button";
import { useSearchState } from "@/state/searchState";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {} from "@/state/playbackState";
import { useVibeState } from "@/state/vibesState";
import { lighter } from "../helpers/color";
import { useThemeState } from "@/state/themeState";

const SIZE = 165;

const Root = styled.ScrollView<{ playing: boolean }>`
  padding: 20px 20px ${({ playing }) => (playing ? 220 : 130)}px 20px;
`;

const Heading = styled.Text`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const ArtistHeading = styled.View`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`;

const ClearContainer = styled.TouchableOpacity`
  padding: 20px;
  margin: -20px;
`;

const Clear = styled.Text`
  font-size: 17px;
  font-weight: 400;
  margin-bottom: 15px;
`;

const Input = styled.TextInput`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  font-size: 16px;
  margin-bottom: 20px;
`;

const PressableOption = styled.TouchableOpacity`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  position: relative;
`;

const Options = styled.View`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  padding-bottom: 20px;
`;

const Artists = styled(Options)``;
const Artist = styled(PressableOption)``;

const ArtworkContainer = styled.View`
  position: relative;
`;

const CheckmarkOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 122, 255, 0.6);
  border-radius: 4px;
  align-items: center;
  justify-content: center;
`;

const CheckmarkText = styled.Text`
  font-size: 30px;
  color: white;
`;

const Details = styled.View`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const PlayableName = styled.Text`
  color: black;
  font-size: 16px;
`;

const ArtistName = styled.Text`
  color: #444;
  font-size: 14px;
`;

const DummyOption = styled.View`
  flex-grow: 1;
  max-width: ${SIZE};
`;

const DoneContainer = styled.View<{ playing: boolean; color: string }>`
  position: absolute;
  bottom: ${({ playing }) => (playing ? 90 : 0)}px;
  left: 0;
  right: 0;
  height: 200px;
  background-color: ${({ color }) => color};
  padding: 20px;
`;

interface Props {
  onSubmit(playables: PlayableData[]): void;
}

const SearchPlayables = ({ onSubmit }: Props) => {
  const {
    fetchArtistSearchResults,
    playableSearchResults,
    artistSearchResults,
    fetchArtistAlbums,
    fetchPlaylist,
    reset,
  } = useSearchState();
  const { selectedPlayable: currentlyPlayingPlayable } = useVibeState();
  const { colorValues } = useThemeState();
  const [searchText, setSearchText] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<string>();
  const [selectedPlayables, setSelectedPlayables] = useState<PlayableData[]>(
    []
  );

  useEffect(() => {
    if (searchText.startsWith("https://open.spotify.com/playlist/")) {
      const regex = /\/playlist\/([a-zA-Z0-9]+)/;
      const match = searchText.match(regex);
      const spId = match ? match[1] : null;
      if (spId) {
        fetchPlaylist(spId);
      }
    } else {
      fetchArtistSearchResults(searchText);
    }
  }, [searchText, fetchArtistSearchResults, fetchPlaylist]);

  return (
    <>
      <BottomSheetScrollView>
        <Root playing={!!currentlyPlayingPlayable}>
          {selectedArtist ? (
            <>
              <ArtistHeading>
                <Heading>{selectedArtist}</Heading>
                <ClearContainer
                  onPress={() => {
                    setSelectedArtist(undefined);
                    setSearchText("");
                    reset();
                  }}
                >
                  <Clear>X</Clear>
                </ClearContainer>
              </ArtistHeading>
            </>
          ) : (
            <>
              <Heading>Search for an artist or playlist:</Heading>
              <Input
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Enter artist name or album/playlist URL..."
                autoCorrect={false}
                autoFocus
              />
            </>
          )}
          <Artists>
            {playableSearchResults === undefined &&
            artistSearchResults !== undefined &&
            artistSearchResults !== "loading"
              ? artistSearchResults.map((artist) => (
                  <Artist
                    key={artist.spId}
                    onPress={() => {
                      setSelectedArtist(artist.name);
                      fetchArtistAlbums(artist.spId, artist.name);
                    }}
                  >
                    <Artwork
                      url={artist.imageUrl}
                      title={artist.name}
                      size={SIZE}
                    />
                    <Details>
                      <ArtistName>{artist.name}</ArtistName>
                    </Details>
                  </Artist>
                ))
              : artistSearchResults === "loading"
              ? Array.from({ length: 20 }, (_, i) => i).map((index) => (
                  <Artwork key={index} url="" title="" size={SIZE} />
                ))
              : null}
            {playableSearchResults === undefined &&
            artistSearchResults !== undefined &&
            artistSearchResults !== "loading" &&
            artistSearchResults.length % 2 === 1 ? (
              <DummyOption />
            ) : null}
          </Artists>

          <Options>
            {playableSearchResults !== undefined &&
            playableSearchResults !== "loading"
              ? playableSearchResults.map((playable) => {
                  const selected = !!selectedPlayables.find(
                    (p) => p.spId === playable.spId
                  );

                  return (
                    <PressableOption
                      key={playable.spId}
                      onPress={() =>
                        selected
                          ? selectedPlayables.filter(
                              (p) => p.spId !== playable.spId
                            )
                          : setSelectedPlayables([
                              ...selectedPlayables,
                              playable,
                            ])
                      }
                    >
                      <ArtworkContainer>
                        <Artwork
                          title={playable.title}
                          url={playable.artworkUrl}
                          size={SIZE}
                        />
                        {selected && (
                          <CheckmarkOverlay>
                            <CheckmarkText>✓</CheckmarkText>
                          </CheckmarkOverlay>
                        )}
                      </ArtworkContainer>
                      <Details>
                        <PlayableName numberOfLines={1}>
                          {playable.title}
                        </PlayableName>
                        <ArtistName numberOfLines={1}>
                          {playable.artistName}
                        </ArtistName>
                      </Details>
                    </PressableOption>
                  );
                })
              : playableSearchResults === "loading"
              ? Array.from({ length: 20 }, (_, i) => i).map((index) => (
                  <Artwork key={index} url="" title=" " />
                ))
              : null}
            {playableSearchResults !== "loading" &&
            playableSearchResults !== undefined &&
            playableSearchResults.length % 2 === 1 ? (
              <DummyOption />
            ) : null}
          </Options>
        </Root>
      </BottomSheetScrollView>
      {playableSearchResults?.length ? (
        <DoneContainer
          playing={!!currentlyPlayingPlayable}
          color={colorValues ? lighter(...colorValues, 0.2) : "#fff"}
        >
          <Button
            onPress={() => {
              if (selectedPlayables.length) {
                onSubmit(selectedPlayables);
                setSearchText("");
                setSelectedPlayables([]);
              }
            }}
            disabled={!selectedPlayables?.length}
            title="Done"
          />
        </DoneContainer>
      ) : null}
    </>
  );
};

export default SearchPlayables;
