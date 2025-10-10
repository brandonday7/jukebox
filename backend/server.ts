import express from "express";
import connect, { disconnect, printCatalogs } from "./db/index.ts";
import { PORT } from "./config.ts";

const APP = express();

APP.get("/", (req, res) => {
  res.send("Welcome to my server!");
});

APP.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

await connect();
await printCatalogs();

const gracefulShutdown = async () => {
  console.log("Closing database connection...");
  await disconnect();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown); // Ctrl+C
process.on("SIGTERM", gracefulShutdown); // kill command
