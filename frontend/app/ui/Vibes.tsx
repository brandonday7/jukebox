import { useEffect, useRef } from "react";
import { useVibeState } from "@/state/vibesState";
import { styled } from "styled-components/native";
import type { VibeData } from "@/api";
import { useRouter } from "expo-router";
import Header from "./common/Header";
import { Alert } from "react-native";
import { BlankArtwork } from "./common/Artwork";
import colorHash, { lighter } from "./helpers/color";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Editor from "./Editor";

const Root = styled.ScrollView<{ color: string }>`
  flex: 1;
  background-color: white;
  padding-top: 15px;
  background-color: ${({ color }) => color};
`;

const VibesContainer = styled.View<{ playing: boolean }>`
  flex: 1;
  width: 100%;
  justify-content: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  padding-bottom: ${({ playing }) => (playing ? 120 : 40)}px;
`;

const PressableVibe = styled.TouchableOpacity`
  shadow-color: "#000";
  shadow-opacity: 0.3;
  shadow-radius: 3px;
`;

const DummyVibe = styled.View`
  flex-grow: 1;
  max-width: 170px;
`;

const Vibes = () => {
  const { fetchVibes, vibes, removeVibe, selectedPlayable } = useVibeState();
  const { push } = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (!vibes) {
      fetchVibes();
    }
  }, [vibes, fetchVibes]);

  const onSelect = (vibe: VibeData) => {
    push(`/vibes/${vibe.title}`);
  };

  const colorValues = selectedPlayable
    ? colorHash.hsl(selectedPlayable.title)
    : null;

  return (
    <>
      <Root color={colorValues ? lighter(...colorValues, 0.2) : "#fff"}>
        <Header
          title="Vibes"
          mixItUp={() =>
            vibes
              ? onSelect(vibes[Math.floor(Math.random() * vibes.length)])
              : null
          }
        />
        {vibes ? (
          <VibesContainer playing={!!selectedPlayable}>
            {vibes.map((v) => (
              <PressableVibe
                key={v.title}
                onPress={() => onSelect(v)}
                onLongPress={() => {
                  Alert.alert(
                    "Delete vibe",
                    `Are you sure you want to delete '${v.title}' from your library?`,
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Delete",
                        onPress: () => removeVibe(v.title),
                        style: "default",
                      },
                    ]
                  );
                }}
              >
                <BlankArtwork title={v.title} />
              </PressableVibe>
            ))}
            <PressableVibe onPress={() => bottomSheetRef.current?.expand()}>
              <BlankArtwork title="+ Create" />
            </PressableVibe>
            {(vibes.length + 1) % 2 === 1 ? <DummyVibe /> : null}
          </VibesContainer>
        ) : null}
      </Root>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[1, "95%"]}
        style={{ paddingTop: 15 }}
        index={-1}
      >
        <BottomSheetView>
          <Editor initialPage="title" />
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

export default Vibes;
