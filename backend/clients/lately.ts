import axios from "axios";
import {
  getAlbumsBySpId,
  PLAYER_ACCOUNT_NAME,
  validateAccessToken,
} from "./spotify.js";
import { createOrUpdateVibe } from "../db/index.js";

export const fetchSpIds = async (url: string): Promise<string[]> => {
  try {
    const response = await axios.get(url);
    const html = response.data;

    return parseSpotifyIds(html);
  } catch (error) {
    console.error("Error fetching URL:", error);
    throw error;
  }
};

export const parseSpotifyIds = (html: string): string[] => {
  const spotifyItems: string[] = [];
  const seenIds = new Set<string>();

  // Regular expression to match anchor tags with href attributes
  const anchorRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>/gi;

  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const url = match[2];

    const albumMatch = url.match(/spotify\.com\/album\/([a-zA-Z0-9]+)/);
    const albumUriMatch = url.match(/spotify:album:([a-zA-Z0-9]+)/);

    if (albumMatch) {
      const spId = albumMatch[1];
      if (!seenIds.has(spId)) {
        spotifyItems.push(spId);
        seenIds.add(spId);
      }
    } else if (albumUriMatch) {
      const spId = albumUriMatch[1];
      if (!seenIds.has(spId)) {
        spotifyItems.push(spId);
        seenIds.add(spId);
      }
    }
  }

  return spotifyItems;
};

export const getLatestLately = async () => {
  await validateAccessToken(PLAYER_ACCOUNT_NAME);
  const postUrl = "https://nickvereshchak.substack.com/p/lately-november-17";
  const mentionSpIds = await fetchSpIds(postUrl);
  const mentionsAsPlayables = await getAlbumsBySpId(mentionSpIds);

  await createOrUpdateVibe("Lately November 17", mentionsAsPlayables);
};
