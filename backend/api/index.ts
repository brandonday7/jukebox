import {
  createOrUpdateVibe,
  findVibe,
  findVibes,
  insertPlayable,
  removePlayable,
  removeVibe,
} from "../db/index.ts";
import { pretty } from "../lib/helpers.ts";
import { validateVibe } from "./validators.ts";
import express from "express";
const router = express.Router();

router.get("/play", async (_req, res) => {
  res.send("playing");
});

router.get("/pause", async (_req, res) => {
  res.send("paused");
});

router.get("/vibes", async (_req, res) => {
  const vibes = await findVibes();
  res.send(vibes);
});

router.get("/vibe/:title", async (req, res) => {
  const vibe = await findVibe(req.params.title);
  res.send(vibe);
});

router.post("/vibe", validateVibe, async (req, res) => {
  const title = req.query.title as string;
  const playables = JSON.parse(req.query.playables as string);
  const hidden = req.query.hidden === "true";
  const vibe = await createOrUpdateVibe(title, playables, hidden);
  res.send(vibe);
});

router.post("/vibe/insertPlayable", async (req, res) => {
  const title = req.query.title as string;
  const playable = JSON.parse(req.query.playables as string);
  const index = Number(req.query.index);
  const vibe = await insertPlayable(title, playable, index);
  res.send(vibe);
});

router.post("/vibe/removePlayable", async (req, res) => {
  const title = req.query.title as string;
  const playable = JSON.parse(req.query.playables as string);
  const vibe = await removePlayable(title, playable);
  res.send(vibe);
});

router.delete("/vibe", async (req, res) => {
  const title = req.query.title as string;
  const vibe = await removeVibe(title);
  res.send(vibe);
});

export default router;
