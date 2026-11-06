import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { systemRouter } from "./routes/system.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  // The preview proxy terminates TLS; API responses are JSON only.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", service: "repaircms-api" } });
  });

  app.use("/api/v1/system", systemRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
