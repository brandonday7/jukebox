import express from "express";
import cors from "cors";
import router from "./api/index.js";
import { Request, Response, NextFunction } from "express";

const app = express();

app.use(express.json());

app.use(cors());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    console.log(process.env.API_KEY);
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

app.use(authMiddleware);

app.use("/", router);

export default app;
