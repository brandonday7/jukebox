import { createVibe, insertPlayable, type PlayableData } from "@/api";
import { useState } from "react";
import { Button, Text, TextInput } from "react-native";

const create = async (title: string, playables: PlayableData[]) =>
  await createVibe(title, playables);

const insert = async (title: string, playable: PlayableData, index?: number) =>
  await insertPlayable(title, playable, index);

const Creator = () => {
  const [title, setTitle] = useState("");
  const [index, setIndex] = useState<number>();
  const [playableString, setPlayableString] = useState("");

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
        title="Create!"
        disabled={!title || !playableString}
        onPress={() => {
          const playables = formatPlayables(playableString);

          if (playables.length === 1) {
            insert(title, playables[0], index);
          } else {
            create(title, playables);
          }
        }}
      />
    </>
  );
};

export default Creator;

const formatPlayables = (playableString: string) => {
  const rows = playableString.split("\n");
  return rows.map((row) => {
    const fields = row.split("	");
    return {
      type: fields[3].toLocaleLowerCase(),
      title: fields[0],
      artistName: fields[1],
      spId: fields[2],
    } as PlayableData;
  });
};
