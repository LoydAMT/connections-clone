import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const DB_KEY = "connections-db";
const LOCAL_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "server",
  "db.json"
);

// Vercel's Redis marketplace integration (Upstash) may inject either
// UPSTASH_REDIS_REST_* or the legacy KV_REST_API_* variable names
// depending on how it was connected, so check both.
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

function hasRedis() {
  return !!(REDIS_URL && REDIS_TOKEN);
}

async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
}

export async function readDb() {
  if (hasRedis()) {
    const redis = await getRedis();
    const data = await redis.get(DB_KEY);
    return data || { games: [] };
  }
  if (!fs.existsSync(LOCAL_PATH)) {
    fs.writeFileSync(LOCAL_PATH, JSON.stringify({ games: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(LOCAL_PATH, "utf-8"));
}

export async function writeDb(db) {
  if (hasRedis()) {
    const redis = await getRedis();
    await redis.set(DB_KEY, db);
    return;
  }
  fs.writeFileSync(LOCAL_PATH, JSON.stringify(db, null, 2));
}
