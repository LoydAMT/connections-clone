import { nanoid } from "nanoid";

const DIFFICULTY_COLORS = ["yellow", "green", "blue", "purple"];

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export function listGameSummaries(db) {
  return db.games
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((g) => ({
      id: g.id,
      title: g.title,
      creatorName: g.creatorName,
      createdAt: g.createdAt,
      timesPlayed: g.scores.length,
      bestTime:
        g.scores.length > 0
          ? Math.min(...g.scores.map((s) => s.timeSeconds))
          : null,
    }));
}

function normalizeGroups(groups) {
  if (!Array.isArray(groups) || groups.length !== 4) {
    throw httpError(400, "Exactly 4 groups are required");
  }
  for (const g of groups) {
    if (!g.category || !g.category.trim()) {
      throw httpError(400, "Each group needs a category name");
    }
    if (
      !Array.isArray(g.words) ||
      g.words.length !== 4 ||
      g.words.some((w) => !w || !w.trim())
    ) {
      throw httpError(400, "Each group needs exactly 4 words");
    }
  }

  const allWords = groups.flatMap((g) => g.words.map((w) => w.trim().toUpperCase()));
  if (new Set(allWords).size !== 16) {
    throw httpError(400, "All 16 words must be unique");
  }

  return groups.map((g, i) => ({
    category: g.category.trim(),
    difficulty: DIFFICULTY_COLORS[i],
    words: g.words.map((w) => w.trim().toUpperCase()),
  }));
}

export function buildGame({ title, creatorName, groups } = {}) {
  if (!creatorName || !creatorName.trim()) {
    throw httpError(400, "creatorName is required");
  }
  const normalizedGroups = normalizeGroups(groups);

  return {
    id: nanoid(8),
    title: title && title.trim() ? title.trim() : "Untitled Puzzle",
    creatorName: creatorName.trim(),
    createdAt: new Date().toISOString(),
    groups: normalizedGroups,
    scores: [],
  };
}

export function updateGame(game, { title, groups } = {}) {
  game.title = title && title.trim() ? title.trim() : "Untitled Puzzle";
  game.groups = normalizeGroups(groups);
  return game;
}

export function findGame(db, id) {
  const game = db.games.find((g) => g.id === id);
  if (!game) throw httpError(404, "Game not found");
  return game;
}

export function removeGame(db, id) {
  const idx = db.games.findIndex((g) => g.id === id);
  if (idx === -1) throw httpError(404, "Game not found");
  db.games.splice(idx, 1);
}

export function sortedScores(game) {
  return game.scores
    .slice()
    .sort((a, b) => a.mistakes - b.mistakes || a.timeSeconds - b.timeSeconds);
}

export function buildScore({ name, timeSeconds, mistakes, won } = {}) {
  if (!name || !name.trim()) {
    throw httpError(400, "name is required");
  }
  if (typeof timeSeconds !== "number" || typeof mistakes !== "number") {
    throw httpError(400, "timeSeconds and mistakes must be numbers");
  }
  return { name: name.trim(), timeSeconds, mistakes, won: !!won, date: new Date().toISOString() };
}
