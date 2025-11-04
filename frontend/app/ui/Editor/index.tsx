import { useVibeState } from "@/state/vibesState";
import { useState } from "react";
import Title from "./Title";
import InputCsv from "./InputCsv";
import SelectFormat from "./SelectFormat";
import SearchPlayables from "./SearchPlayables";

export type Page = "title" | "selectFormat" | "csv" | "search";

interface Props {
  initialPage: Page;
  vibeTitle?: string;
}

const Editor = ({ vibeTitle, initialPage }: Props) => {
  const { insertPlayable, createVibe, vibes } = useVibeState();
  const [title, setTitle] = useState(vibeTitle);
  const [page, setPage] = useState<Page>(initialPage);

  const existingVibe = vibes?.find((v) => v.title === title);

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
      <SelectFormat
        onSubmit={(selection) => {
          setPage(selection);
        }}
      />
    );
  }

  if (page === "csv") {
    return (
      <InputCsv
        onSubmit={(playables) => {
          if (title) {
            if (!existingVibe || playables.length > 1) {
              createVibe(title, playables);
            } else {
              insertPlayable(title, playables[0]);
            }
          }
        }}
      />
    );
  }

  return (
    <SearchPlayables
      onSubmit={(playables) => {
        if (title) {
          if (!existingVibe || playables.length > 1) {
            createVibe(title, playables);
          } else {
            insertPlayable(title, playables[0]);
          }
        }
      }}
    />
  );
};

export default Editor;
