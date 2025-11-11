import type { PlayableData, VibeData } from "../db/schema.js";
import { isDefined } from "../lib/helpers.js";
import { Request, Response, NextFunction } from "express";

export const validateVibe = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = req.body as VibeData;

  if (
    typeof data.title !== "string" ||
    !!data.playables.map((p) => isValidPlayable(p)).filter((b) => !b).length ||
    (isDefined(data.hidden) && typeof data.hidden !== "boolean")
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

export const validatePlayable = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
