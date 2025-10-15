import { SPOTIFY_CLIENT_ID, SPOTIFY_SECRET } from "../config.ts";

import SpotifyWebApi from "spotify-web-api-node";

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

export const PLAYER_ACCOUNT_NAME = "Brandon";
export const BRANDON_RECENTS_ACCOUNT_NAME = "Brandon";
export const ALARA_RECENTS_ACCOUNT_NAME = "Alara";

export default spotifyApi;

export const activateDevice = async (deviceId?: string) => {
  const deviceIdToActivate =
    deviceId ?? (await spotifyApi.getMyDevices()).body.devices[0]?.id;

  if (deviceIdToActivate) {
    await spotifyApi.transferMyPlayback([deviceIdToActivate], { play: true });
    return true;
  }
  return false;
};
