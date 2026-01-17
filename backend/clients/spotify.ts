import { SPOTIFY_CLIENT_ID, SPOTIFY_SECRET } from "../config.js";

import SpotifyWebApi from "spotify-web-api-node";
import {
  createOrUpdateSpAccount,
  createOrUpdateVibe,
  findVibes,
  getSpAccount,
} from "../db/index.js";
import type { PlayableData, PlayableType, VibeData } from "../db/schema.js";
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
  "playlist-modify-public",
  "user-top-read",
];

export const PLAYER_ACCOUNT_NAME = "Brandon Day";
export const BRANDON_RECENTS_ACCOUNT_NAME = "Brandon Day";
// export const ALARA_RECENTS_ACCOUNT_NAME = "Alara Grace";

const AWARENESS_PLAYLIST_ID = "5JtobxsHCac7jRCRbVEvzd";

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

export const activateDevice = async (deviceId?: string) => {
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
    const accessToken = data.body["access_token"];
    const expiresIn = data.body["expires_in"];

    spotifyApi.setAccessToken(accessToken);

    await createOrUpdateSpAccount({
      userName: accountName,
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
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

export const getAlbumsBySpId = async (
  spIds: string[]
): Promise<PlayableData[]> => {
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

  return albums.map(({ images, id, name, artists }) => ({
    type: "album",
    title: name,
    artistName: artists.length ? artists[0].name : "Unknown artist",
    artworkUrl: images.length ? images[0].url : "",
    spId: id,
  }));
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
      .filter(
        ({ total_tracks, artists, album_type }) =>
          total_tracks > 1 &&
          artists.some(
            (artist) =>
              artist.name !== "Various Artists" &&
              artist.name !== "Various Composers"
          ) &&
          album_type !== "compilation"
      )
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

export const populateTopArtistsVibe = async () => {
  const { body } = await spotifyApi.getMyTopArtists();
  const artists = body.items.map((artist) => ({
    name: artist.name,
    spId: artist.id,
  }));
  const artistAlbums = await Promise.all(
    artists.map(({ spId, name }) => getAllArtistAlbums(spId, name))
  );

  await createOrUpdateVibe(
    "Explore Top Artists",
    artistAlbums.map(
      (albums) => albums[Math.floor(Math.random() * albums.length)]
    )
  );
};

export const createPlaylist = async (
  name: string,
  description: string,
  spIds: string[]
) => {
  const { body } = await spotifyApi.createPlaylist(name, {
    description,
    public: true,
  });
  const playlistSpId = body.id;

  await spotifyApi.addTracksToPlaylist(
    playlistSpId,
    spIds.map((spId) => `spotify:track:${spId}`)
  );

  return playlistSpId;
};

export const updatePlaylistTracks = async (
  spId: string,
  trackSpIds: string[],
  erasePrevious = false
) => {
  if (erasePrevious) {
    await spotifyApi.replaceTracksInPlaylist(
      spId,
      trackSpIds.map((spId) => `spotify:track:${spId}`)
    );
  } else {
    await spotifyApi.addTracksToPlaylist(
      spId,
      trackSpIds.map((spId) => `spotify:track:${spId}`)
    );
  }

  return spId;
};

export const updateAwarenessPlaylist = async () => {
  const NUM_PICKS = 3;

  const vibes = (await findVibes()) as VibeData[];
  const allAlbums = vibes.reduce(
    (albums, vibe) => [
      ...albums,
      ...vibe.playables.filter((p) => p.type === "album"),
    ],
    [] as PlayableData[]
  );

  const allArtists = new Set();
  // Artists should be equally represented regardless of number of albums.
  const uniqueArtistAlbumIds = allAlbums
    .map((album) => {
      if (!allArtists.has(album.artistName)) {
        allArtists.add(album.artistName);
        return album.spId;
      }
    })
    .filter(Boolean) as string[];

  const spId =
    uniqueArtistAlbumIds[
      Math.floor(Math.random() * uniqueArtistAlbumIds.length)
    ];
  const albumData = await spotifyApi.getAlbum(spId);
  sleep(500);
  const { name: artistName, id } = albumData.body.artists[0];
  const artistAlbums = await getAllArtistAlbums(id, artistName);

  const featuredAlbumIds = Array.from(Array(NUM_PICKS).keys()).map(
    () => artistAlbums[Math.floor(Math.random() * artistAlbums.length)].spId
  );
  const tracksByAlbumId: Record<string, string[]> = {};

  for (const albumId of featuredAlbumIds) {
    if (!tracksByAlbumId[albumId]) {
      const validTracks = (await getTracksForAlbum(albumId)).filter(
        ({ artists }) => artists.some((artist) => artist.name === artistName)
      );

      tracksByAlbumId[albumId] = validTracks.map(({ id }) => id);
      sleep(500);
    }
  }

  const trackIds = featuredAlbumIds.map((albumId) => {
    const tracks = tracksByAlbumId[albumId];
    const featuredTrackId = tracks[Math.floor(Math.random() * tracks.length)];
    return featuredTrackId;
  });

  await updatePlaylistTracks(AWARENESS_PLAYLIST_ID, trackIds, true);
  sleep(500);
  await spotifyApi.changePlaylistDetails(AWARENESS_PLAYLIST_ID, {
    name: `Awareness: ${artistName}`,
  });
};

const getTracksForAlbum = async (spId: string) => {
  const { body } = await spotifyApi.getAlbumTracks(spId);
  return body.items;
};
