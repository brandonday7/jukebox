import { deleteVibe, type VibeData } from "@/api";
import { Button, View } from "react-native";

const removeVibe = async (title: string) => await deleteVibe(title);

interface Props {
  vibe?: VibeData;
}

const Manager = ({ vibe }: Props) => {
  return (
    <View>
      <Button
        disabled={!vibe}
        onPress={() => (vibe ? removeVibe(vibe.title) : null)}
        title="Delete Vibe"
      />
    </View>
  );
};

export default Manager;
