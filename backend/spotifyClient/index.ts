import { SPOTIFY_CLIENT_ID, SPOTIFY_SECRET } from "../config.ts";

import SpotifyWebApi from "spotify-web-api-node";
import { createOrUpdateSpAccount, getSpAccount } from "../db/index.ts";
import type { PlayableType } from "../db/schema.ts";

const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_SECRET,
  redirectUri: "http://127.0.0.1:3000/callback",
});

export const scopes = [
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
  accountName?: string
) => {
  const deviceId = (await getSpAccount(accountName))?.defaultDeviceId;
  const activated = await activateDevice(deviceId);

  if (activated) {
    // there is a race condition between the transferMyPlayback request and Spotify
    // actually activating the retry. It seemingly doesn't need the retry...let's
    // try this again later today without the retry once it shuts down again.
    // await retry();
  } else {
    console.log("Error: No playback devices found");
  }
};

const activateDevice = async (deviceId?: string) => {
  const devices = (await spotifyApi.getMyDevices()).body.devices;
  const deviceIdToActivate = deviceId ?? devices[0]?.id;

  if (deviceIdToActivate) {
    await spotifyApi.transferMyPlayback([deviceIdToActivate], { play: true });
    return true;
  }
  return false;
};

export const validateAccessToken = async (accountName: string) => {
  const spAccount = await getSpAccount(accountName);

  const { accessToken, refreshToken, expiresAt } = spAccount;
  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);

  const now = Date.now();
  if (now >= expiresAt) {
    const data = await spotifyApi.refreshAccessToken();
    const access_token = data.body["access_token"];
    const refresh_token = data.body["refresh_token"];
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
