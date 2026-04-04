import { connect, disconnect } from "./db/index.js";
import { PORT } from "./config.js";
import app from "./app.js";
// import { initCronJobs } from "./cron/scheduler.js";
import {
  PLAYER_ACCOUNT_NAME,
  populateTopArtistsVibe,
  validateAccessToken,
} from "./clients/spotify.js";

// initCronJobs();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

await connect();

const gracefulShutdown = async () => {
  await disconnect();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

await validateAccessToken(PLAYER_ACCOUNT_NAME);
populateTopArtistsVibe();
