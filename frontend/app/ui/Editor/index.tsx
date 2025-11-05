import { useVibeState } from "@/state/vibesState";
import { useState, type RefObject } from "react";
import Title from "./Title";
import InputCsv from "./InputCsv";
import SelectFormat from "./SelectFormat";
import SearchPlayables from "./SearchPlayables";
import type BottomSheet from "@gorhom/bottom-sheet";
import { TextButton } from "../common/Button";
import { styled } from "styled-components/native";

export type Page = "title" | "selectFormat" | "csv" | "search";

interface Props {
  initialPage: Page;
  vibeTitle?: string;
  bottomSheetRef?: RefObject<BottomSheet | null>;
}

const Editor = ({ vibeTitle, initialPage, bottomSheetRef }: Props) => {
  const { insertPlayable, createVibe, vibes } = useVibeState();
  const [title, setTitle] = useState(vibeTitle);
  const [page, setPage] = useState<Page>(initialPage);

  const existingVibe = vibes?.find((v) => v.title === title);

  const reset = () => {
    setTitle("");
    setPage(initialPage);
    bottomSheetRef?.current?.close();
  };

  if (page === "title") {
    return (
      <Title
        onSubmit={(t) => {
          setTitle(t);
          setPage("selectFormat");
        }}
      />
    );
  }

  if (page === "selectFormat") {
    return (
      <>
        <Back onPress={() => setPage("title")} />
        <SelectFormat
          onSubmit={(selection) => {
            setPage(selection);
          }}
        />
      </>
    );
  }

  if (page === "csv") {
    return (
      <>
        <Back onPress={() => setPage("selectFormat")} />
        <InputCsv
          onSubmit={(playables) => {
            if (title) {
              if (!existingVibe || playables.length > 1) {
                createVibe(title, playables);
              } else {
                insertPlayable(title, playables[0]);
              }
            }
            reset();
          }}
        />
      </>
    );
  }

  return (
    <>
      <Back onPress={() => setPage("selectFormat")} />
      <SearchPlayables
        onSubmit={(playables) => {
          if (title) {
            if (!existingVibe || playables.length > 1) {
              createVibe(title, playables);
            } else {
              insertPlayable(title, playables[0]);
            }
          }
          reset();
        }}
      />
    </>
  );
};

export default Editor;

const StyledTextButton = styled(TextButton)`
  padding: 20px;
  padding-left: 40px;
  margin: -20px;
`;

interface BackProps {
  onPress(): void;
}

const Back = ({ onPress }: BackProps) => (
  <StyledTextButton onPress={onPress} title="< BACK" />
);
