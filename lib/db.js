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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function hasSupabase() {
  return !!(SUPABASE_URL && SUPABASE_KEY);
}

async function getSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

export async function readDb() {
  if (hasSupabase()) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("kv_store")
      .select("value")
      .eq("key", DB_KEY)
      .maybeSingle();
    if (error) throw error;
    return data?.value || { games: [] };
  }
  if (!fs.existsSync(LOCAL_PATH)) {
    fs.writeFileSync(LOCAL_PATH, JSON.stringify({ games: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(LOCAL_PATH, "utf-8"));
}

export async function writeDb(db) {
  if (hasSupabase()) {
    const supabase = await getSupabase();
    const { error } = await supabase
      .from("kv_store")
      .upsert({ key: DB_KEY, value: db });
    if (error) throw error;
    return;
  }
  fs.writeFileSync(LOCAL_PATH, JSON.stringify(db, null, 2));
}
