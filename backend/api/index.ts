import {
  createOrUpdateVibe,
  createOrUpdateSpAccount,
  findVibe,
  findVibes,
  getSpAccount,
  insertPlayable,
  removePlayable,
  removeVibe,
} from "../db/index.ts";
import type { PlayableType } from "../db/schema.ts";
import { pretty } from "../lib/helpers.ts";
import spotifyApi, {
  activateAndRetry,
  generateSpUri,
  PLAYER_ACCOUNT_NAME,
  scopes,
  validateAccessToken,
} from "../spotifyClient/index.ts";
import { validateVibe } from "./validators.ts";
import express from "express";
const router = express.Router();

interface SpotifyError extends Error {
  status: number;
  message: string;
  reason: "NO_ACTIVE_DEVICE" | string;
}

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

// Spotify
router.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// Step 2: Handle callback and get tokens
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);

    const { access_token, refresh_token, expires_in } = data.body;

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    const me = await spotifyApi.getMe();

    await createOrUpdateSpAccount({
      userName: me.body.display_name,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000,
    });

    res.send("Successfully authenticated! You can close this window.");
  } catch (err) {
    res.send("Error during authentication: " + err.message);
  }
});

// Playback control functions
router.get("/play", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  const play = async () =>
    await spotifyApi.play({
      context_uri: generateSpUri(
        req.query.type as PlayableType,
        req.query.spId as string
      ),
    });

  try {
    await play();
    res.send("Playing");
  } catch (err) {
    const error = err.body.error as SpotifyError;
    if (error.reason === "NO_ACTIVE_DEVICE") {
      await activateAndRetry(play, PLAYER_ACCOUNT_NAME);
    }
    res.status(500).send("Error: " + err.message);
  }
});

router.get("/pause", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  try {
    await spotifyApi.pause();
    res.send("Paused");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

router.get("/back", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  try {
    await spotifyApi.skipToPrevious();
    res.send("Previous");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

router.get("/next", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  try {
    await spotifyApi.skipToNext();
    res.send("Next");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

export default router;
