import { styled } from "styled-components/native";
import type { Page } from ".";

const Root = styled.View`
  flex: 1;
  padding: 20px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 30px;
`;

const ButtonContainer = styled.View`
  gap: 15px;
`;

const OptionButton = styled.TouchableOpacity`
  background-color: #007aff;
  padding: 20px;
  border-radius: 8px;
  align-items: center;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: 600;
`;

const ButtonDescription = styled.Text`
  color: white;
  font-size: 14px;
  margin-top: 5px;
  opacity: 0.9;
`;

type Format = Extract<Page, "csv" | "search">;

interface Props {
  onSubmit: (format: Format) => void;
}

const SelectFormat = ({ onSubmit }: Props) => {
  return (
    <Root>
      <Title>How would you like to add playables?</Title>
      <ButtonContainer>
        <OptionButton onPress={() => onSubmit("search")}>
          <ButtonText>Search</ButtonText>
          <ButtonDescription>Search for albums manually</ButtonDescription>
        </OptionButton>

        <OptionButton onPress={() => onSubmit("csv")}>
          <ButtonText>CSV Upload</ButtonText>
          <ButtonDescription>Import from a CSV file</ButtonDescription>
        </OptionButton>
      </ButtonContainer>
    </Root>
  );
};

export default SelectFormat;
