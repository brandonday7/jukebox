import { SPOTIFY_CLIENT_ID, SPOTIFY_SECRET } from "../config.js";

import SpotifyWebApi from "spotify-web-api-node";
import { createOrUpdateSpAccount, getSpAccount } from "../db/index.js";
import type { PlayableData, PlayableType } from "../db/schema.js";
import { sleep } from "../lib/helpers.js";

interface SpAccount {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_SECRET,
  redirectUri: "http://127.0.0.1:3000/callback",
});

export const SCOPES = [
  "user-modify-playback-state",
  "user-read-playback-state",
  "user-read-currently-playing",
  "user-read-email",
];

export const PLAYER_ACCOUNT_NAME = "Brandon Day";
export const BRANDON_RECENTS_ACCOUNT_NAME = "Brandon Day";
// export const ALARA_RECENTS_ACCOUNT_NAME = "Alara Grace";

export default spotifyApi;

export const activateAndRetry = async (
  retry: () => Promise<void>,
  accountName: string
) => {
  const deviceId = (await getSpAccount(accountName))?.defaultDeviceId;

  if (deviceId) {
    const activated = await activateDevice(deviceId);

    if (activated) {
      await retry();
    } else {
      console.warn("Error: No playback devices found");
    }
  }
};

const activateDevice = async (deviceId?: string) => {
  const deviceIdToActivate =
    deviceId ?? (await spotifyApi.getMyDevices()).body.devices[0]?.id;

  if (deviceIdToActivate) {
    await spotifyApi.transferMyPlayback([deviceIdToActivate]);
    console.log(`Device with ID ${deviceIdToActivate} has been activated!`);
    // After device has been activated, it needs 3s to actually wake up.
    // This delay will only ever happen when you first turn the device playback on.
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return true;
  }
  console.warn(`No device activated`);
  return false;
};

export const validateAccessToken = async (accountName: string) => {
  const spAccount = (await getSpAccount(accountName)) as SpAccount;

  const { accessToken, refreshToken, expiresAt } = spAccount;
  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);

  const now = Date.now();
  if (now >= expiresAt) {
    const data = await spotifyApi.refreshAccessToken();
    const access_token = data.body["access_token"];
    const refresh_token = data.body["refresh_token"] || "";
    const expires_in = data.body["expires_in"];

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    await createOrUpdateSpAccount({
      userName: accountName,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000,
    });
    console.log("Access token refreshed!");
  }
};

export const generateSpUri = (type: PlayableType, spId: string) =>
  `spotify:${type}:${spId}`;

export const getArtworkUrlsBySpId = async (spIds: string[]) => {
  const limit = 20;
  let i = 0;
  const albums = [];

  while (i < spIds.length) {
    albums.push(
      ...(await spotifyApi.getAlbums(spIds.slice(i, i + limit))).body.albums
    );
    i += limit;

    sleep(500);
  }

  const artworkUrlsBySpId = albums.reduce((acc, { images, id }) => {
    acc[id] = images[0].url;
    return acc;
  }, {} as Record<string, string>);
  return artworkUrlsBySpId;
};

export const getAllArtistAlbums = async (spId: string, artistName: string) => {
  const limit = 50;
  let i = 0;
  let albums: PlayableData[] = [];
  let hasMore = true;

  while (hasMore) {
    const { body } = await spotifyApi.getArtistAlbums(spId, {
      limit,
      offset: i,
    });
    const albumSet = body.items
      .filter(({ album_type }) => album_type === "album")
      .map(
        ({ id, name, images }) =>
          ({
            type: "album",
            title: name,
            artistName,
            artworkUrl: images.length ? images[0].url : "",
            spId: id,
          } as PlayableData)
      );

    albums = albums.concat(albumSet);

    if (body.total >= limit + i) {
      i += limit;

      sleep(500);
    } else {
      hasMore = false;
    }
  }

  return albums;
};
