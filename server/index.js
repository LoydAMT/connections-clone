import express from "express";
import cors from "cors";
import { readDb, writeDb } from "../lib/db.js";
import {
  listGameSummaries,
  buildGame,
  findGame,
  sortedScores,
  buildScore,
} from "../lib/games.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/games", async (req, res) => {
  const db = await readDb();
  res.json(listGameSummaries(db));
});

app.post("/api/games", async (req, res) => {
  try {
    const db = await readDb();
    const game = buildGame(req.body);
    db.games.push(game);
    await writeDb(db);
    res.status(201).json({ id: game.id });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/games/:id", async (req, res) => {
  try {
    const db = await readDb();
    res.json(findGame(db, req.params.id));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/games/:id/scores", async (req, res) => {
  try {
    const db = await readDb();
    const game = findGame(db, req.params.id);
    res.json(sortedScores(game));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post("/api/games/:id/scores", async (req, res) => {
  try {
    const db = await readDb();
    const game = findGame(db, req.params.id);
    const score = buildScore(req.body);
    game.scores.push(score);
    await writeDb(db);
    res.status(201).json(score);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Connections server listening on http://localhost:${PORT}`);
});
