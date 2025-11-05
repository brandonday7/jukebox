import { useState } from "react";
import { styled } from "styled-components/native";
import Button from "../common/Button";

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
      <Button
        onPress={() => onSubmit(title)}
        disabled={!title.trim()}
        title="Create Vibe"
      />
    </Root>
  );
};

export default Title;
