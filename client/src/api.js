const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export function listGames() {
  return fetch(`${BASE}/games`).then(handle);
}

export function getGame(id) {
  return fetch(`${BASE}/games/${id}`).then(handle);
}

export function createGame(payload) {
  return fetch(`${BASE}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handle);
}

export function getScores(id) {
  return fetch(`${BASE}/games/${id}/scores`).then(handle);
}

export function submitScore(id, payload) {
  return fetch(`${BASE}/games/${id}/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handle);
}
