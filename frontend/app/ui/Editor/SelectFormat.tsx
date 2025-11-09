import { styled } from "styled-components/native";
import type { Page } from ".";
import Button from "../common/Button";
import { BottomSheetView } from "@gorhom/bottom-sheet";

const Root = styled.View`
  flex: 1;
  padding: 20px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 600;
  margin-vertical: 30px;
`;

const ButtonContainer = styled.View`
  gap: 15px;
`;

type Format = Extract<Page, "csv" | "search">;

interface Props {
  onSubmit: (format: Format) => void;
}

const SelectFormat = ({ onSubmit }: Props) => {
  return (
    <BottomSheetView>
      <Root>
        <Title>How would you like to add playables?</Title>
        <ButtonContainer>
          <Button
            onPress={() => onSubmit("search")}
            title="Search"
            description="Search for albums manually"
          />
          <Button
            onPress={() => onSubmit("csv")}
            title="CSV Upload"
            description="Import from a CSV file"
          />
        </ButtonContainer>
      </Root>
    </BottomSheetView>
  );
};

export default SelectFormat;
