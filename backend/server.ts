import express from "express";
import connect, {
  createOrUpdateCatalog,
  disconnect,
  findCatalog,
  findCatalogs,
  insertPlayable,
  removeCatalog,
  removeFromCatalog,
} from "./db/index.ts";
import { PORT } from "./config.ts";
import { MAC, ZEP } from "./db/schema.ts";

const APP = express();

APP.get("/", (req, res) => {
  res.send("Welcome to my server!");
});

APP.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

await connect();
await removeCatalog("Weekend Morning");
// findCatalog("Weekend Morning", true);
// await insertPlayable("Weekend Morning", MAC, 0);
// findCatalog("Weekend Morning", true);
// await removeFromCatalog("Weekend Morning", ZEP.spId);
// findCatalog("Weekend Morning", true);

const gracefulShutdown = async () => {
  console.log("Closing database connection...");
  await disconnect();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown); // Ctrl+C
process.on("SIGTERM", gracefulShutdown); // kill command
