import cron from "node-cron";
import { createVibeFromPost, getLatestPost } from "../clients/lately.js";
import {
  PLAYER_ACCOUNT_NAME,
  populateTopArtistsVibe,
  validateAccessToken,
} from "../clients/spotify.js";

export function initCronJobs() {
  // Every Monday at 11:00 AM
  cron.schedule(
    "0 11 * * 1",
    async () => {
      console.log("Running: Lately ingestion");
      try {
        const latestPost = await getLatestPost();
        if (latestPost) {
          await createVibeFromPost(latestPost.title, latestPost.url);
        }
      } catch (error) {
        console.error("Error in Lately ingestion:", error);
      }
    },
    {
      timezone: "America/Toronto",
    }
  );

  // Every day at 9:00 AM
  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("Running: Populate Explore Top Artists");
      try {
        await validateAccessToken(PLAYER_ACCOUNT_NAME);
        populateTopArtistsVibe();
      } catch (error) {
        console.error("Error in Explore Top Artists:", error);
      }
    },
    {
      timezone: "America/Toronto",
    }
  );

  console.log("Cron jobs initialized");
}
