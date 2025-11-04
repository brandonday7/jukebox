import { useState } from "react";
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
  onSubmit(title: string): void;
}

const Title = ({ onSubmit }: Props) => {
  const [title, setTitle] = useState("");

  return (
    <Root>
      <Heading>What is the name of your new vibe?</Heading>
      <Input
        value={title}
        onChangeText={setTitle}
        placeholder="Enter vibe name..."
        autoCapitalize="words"
        autoCorrect={false}
        autoFocus
      />
      <SubmitButton onPress={() => onSubmit(title)} disabled={!title.trim()}>
        <SubmitButtonText>Create Vibe</SubmitButtonText>
      </SubmitButton>
    </Root>
  );
};

export default Title;
