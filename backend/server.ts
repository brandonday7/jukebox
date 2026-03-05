import { connect, disconnect } from "./db/index.js";
import { PORT } from "./config.js";
import app from "./app.js";
import { initCronJobs } from "./cron/scheduler.js";

initCronJobs();

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

// const f = await generateArtworkFileFromUrl(
//   // "https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25",
//   // "https://i.scdn.co/image/ab67616d0000b2739293c743fa542094336c5e12",
//   "https://i.scdn.co/image/ab67616d0000b27300702474f8e0e2b6155d48e3",
// );

// await fileAsPixelArray(f.bitmap);
