import type { PlayableData } from "@/api";
import { useState } from "react";
import { styled } from "styled-components/native";
import Artwork from "../common/Artwork";

const Root = styled.View`
  flex: 1;
  padding: 20px 20px 80px 20px;
`;

const Heading = styled.Text`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
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
  max-width: 170px;
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

const SubmitButton = styled.TouchableOpacity<{ disabled: boolean }>`
  background-color: ${({ disabled }) => (disabled ? "#cccccc" : "#007AFF")};
  padding: 15px;
  border-radius: 8px;
  align-items: center;
`;

const SubmitButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 600;
`;

interface Props {
  onSubmit(playables: PlayableData[]): void;
}

const SearchPlayables = ({ onSubmit }: Props) => {
  const [search, setSearchText] = useState("");
  const [playables, setPlayables] = useState<PlayableData[]>([]);

  return (
    <Root>
      <Heading>Search for an artist or playlist:</Heading>
      <Input
        value={search}
        onChangeText={setSearchText}
        placeholder="Enter artist name or album/playlist URL..."
        autoCorrect={false}
        autoFocus
      />
      <Options>
        {PLAYABLES.map((playable) => {
          const selected = !!playables.find((p) => p.spId === playable.spId);

          return (
            <PressableOption
              key={playable.spId}
              onPress={() =>
                selected
                  ? playables.filter((p) => p.spId !== playable.spId)
                  : setPlayables([...playables, playable])
              }
            >
              <ArtworkContainer>
                <Artwork title={playable.title} url={playable.artworkUrl} />
                {selected && (
                  <CheckmarkOverlay>
                    <CheckmarkText>✓</CheckmarkText>
                  </CheckmarkOverlay>
                )}
              </ArtworkContainer>
              <Details>
                <PlayableName numberOfLines={1}>{playable.title}</PlayableName>
                <ArtistName numberOfLines={1}>{playable.artistName}</ArtistName>
              </Details>
            </PressableOption>
          );
        })}
      </Options>

      <SubmitButton
        onPress={() => (playables?.length ? onSubmit(playables) : null)}
        disabled={!playables?.length}
      >
        <SubmitButtonText>Done</SubmitButtonText>
      </SubmitButton>
    </Root>
  );
};

export default SearchPlayables;

const PLAYABLES: PlayableData[] = [
  {
    type: "album",
    title: "Ambient 2: Plateaux of Mirror",
    artistName: "Brian Eno & Harold Budd",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b273eba05344ff7ca99e2fd35545",
    spId: "5ma9r5NFV0poevmydI2qgO",
  },
  {
    type: "album",
    title: "The Wind",
    artistName: "Ann Annie",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b2736db70afe2a3be544bd30c59f",
    spId: "3p3aeKnW3SPIIOMhvF5FjL",
  },
  {
    type: "album",
    title: "re:member",
    artistName: "Ólafur Arnalds",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b2735c207f23ab7902473230ec0f",
    spId: "6JpQGIi2he6iskzR4aLwPG",
  },
  {
    type: "album",
    title: "Music For Psychedelic Therapy",
    artistName: "Jon Hopkins",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b27393aef79359f962008a3652e5",
    spId: "2zY5p176SfmupXceLKT6bH",
  },
  {
    type: "album",
    title: "Piano Versions",
    artistName: "Jon Hopkins",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b273cc525c01a9227a3657662fb3",
    spId: "1vJp2Gd1xz0TqnQs0vCr1I",
  },
  {
    type: "album",
    title: "Immunity",
    artistName: "Jon Hopkins",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b27313112e7032a7954a0b51f833",
    spId: "0Dg1KwgmtUzeMQonDCUFhQ",
  },
  {
    type: "album",
    title: "Music for Nine Post Cards",
    artistName: "Hiroshi Yoshimura",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b273c94d03978dce81c7cbb937b2",
    spId: "2vgc3dNLfceYv2k1vxK2zA",
  },
  {
    type: "album",
    title: "Green",
    artistName: "Hiroshi Yoshimura",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b273f5c039e15a8c177829ce1252",
    spId: "1tA76N9gawQrNcDkhGXx1A",
  },
  {
    type: "album",
    title: "Secret Life",
    artistName: "Fred again.. & Brian Eno",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b273a9b0cf4827dd4bc73f2f0699",
    spId: "1FJVbtVFLARPKbn1HepNh1",
  },
  {
    type: "album",
    title: "Normal People",
    artistName: "Stephen Rennicks",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b2736434917990a2c6dabb441860",
    spId: "3WsKQ06VJYFnl5msx295V9",
  },
  {
    type: "album",
    title: "Five Easy Hotdogs",
    artistName: "Mac DeMarco",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b273f4ec5161a2cedca8eecb01c0",
    spId: "25uSuCBWf1D8XZ5gC3tik1",
  },
  {
    type: "album",
    title: "These Semi Feelings, They Are Everywhere",
    artistName: "dné",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b2730c409a6beffe036695f28687",
    spId: "0Kf95Rn5K6HNqYTfOYvsNy",
  },
  {
    type: "playlist",
    title: "Ambient baby",
    artistName: "Nick Vereshchak",
    spId: "3WIhNenICxhIckz9DktgYK",
  },
  {
    type: "album",
    title: "Motion",
    artistName: "Peter Sandberg",
    artworkUrl:
      "https://i.scdn.co/image/ab67616d0000b27326b91f8f75b95978e0ff0541",
    spId: "1gS96GdBcmp3BGrdHQLGrp",
  },
];
