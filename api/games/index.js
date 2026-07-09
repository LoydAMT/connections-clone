import { readDb, writeDb } from "../../lib/db.js";
import { listGameSummaries, buildGame } from "../../lib/games.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const db = await readDb();
    return res.status(200).json(listGameSummaries(db));
  }

  if (req.method === "POST") {
    try {
      const db = await readDb();
      const game = buildGame(req.body);
      db.games.push(game);
      await writeDb(db);
      return res.status(201).json({ id: game.id });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).end();
}
