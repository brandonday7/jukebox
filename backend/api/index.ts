import {
  createOrUpdateVibe,
  findVibe,
  findVibes,
  insertPlayable,
  removePlayable,
  removeVibe,
} from "../db/index.ts";
import { pretty } from "../lib/helpers.ts";
import spotifyApi, { activateDevice, scopes } from "../spotifyClient/index.ts";
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

    // Set the access token and refresh token
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    console.log("Access token:", access_token);
    console.log("Refresh token:", refresh_token);
    console.log("Token expires in:", expires_in);

    // IMPORTANT: Store refresh_token securely (database, .env file, etc.)
    // You'll need it to get new access tokens when they expire

    res.send("Successfully authenticated! You can close this window.");
  } catch (err) {
    res.send("Error during authentication: " + err.message);
  }
});

// Refresh access token when it expires
const refreshAccessToken = async () => {
  try {
    const data = await spotifyApi.refreshAccessToken();
    const access_token = data.body["access_token"];

    spotifyApi.setAccessToken(access_token);
    console.log("Access token refreshed!");
  } catch (err) {
    console.error("Could not refresh access token", err);
  }
};

// Playback control functions
router.get("/play", async (req, res) => {
  try {
    await spotifyApi.play({
      context_uri: generateSpUri(req.query.spId as string),
    });
    res.send("Playing");
  } catch (err) {
    const error = err.body.error as SpotifyError;
    if (error.reason === "NO_ACTIVE_DEVICE") {
      const activated = activateDevice();

      if (activated) {
        await spotifyApi.play({
          context_uri: generateSpUri(req.query.spId as string),
        });
      } else {
        res.status(500).send("Error: No playback devices found");
      }
    }
    res.status(500).send("Error: " + err.message);
  }
});

router.get("/pause", async (req, res) => {
  try {
    await spotifyApi.pause();
    res.send("Paused");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

router.get("/back", async (req, res) => {
  try {
    await spotifyApi.skipToPrevious();
    res.send("Previous");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

router.get("/next", async (req, res) => {
  try {
    await spotifyApi.skipToNext();
    res.send("Next");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

const generateSpUri = (spId: string) => `spotify:album:${spId}`;

export default router;
