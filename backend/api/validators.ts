import type { PlayableData } from "../db/schema";

export const validateVibe = (req, res, next) => {
  const data = req.body;
  if (
    typeof data.title !== "string" ||
    typeof data.playables.map(isValidPlayable).find((b) => b === false) ||
    typeof data.hidden !== "boolean"
  ) {
    return res.status(400).json({
      error: "Invalid data format",
      expected:
        "Vibe { title: string, playables?: PlayableData[], hidden?: boolean }",
    });
  }

  next();
};

export const isValidPlayable = (playable: PlayableData): boolean => {
  return (
    (playable.type === "album" || playable.type === "playlist") &&
    typeof playable.title === "string" &&
    typeof playable.artistName === "string" &&
    typeof playable.spId === "string"
  );
};

export const validatePlayable = (req, res, next) => {
  const data = req.body;
  if (!isValidPlayable(data)) {
    return res.status(400).json({
      error: "Invalid data format",
      expected:
        "Playable { type: PlayableType; title: string; artistName: string; artworkUrl?: string; spId: string; }",
    });
  }

  next();
};
