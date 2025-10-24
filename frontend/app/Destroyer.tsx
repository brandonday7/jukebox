import type { VibeData, PlayableData } from "@/api";
import { useVibeState } from "@/state/vibesState";
import { Button, View } from "react-native";

interface Props {
  vibe?: VibeData;
  playable?: PlayableData;
}

const Destroyer = ({ vibe, playable }: Props) => {
  const { removePlayable, removeVibe } = useVibeState();

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

export default Destroyer;
