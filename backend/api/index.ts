import {
  createOrUpdateVibe,
  createOrUpdateSpAccount,
  findVibe,
  findVibes,
  insertPlayable,
  removePlayable,
  removeVibe,
} from "../db/index.ts";
import type { PlayableData, PlayableType } from "../db/schema.ts";
import { pretty } from "../lib/helpers.ts";
import spotifyApi, {
  activateAndRetry,
  generateSpUri,
  getArtworkUrlsBySpId,
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
  const title = req.body.title as string;
  const playablesRaw = req.body.playables as PlayableData[];
  const hidden = req.body.hidden === "true";

  await validateAccessToken(PLAYER_ACCOUNT_NAME);
  const spIds = playablesRaw
    .filter(({ type }) => type === "album")
    .map(({ spId }) => spId);
  const artworkUrlsBySpId = await getArtworkUrlsBySpId(spIds);
  const playables = playablesRaw.map((p) => ({
    ...p,
    artworkUrl: artworkUrlsBySpId[p.spId],
  }));
  await createOrUpdateVibe(title, playables, hidden);
  res.send({ success: true });
});

router.post("/vibe/insertPlayable", async (req, res) => {
  const title = req.body.title as string;
  const playable = req.body.playable as PlayableData;
  const index = Number(req.body.index);

  if (playable.type === "playlist") {
    await insertPlayable(title, { ...playable }, index);
    res.send({ success: true });
  } else {
    await validateAccessToken(PLAYER_ACCOUNT_NAME);
    const artworkUrl = (await getArtworkUrlsBySpId([playable.spId]))[
      playable.spId
    ];
    await insertPlayable(title, { ...playable, artworkUrl }, index);
    res.send({ success: true });
  }
});

router.delete("/vibe/removePlayable", async (req, res) => {
  const title = req.body.title as string;
  const spId = req.body.spId as string;
  await removePlayable(title, spId);
  res.send({ success: true });
});

router.delete("/vibe", async (req, res) => {
  const title = req.body.title as string;
  const vibe = await removeVibe(title);
  res.send({ deleted: true });
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
router.post("/play", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  const play = async () => {
    await spotifyApi.play({
      context_uri: generateSpUri(
        req.body.type as PlayableType,
        req.body.spId as string
      ),
    });
    res.send({ playing: true });
  };

  try {
    await play();
  } catch (err) {
    const error = err.body.error as SpotifyError;
    if (error.reason === "NO_ACTIVE_DEVICE") {
      await activateAndRetry(play, PLAYER_ACCOUNT_NAME);
    } else {
      res.status(500).send("Error: " + err.message);
    }
  }
});

router.post("/pause", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  try {
    await spotifyApi.pause();
    res.send({ playing: false });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

router.post("/back", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  try {
    await spotifyApi.skipToPrevious();
    res.send({ playing: true });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

router.post("/next", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  try {
    await spotifyApi.skipToNext();
    res.send({ playing: true });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

export default router;
