import { useEffect, useRef, useState } from "react";
import { useVibeState } from "@/state/vibesState";
import { styled } from "styled-components/native";
import type { VibeData } from "@/api";
import { useRouter } from "expo-router";
import Header from "./common/Header";
import { Alert } from "react-native";
import { BlankArtwork } from "./common/Artwork";
import { lighter } from "./helpers/color";
import Editor, { type BottomSheetRef } from "./Editor";
import { useThemeState } from "@/state/themeState";
import { useSystemState } from "@/state/systemState";

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

const LoadingMessage = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
  margin-top: -100px;
  gap: 10px;
`;

const LoadingText = styled.Text`
  text-align: center;
`;

const Vibes = () => {
  const { timeWaiting, setTimeWaiting, awakeServer } = useSystemState();

  const { fetchVibes, vibes, removeVibe, selectedPlayable } = useVibeState();
  const { colorValues, defaultColor } = useThemeState();
  const { push } = useRouter();
  const [countdown, setCountdown] = useState(60);
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    awakeServer();
    setTimeout(() => setTimeWaiting(2000), 2000);
  }, [awakeServer, setTimeWaiting]);

  useEffect(() => {
    if (!vibes) {
      setTimeout(() => setCountdown(countdown - 1), 1000);
    }
  }, [countdown, setCountdown, vibes]);

  useEffect(() => {}, [vibes]);

  useEffect(() => {
    if (!vibes) {
      fetchVibes();
    }
  }, [vibes, fetchVibes]);

  const onSelect = (vibe: VibeData) => {
    push(`/vibes/${vibe.title}`);
  };

  if (timeWaiting) {
    return (
      <>
        <Header title="Vibes" />
        <LoadingMessage>
          <LoadingText>
            Jukebox uses a free server, which needs to restart after long
            periods of inactivity.
          </LoadingText>
          <LoadingText>
            Please wait about {countdown}{" "}
            {countdown === 1 ? "second" : "seconds"}
            ...
          </LoadingText>
        </LoadingMessage>
      </>
    );
  }

  return (
    <>
      <Root color={colorValues ? lighter(...colorValues, 0.2) : defaultColor}>
        <Header
          title="Vibes"
          mixItUp={
            vibes?.length
              ? () => onSelect(vibes[Math.floor(Math.random() * vibes.length)])
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
