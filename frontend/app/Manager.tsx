import {
  deleteVibe,
  removePlayable as deletePlayable,
  type VibeData,
  type PlayableData,
} from "@/api";
import { Button, View } from "react-native";

const removeVibe = async (title: string) => await deleteVibe(title);
const removePlayable = async (title: string, spId: string) =>
  await deletePlayable(title, spId);

interface Props {
  vibe?: VibeData;
  playable?: PlayableData;
}

const Manager = ({ vibe, playable }: Props) => {
  return (
    <View>
      <Button
        disabled={!vibe}
        onPress={() => {
          if (vibe && playable) {
            removePlayable(vibe.title, playable.spId);
          } else if (vibe) {
            removeVibe(vibe.title);
          }
        }}
        title={playable ? "Remove playable" : "Delete vibe"}
      />
    </View>
  );
};

export default Manager;
