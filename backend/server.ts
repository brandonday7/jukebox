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
