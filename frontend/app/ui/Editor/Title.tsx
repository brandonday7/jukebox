import { useEffect, useRef, useState } from "react";
import { styled } from "styled-components/native";
import Button from "../common/Button";
import { TextInput } from "react-native";
import { BottomSheetView } from "@gorhom/bottom-sheet";

const Root = styled.View`
  flex: 1;
  padding: 20px;
`;

const Heading = styled.Text`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
`;

const InputWrapper = styled.View`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

interface Props {
  isOpen: boolean;
  onSubmit(title: string): void;
}

const Title = ({ onSubmit, isOpen }: Props) => {
  const [title, setTitle] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isOpen]);

  return (
    <BottomSheetView>
      <Root>
        <Heading>What is the name of your new vibe?</Heading>
        <InputWrapper>
          <TextInput
            ref={inputRef}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter vibe name..."
            autoCapitalize="words"
            autoCorrect={false}
            style={{ fontSize: 16 }}
          />
        </InputWrapper>
        <Button
          onPress={() => onSubmit(title)}
          disabled={!title.trim()}
          title="Create Vibe"
        />
      </Root>
    </BottomSheetView>
  );
};

export default Title;
