import express from "express";
import { getRedis } from "../lib/redisClient.js";
// import { fetchQuoteUpstream } from "../../../backend/routes/providers";
 // your provider router

export const quotes = express?.Router();

const TTL = parseInt(process.env?.REDIS_TTL_QUOTES || "5", 10);

async function fetchQuoteUpstream(symbol) {
  // TODO: connect your ProviderRouter (Finnhub/Alpha/Twelve/etc.)
  // Placeholder: return fake price with timestamp to verify cache
  return { symbol, price: 123.45, ts: Date.now(), provider: "mock" };
}

quotes?.get("/", async (req, res) => {
  try {
    const symbol = (req?.query?.symbol || "")?.toUpperCase();
    if (!symbol) return res?.status(400)?.json({ ok: false, error: "symbol required" });
    const key = `q:${symbol}`;

    const redis = getRedis();
    try {
      const cached = await redis?.get(key);
      if (cached) {
        return res?.json({ ok: true, cached: true, ...JSON.parse(cached) });
      }
    } catch (e) {
      // continue without breaking if Redis KO
      console.warn("[quotes] redis get failed:", e?.message);
    }

    const data = await fetchQuoteUpstream(symbol);

    try {
      await redis?.set(key, JSON.stringify(data), "EX", TTL);
    } catch (e) {
      console.warn("[quotes] redis set failed:", e?.message);
    }
    return res?.json({ ok: true, cached: false, ...data });
  } catch (e) {
    return res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});