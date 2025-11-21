import axios from "axios";
import {
  getAlbumsBySpId,
  PLAYER_ACCOUNT_NAME,
  updatePlaylistTracks,
  validateAccessToken,
} from "./spotify.js";
import { createOrUpdateVibe } from "../db/index.js";
import { capitalize } from "../lib/helpers.js";
import type { PlayableData } from "../db/schema.js";

const ARCHIVE_URL = "https://nickvereshchak.substack.com/archive";
const SLUG_PREFIX = "lately-";
const AUTHOR_NAME = "Nick Vereshchak";
const SINGLES_PLAYLIST_TITLE = "Lately Singles";
const SINGLES_PLAYLIST_SP_ID = "4ivLdLV6HMVWBvT3t4jHjN";

export const getLatestPost = async () => {
  try {
    const { data: html } = await axios.get(ARCHIVE_URL);

    const regex = /https:\/\/nickvereshchak\.substack\.com\/p\/([a-z0-9-]+)/gi;
    const matches = html.matchAll(regex);

    const latestPost = matches.find((postMatch: string[]) => {
      const slug = postMatch[1];
      return slug.startsWith(SLUG_PREFIX);
    });

    if (latestPost?.length) {
      return {
        title: latestPost[1]
          .split("-")
          .map((word: string) => capitalize(word))
          .join(" "),
        url: latestPost[0],
      };
    }

    return null;
  } catch (err) {
    console.error("Error fetching latest post", err);
    throw err;
  }
};

export const createVibeFromPost = async (title: string, url: string) => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);

  const parsedSpIds = await fetchSpIds(url);
  const albumReleasePlayables = await getAlbumsBySpId([
    ...parsedSpIds.albumReleases,
    ...parsedSpIds.albumMentions,
  ]);
  await updatePlaylistTracks(
    SINGLES_PLAYLIST_SP_ID,
    parsedSpIds.trackMentions,
    true
  );

  const trackMentionsPlayable: PlayableData = {
    type: "playlist",
    title: SINGLES_PLAYLIST_TITLE,
    artistName: AUTHOR_NAME,
    artworkUrl: "",
    spId: SINGLES_PLAYLIST_SP_ID,
  };

  await createOrUpdateVibe(title, [
    ...albumReleasePlayables,
    trackMentionsPlayable,
  ]);
};

export const fetchSpIds = async (url: string) => {
  try {
    const response = await axios.get(url);
    const html = response.data;

    return parseSpotifyIds(html);
  } catch (error) {
    console.error("Error fetching album mentions", error);
    throw error;
  }
};

// Maybe clean this up
export const parseSpotifyIds = (html: string) => {
  const albumReleaseSpIds: string[] = [];
  const albumMentionSpIds: string[] = [];
  const trackSpIds: string[] = [];
  const seenIds = new Set<string>();

  // Regular expression to match Spotify embed iframes. These map to the main release headings on Lately.
  const embedRegex =
    /<iframe[^>]*src=(["'])(https:\/\/open\.spotify\.com\/embed\/[^"']*)\1[^>]*>/gi;

  let match;
  while ((match = embedRegex.exec(html)) !== null) {
    const embedUrl = match[2];

    const albumMatch = embedUrl.match(
      /spotify\.com\/embed\/album\/([a-zA-Z0-9]+)/
    );
    const trackMatch = embedUrl.match(
      /spotify\.com\/embed\/track\/([a-zA-Z0-9]+)/
    );

    if (albumMatch) {
      const spId = albumMatch[1];
      if (!seenIds.has(spId)) {
        albumReleaseSpIds.push(spId);
        seenIds.add(spId);
      }
    } else if (trackMatch) {
      const spId = trackMatch[1];
      if (!seenIds.has(spId)) {
        trackSpIds.push(spId);
        seenIds.add(spId);
      }
    }
  }

  // Regular expression to match normal Spotify links within the text of Lately.
  const anchorRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>/gi;

  while ((match = anchorRegex.exec(html)) !== null) {
    const url = match[2];

    const albumMatch = url.match(/spotify\.com\/album\/([a-zA-Z0-9]+)/);
    const trackMatch = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
    const albumUriMatch = url.match(/spotify:album:([a-zA-Z0-9]+)/);
    const trackUriMatch = url.match(/spotify:track:([a-zA-Z0-9]+)/);

    if (albumMatch) {
      const spId = albumMatch[1];
      if (!seenIds.has(spId)) {
        albumMentionSpIds.push(spId);
        seenIds.add(spId);
      }
    } else if (trackMatch) {
      const spId = trackMatch[1];
      if (!seenIds.has(spId)) {
        trackSpIds.push(spId);
        seenIds.add(spId);
      }
    } else if (albumUriMatch) {
      const spId = albumUriMatch[1];
      if (!seenIds.has(spId)) {
        albumMentionSpIds.push(spId);
        seenIds.add(spId);
      }
    } else if (trackUriMatch) {
      const spId = trackUriMatch[1];
      if (!seenIds.has(spId)) {
        trackSpIds.push(spId);
        seenIds.add(spId);
      }
    }
  }

  return {
    albumReleases: albumReleaseSpIds,
    albumMentions: albumMentionSpIds,
    trackMentions: trackSpIds,
  };
};
