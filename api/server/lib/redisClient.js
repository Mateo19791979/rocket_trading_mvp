import Redis from "ioredis";

let client;

export function getRedis() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    });
    client?.on("error", (e) => console.error("[redis] error:", e?.message));
    client?.on("connect", () => console.log("[redis] connected"));
  }
  return client;
}