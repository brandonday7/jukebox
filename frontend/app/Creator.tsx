import type { PlayableData } from "@/api";
import { useVibeState } from "@/state/vibesState";
import { useEffect, useState } from "react";
import { Button, Text, TextInput } from "react-native";

const Creator = () => {
  const { insertPlayable, createVibe, vibes } = useVibeState();
  const [title, setTitle] = useState("");
  const [index, setIndex] = useState<number>();
  const [playableString, setPlayableString] = useState("");
  const [playables, setPlayables] = useState<PlayableData[]>();

  const existingVibe = vibes?.find((v) => v.title === title);

  useEffect(() => {
    if (playableString) {
      const formattedPlayables = formatPlayables(playableString);
      if (formatPlayables.length) {
        setPlayables(formattedPlayables);
      }
    }
  }, [playableString]);

  return (
    <>
      <Text>Title</Text>
      <TextInput value={title} onChangeText={(val) => setTitle(val)} />
      <Text>Index</Text>
      <TextInput
        value={index?.toString() || ""}
        keyboardType="numeric"
        onChangeText={(val) => setIndex(Number(val))}
      />
      <Text>Playables</Text>
      <TextInput
        multiline
        value={playableString}
        onChangeText={(val) => setPlayableString(val)}
      />
      <Button
        title={
          !existingVibe || (playables || []).length > 1
            ? "Create vibe!"
            : "Insert playable!"
        }
        disabled={!title || !playables}
        onPress={() => {
          if (playables) {
            if (!existingVibe || playables.length > 1) {
              createVibe(title, playables);
            } else {
              insertPlayable(title, playables[0], index);
            }
          }
        }}
      />
    </>
  );
};

export default Creator;

const formatPlayables = (playableString: string) => {
  const rows = playableString.split("\n");
  try {
    return rows.map((row) => {
      const fields = row.split("	");
      return {
        type: fields[3].toLocaleLowerCase(),
        title: fields[0],
        artistName: fields[1],
        spId: fields[2],
      } as PlayableData;
    });
  } catch {
    return [];
  }
};
