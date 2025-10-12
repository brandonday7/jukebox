import express from "express";
import connect, {
  createOrUpdateVibe,
  disconnect,
  findVibe,
  findVibes,
} from "./db/index.ts";
import { PORT } from "./config.ts";
import { MAC, OLDIES, Playable, WEEKEND_MORNING, ZEP } from "./db/schema.ts";

const APP = express();

APP.get("/", (req, res) => {
  res.send("Welcome to my server!");
});

APP.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

await connect();
// await findVibes(true);
await findVibe("Weekend Morning", true);
await createOrUpdateVibe(
  WEEKEND_MORNING.title,
  WEEKEND_MORNING.playables,
  WEEKEND_MORNING.hidden
);
await findVibe("Weekend Morning", true);

// findVibes(true);
// await removeFromVibe(OLDIES.title, ZEP.spId);
// await createOrUpdateVibe('title', [{...ZEP, }]);
// findVibes(true);

const gracefulShutdown = async () => {
  await disconnect();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown); // Ctrl+C
process.on("SIGTERM", gracefulShutdown); // kill command
