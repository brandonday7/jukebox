import type { PlayableData } from "@/api";
import { useEffect, useState } from "react";
import { styled } from "styled-components/native";

const Root = styled.View`
  flex: 1;
  padding: 20px;
`;

const Heading = styled.Text`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
`;

const Input = styled.TextInput`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  font-size: 16px;
  margin-bottom: 20px;
`;

const SubmitButton = styled.TouchableOpacity<{ disabled: boolean }>`
  background-color: ${({ disabled }) => (disabled ? "#cccccc" : "#007AFF")};
  padding: 15px;
  border-radius: 8px;
  align-items: center;
`;

const SubmitButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 600;
`;

interface Props {
  onSubmit(playables: PlayableData[]): void;
}

const InputCsv = ({ onSubmit }: Props) => {
  const [playables, setPlayables] = useState<PlayableData[]>();
  const [playablesString, setPlayablesString] = useState("");

  useEffect(() => {
    if (playablesString) {
      const formattedPlayables = formatPlayables(playablesString);
      if (formatPlayables.length) {
        setPlayables(formattedPlayables);
      }
    }
  }, [playablesString]);

  return (
    <Root>
      <Heading>CSV Insert:</Heading>
      <Input
        value={playablesString}
        onChangeText={setPlayablesString}
        placeholder="Paste rows..."
        autoCorrect={false}
        autoFocus
      />
      <SubmitButton
        onPress={() => (playables?.length ? onSubmit(playables) : null)}
        disabled={!playables?.length}
      >
        <SubmitButtonText>Done</SubmitButtonText>
      </SubmitButton>
    </Root>
  );
};

export default InputCsv;

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
