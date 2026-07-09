const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
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

export function updateGame(id, payload) {
  return fetch(`${BASE}/games/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handle);
}

export function deleteGame(id) {
  return fetch(`${BASE}/games/${id}`, { method: "DELETE" }).then(handle);
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
