import { useEffect, useRef, useState } from "react";
import { useVibeState } from "@/state/vibesState";
import { styled } from "styled-components/native";
import type { VibeData } from "@/api";
import { useRouter } from "expo-router";
import Header from "./common/Header";
import { Alert, RefreshControl } from "react-native";
import { BlankArtwork } from "./common/Artwork";
import { lighter } from "./helpers/color";
import Editor, { type BottomSheetRef } from "./Editor";
import { useThemeState } from "@/state/themeState";
import * as Haptics from "expo-haptics";

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
  padding-bottom: ${({ playing }) => (playing ? 95 : 15)}px;
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
  const {
    fetchVibes,
    vibes,
    removeVibe,
    selectedPlayable,
    clearVibes,
    addRecentlySelectedVibe,
    clearRecentlySelectedVibes,
    recentlySelectedVibes,
  } = useVibeState();
  const { colorValues, defaultColor } = useThemeState();
  const { push } = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    if (!vibes) {
      fetchVibes();
    }
  }, [vibes, fetchVibes]);

  useEffect(() => {
    if (
      vibes &&
      vibes.length > 1 &&
      vibes.length === recentlySelectedVibes.length
    ) {
      clearRecentlySelectedVibes();
    }
  }, [recentlySelectedVibes, vibes, clearRecentlySelectedVibes]);

  const onSelect = (vibe: VibeData) => {
    push(`/vibes/${vibe.title}`);
    addRecentlySelectedVibe(vibe.title);
  };

  return (
    <>
      <Root
        color={colorValues ? lighter(...colorValues, 0.2) : defaultColor}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

              setRefreshing(true);
              clearVibes();
              setTimeout(() => setRefreshing(false), 500);
            }}
          />
        }
      >
        <Header
          title="Vibes"
          mixItUp={
            vibes?.length
              ? () => {
                  const availableRandomVibes =
                    vibes.length === recentlySelectedVibes.length
                      ? vibes
                      : vibes.filter(
                          (p) => !recentlySelectedVibes.includes(p.title)
                        );
                  const randomVibe =
                    availableRandomVibes[
                      Math.floor(Math.random() * availableRandomVibes.length)
                    ];
                  onSelect(randomVibe);
                }
              : undefined
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
            <PressableVibe onPress={() => bottomSheetRef.current?.open()}>
              <BlankArtwork title="+ Create" />
            </PressableVibe>
            {(vibes.length + 1) % 2 === 1 ? <DummyVibe /> : null}
          </VibesContainer>
        ) : null}
      </Root>
      <Editor initialPage="title" ref={bottomSheetRef} />
    </>
  );
};

export default Vibes;
