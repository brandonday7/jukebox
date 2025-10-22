import { createVibe, type PlayableData } from "@/api";
import { useState } from "react";
import { Button, Text, TextInput } from "react-native";

const create = async (title: string, playables: PlayableData[]) =>
  await createVibe(title, playables);

const Creator = () => {
  const [title, setTitle] = useState("");
  const [playableString, setPlayableString] = useState("");

  return (
    <>
      <Text>Title</Text>
      <TextInput
        multiline
        value={title}
        onChangeText={(val) => setTitle(val)}
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
        onPress={() => create(title, formatPlayables(playableString))}
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
