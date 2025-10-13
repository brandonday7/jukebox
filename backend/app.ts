import express from "express";
import cors from "cors";
import router from "./api/index.ts";
const app = express();

app.use(express.json());

app.use(cors());

// Or enable CORS for specific origin
// app.use(
//   cors({
//     origin: "http://localhost:8081", // Your Expo web URL
//     credentials: true,
//   })
// );

app.use("/", router);

export default app;
