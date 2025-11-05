import { useVibeState } from "@/state/vibesState";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Title from "./Title";
import InputCsv from "./InputCsv";
import SelectFormat from "./SelectFormat";
import SearchPlayables from "./SearchPlayables";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { TextButton } from "../common/Button";
import { styled } from "styled-components/native";
import { lighter } from "../helpers/color";
import { useThemeState } from "@/state/themeState";

export type Page = "title" | "selectFormat" | "csv" | "search";

export interface BottomSheetRef {
  open: () => void;
  close: () => void;
}

interface Props {
  initialPage: Page;
  vibeTitle?: string;
}

const Editor = forwardRef<BottomSheetRef, Props>(function EditorSheet(
  { initialPage, vibeTitle },
  ref
) {
  const { insertPlayables, createVibe, vibes } = useVibeState();
  const { colorValues, defaultColor } = useThemeState();
  const [title, setTitle] = useState(vibeTitle);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState<Page>(initialPage);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const existingVibe = vibes?.find((v) => v.title === title);

  useImperativeHandle(ref, () => ({
    open: () => {
      bottomSheetRef.current?.expand();
    },
    close: () => {
      bottomSheetRef.current?.close();
    },
  }));

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={[1, "95%"]}
      style={{ paddingTop: 15 }}
      index={-1}
      backgroundStyle={{
        backgroundColor: colorValues
          ? lighter(...colorValues, 0.1)
          : defaultColor,
      }}
      onChange={(val) => {
        if (val <= 0) {
          setTitle(vibeTitle);
          setPage(initialPage);
          setIsOpen(false);
        } else {
          setIsOpen(true);
        }
      }}
    >
      <BottomSheetScrollView>
        {page === "title" ? (
          <Title
            isOpen={isOpen}
            onSubmit={(t) => {
              setTitle(t);
              setPage("selectFormat");
            }}
          />
        ) : page === "selectFormat" ? (
          <>
            {initialPage === "title" && (
              <Back onPress={() => setPage("title")} />
            )}
            <SelectFormat
              onSubmit={(selection) => {
                setPage(selection);
              }}
            />
          </>
        ) : page === "csv" ? (
          <>
            <Back onPress={() => setPage("selectFormat")} />
            <InputCsv
              onSubmit={(playables) => {
                if (title) {
                  if (!existingVibe) {
                    createVibe(title, playables);
                  } else {
                    insertPlayables(title, playables);
                  }
                }
                bottomSheetRef.current?.close();
              }}
            />
          </>
        ) : page === "search" ? (
          <>
            <Back onPress={() => setPage("selectFormat")} />
            <SearchPlayables
              onSubmit={(playables) => {
                if (title) {
                  if (!existingVibe) {
                    createVibe(title, playables);
                  } else {
                    insertPlayables(title, playables);
                  }
                }
                bottomSheetRef.current?.close();
              }}
            />
          </>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

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
