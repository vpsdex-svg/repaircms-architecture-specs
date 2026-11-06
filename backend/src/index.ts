import { createApp } from "./app.js";
import { config } from "./config.js";
import { db } from "./lib/prisma.js";

const app = createApp();

const server = app.listen(config.port, "0.0.0.0", () => {
  console.log(`[api] RepairCMS API listening on 0.0.0.0:${config.port} (${config.nodeEnv})`);
});

const shutdown = async (signal: string) => {
  console.log(`[api] ${signal} received, shutting down`);
  server.close(async () => {
    await db.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
