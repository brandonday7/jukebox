import { connect, disconnect } from "./db/index.ts";
import { PORT } from "./config.ts";
import app from "./app.ts";

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
