/**
 * Runtime configuration.
 *
 * Values come from the environment (Compose `environment:` / env_file).
 * Only development-safe fallbacks live here so a cold sandbox boots; real
 * deployments always provide the variables.
 */
const int = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: int(process.env.PORT, 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL ?? "redis://redis:6379",
  isPreview: process.env.BASE44_PREVIEW_MODE === "1",
  publicAppUrl: process.env.PUBLIC_APP_URL ?? "http://localhost:3000",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me",
    accessTtlMinutes: 15,
    refreshTtlDays: 7,
    issuer: "repaircms-enterprise",
  },
  bcryptRounds: 12,
} as const;
