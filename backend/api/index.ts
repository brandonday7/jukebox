import {
  createOrUpdateVibe,
  createOrUpdateSpAccount,
  findVibe,
  findVibes,
  removePlayable,
  removeVibe,
  insertPlayables,
  updateDefaultDeviceId,
  getSpAccount,
} from "../db/index.js";
import type { PlayableData, PlayableType } from "../db/schema.js";
import spotifyApi, {
  activateAndRetry,
  activateDevice,
  generateSpUri,
  getAllArtistAlbums,
  getArtworkUrlsBySpId,
  PLAYER_ACCOUNT_NAME,
  SCOPES,
  validateAccessToken,
} from "../clients/spotify.js";
import { validateVibe } from "./validators.js";
import express from "express";
import crypto from "crypto";
import {
  fileAsPixelArray,
  generateArtworkFileFromUrl,
} from "../clients/artwork.js";
const router = express.Router();

interface SpotifyErrorBody {
  error: {
    status: number;
    message: string;
    reason: "NO_ACTIVE_DEVICE" | string;
  };
}

interface SpotifyError extends Error {
  body: SpotifyErrorBody;
  statusCode: number;
}

router.get("/ping", async (_req, res) => {
  res.send({ awake: true });
});

router.get("/vibes", async (_req, res) => {
  const vibes = await findVibes();
  res.send(vibes);
});

router.get("/vibeTitles", async (_req, res) => {
  const vibes = await findVibes();
  res.send({ vibes: vibes.map(({ title }) => title) });
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

  const vibe = await createOrUpdateVibe(title, playables, hidden);
  if (vibe) {
    res.send({ title: vibe.title, playables: vibe.playables });
  }
});

router.post("/vibe/insertPlayables", async (req, res) => {
  const title = req.body.title as string;
  const playables = req.body.playables as PlayableData[];
  const index = Number(req.body.index);

  const albums = playables.filter(({ type }) => type === "album");

  if (albums.length) {
    await validateAccessToken(PLAYER_ACCOUNT_NAME);
  }

  const artworkUrlsBySpId = await getArtworkUrlsBySpId(
    albums.map(({ spId }) => spId)
  );
  const playablesToInsert = playables.map((p) =>
    artworkUrlsBySpId[p.spId]
      ? { ...p, artworkUrl: artworkUrlsBySpId[p.spId] }
      : p
  );
  const newPlayables = await insertPlayables(title, playablesToInsert, index);
  res.send({ playables: newPlayables });
});

router.delete("/vibe/removePlayable", async (req, res) => {
  const title = req.body.title as string;
  const spId = req.body.spId as string;
  await removePlayable(title, spId);
  res.send({ success: true });
});

router.delete("/vibe", async (req, res) => {
  const title = req.body.title as string;
  await removeVibe(title);
  res.send({ deleted: true });
});

// Spotify
router.get("/login", (_req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  res.redirect(spotifyApi.createAuthorizeURL(SCOPES, state));
});

// OAuth Step 2: Handle callback and get tokens
router.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!state) {
    return res.status(403).send("Invalid state");
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code as string);

    const { access_token, refresh_token, expires_in } = data.body;

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    const me = await spotifyApi.getMe();

    await createOrUpdateSpAccount({
      userName: me.body.display_name || "",
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000,
    });

    res.send("Successfully authenticated! You can close this window.");
  } catch (e) {
    const err = e as SpotifyError;
    res.send("Error during authentication: " + err.message);
  }
});

router.post("/play", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  const type = req.body.type as PlayableType;
  const spId = req.body.spId as string;
  const context =
    type && spId ? { context_uri: generateSpUri(type, spId) } : undefined;

  const play = async () => {
    await spotifyApi.play(context);
    res.send({ playing: true });
  };

  try {
    await play();
  } catch (e) {
    const err = e as SpotifyError;
    const error = err.body.error;
    if (error.reason === "NO_ACTIVE_DEVICE") {
      await activateAndRetry(play, PLAYER_ACCOUNT_NAME);
    } else {
      if (err.body.error.message.startsWith("Player command failed")) {
        res.send({ playing: true });
        return;
      }
      res.status(500).send("Error: " + err.message);
    }
  }
});

router.post("/pause", async (_req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  try {
    await spotifyApi.pause();
    res.send({ playing: false });
  } catch (e) {
    const err = e as SpotifyError;
    if (err.body.error.message.startsWith("Player command failed")) {
      res.send({ playing: false });
      return;
    }
    res.status(500).send("Error: " + err.message);
  }
});

router.post("/back", async (_req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  try {
    await spotifyApi.skipToPrevious();
    res.send({ playing: true });
  } catch (e) {
    const err = e as SpotifyError;
    if (err.body.error.message.startsWith("Player command failed")) {
      res.send({ playing: true });
      return;
    }
    res.status(500).send("Error: " + err.message);
  }
});

router.post("/next", async (_req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  try {
    await spotifyApi.skipToNext();
    res.send({ playing: true });
  } catch (e) {
    const err = e as SpotifyError;
    if (err.body.error.message.startsWith("Player command failed")) {
      res.send({ playing: true });
      return;
    }
    res.status(500).send("Error: " + err.message);
  }
});

router.get("/searchArtists", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  const query = req.query.query as string;

  try {
    const { body } = await spotifyApi.searchArtists(query);
    const artists = body.artists?.items.length
      ? body.artists.items.map(({ name, id, images }) => ({
          name,
          spId: id,
          imageUrl: images.length ? images[0].url : "",
        }))
      : [];
    res.send({ artists });
  } catch (e) {
    const err = e as SpotifyError;
    res.status(500).send("Error: " + err.message);
  }
});

router.get("/artistAlbums", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  const spId = req.query.spId as string;
  const artistName = req.query.artistName as string;

  try {
    const albums = await getAllArtistAlbums(spId, artistName);
    res.send({ albums });
  } catch (e) {
    const err = e as SpotifyError;
    res.status(500).send("Error: " + err.message);
  }
});

router.get("/searchPlaylist", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  const spId = req.query.spId as string;

  try {
    const { body } = await spotifyApi.getPlaylist(spId);
    const playlist = {
      type: "playlist",
      title: body.name,
      artistName: body.owner.display_name,
      artworkUrl: "",
      spId: body.id,
    };
    res.send({ playlist });
  } catch (e) {
    const err = e as SpotifyError;
    res.status(500).send("Error: " + err.message);
  }
});

router.get("/devices", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  try {
    const spAccount = await getSpAccount(PLAYER_ACCOUNT_NAME);
    const defaultDeviceId = spAccount?.defaultDeviceId;
    const devicesRaw = (await spotifyApi.getMyDevices()).body.devices;
    const devices = devicesRaw.map(({ id, is_active, name, type }) => ({
      id,
      name,
      type,
      isActive: is_active,
      isDefault: defaultDeviceId === id,
    }));
    res.send(devices);
  } catch (e) {
    const err = e as SpotifyError;
    res.status(500).send("Error: " + err.message);
  }
});

router.post("/defaultDevice", async (req, res) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  const deviceId = req.body.deviceId as string;

  try {
    await updateDefaultDeviceId(PLAYER_ACCOUNT_NAME, deviceId);
    await activateDevice(deviceId);
    res.send({ success: true });
  } catch (e) {
    const err = e as SpotifyError;
    res.status(500).send("Error: " + err.message);
  }
});

// router.post("/artworkFile", async (req, res) => {
//   const url = req.query.spId as string;

//   try {
//     const imageFile = await generateArtworkFileFromUrl(
//       url ?? "https://i.scdn.co/image/ab67616d00001e028c5b6f7dcdc5817dc5050b2a",
//       30
//     );

//     const pixels = fileAsPixelArray(imageFile.bitmap);
//     res.send({ pixels });
//   } catch (e) {
//     const err = e as SpotifyError;
//     res.status(500).send("Error: " + err.message);
//   }
// });

export default router;
