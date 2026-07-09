import { readDb, writeDb } from "../../../lib/db.js";
import { findGame, updateGame, removeGame } from "../../../lib/games.js";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const db = await readDb();
      const game = findGame(db, id);
      return res.status(200).json(game);
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const db = await readDb();
      const game = findGame(db, id);
      updateGame(game, req.body);
      await writeDb(db);
      return res.status(200).json(game);
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      const db = await readDb();
      findGame(db, id);
      removeGame(db, id);
      await writeDb(db);
      return res.status(204).end();
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).end();
}
