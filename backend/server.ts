import express from "express";
import {
  connect,
  createOrUpdateVibe,
  disconnect,
  findVibe,
  findVibes,
} from "./db/index.ts";
import { PORT } from "./config.ts";

const APP = express();

APP.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

APP.get("/vibes", async (_req, res) => {
  const vibes = await findVibes();
  res.send(vibes);
});

APP.get("/vibe/:title", async (req, res) => {
  const vibe = await findVibe(req.params.title);
  res.send(vibe);
});

// APP.post("/vibe/:title", async (req, res) => {
//   const title = req.params.title;
//   const playables = JSON.parse(req.query.playables as string);
//   const hidden = req.query.hidden === "true";
//   const vibe = await createOrUpdateVibe(title, playables, hidden);
//   res.send(vibe);
// });

await connect();

const gracefulShutdown = async () => {
  await disconnect();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown); // Ctrl+C
process.on("SIGTERM", gracefulShutdown); // kill command
