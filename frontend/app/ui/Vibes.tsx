import { useEffect, useState } from "react";
import { useVibeState } from "@/state/vibesState";
import { styled } from "styled-components/native";
import type { VibeData } from "@/api";
import { useRouter } from "expo-router";
import Header from "./common/Header";

const Root = styled.ScrollView`
  flex: 1;
  background-color: white;
  padding-top: 15px;
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
  const { fetchVibes, vibes, selectedPlayable, setSelectedPlayable } =
    useVibeState();
  const [selectedVibe, setSelectedVibe] = useState<VibeData>();
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
  }, [vibes, selectedVibe, selectedPlayable, setSelectedPlayable]);

  const onSelect = (vibe: VibeData) => {
    setSelectedVibe(vibe);
    push(`/vibes/${vibe.title}`);
  };

  return (
    <Root>
      <Header
        title="Vibes"
        mixItUp={() =>
          vibes
            ? onSelect(vibes[Math.floor(Math.random() * vibes.length)])
            : null
        }
      />
      {vibes ? (
        <VibesContainer>
          {vibes.map((v) => (
            <PressableVibe key={v.title} onPress={() => onSelect(v)}>
              <VibeText>{v.title}</VibeText>
            </PressableVibe>
          ))}
        </VibesContainer>
      ) : null}
    </Root>
  );
};

export default Vibes;
