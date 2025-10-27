import { useEffect, useState } from "react";
import { useVibeState } from "@/state/vibesState";
import { styled } from "styled-components/native";
import type { PlayableData, VibeData } from "@/api";
import { useRouter } from "expo-router";

const Root = styled.ScrollView`
  flex: 1;
  background-color: white;
  padding-top: 80px;
`;

const VibesContainer = styled.View`
  flex: 1;
  width: 100%;
  justify-content: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
`;

const PressableVibe = styled.TouchableOpacity`
  border-radius: 4px;
  width: 170px;
  height: 170px;
  background-color: #67b399;
  display: flex;
  align-items: center;
  justify-content: center;
  shadow-color: "#000";
  shadow-opacity: 0.3;
  shadow-radius: 3;
`;

const VibeText = styled.Text`
  color: white;
  font-size: 16px;
`;

const Vibes = () => {
  const { fetchVibes, vibes } = useVibeState();
  const [selectedVibe, setSelectedVibe] = useState<VibeData>();
  const [selectedPlayable, setSelectedPlayable] = useState<PlayableData>();
  const { push } = useRouter();

  useEffect(() => {
    if (!vibes) {
      fetchVibes();
    }
  }, [vibes, fetchVibes]);

  // If the selected vibe or playable has been removed, un-select them.
  useEffect(() => {
    if (
      vibes &&
      selectedVibe &&
      !vibes.find((v) => v.title === selectedVibe.title)
    ) {
      setSelectedVibe(undefined);
    }

    if (
      selectedVibe &&
      selectedPlayable &&
      !selectedVibe.playables.find((p) => p.spId === selectedPlayable.spId)
    ) {
      setSelectedPlayable(undefined);
    }
  }, [vibes, selectedVibe, selectedPlayable]);

  return (
    <Root>
      {vibes ? (
        <VibesContainer>
          {vibes.map((v) => (
            <PressableVibe
              key={v.title}
              onPress={() => {
                setSelectedVibe(v);
                push(`/vibes/${v.title}`);
              }}
            >
              <VibeText>{v.title}</VibeText>
            </PressableVibe>
          ))}
        </VibesContainer>
      ) : null}
    </Root>
  );
};

export default Vibes;
