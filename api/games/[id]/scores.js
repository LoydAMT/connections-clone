import { readDb, writeDb } from "../../../lib/db.js";
import { findGame, sortedScores, buildScore } from "../../../lib/games.js";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const db = await readDb();
      const game = findGame(db, id);
      return res.status(200).json(sortedScores(game));
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const db = await readDb();
      const game = findGame(db, id);
      const score = buildScore(req.body);
      game.scores.push(score);
      await writeDb(db);
      return res.status(201).json(score);
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).end();
}
