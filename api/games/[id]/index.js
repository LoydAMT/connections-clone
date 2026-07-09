import { readDb } from "../../../lib/db.js";
import { findGame } from "../../../lib/games.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const { id } = req.query;
  try {
    const db = await readDb();
    const game = findGame(db, id);
    return res.status(200).json(game);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}
