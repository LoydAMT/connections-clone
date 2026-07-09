import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listGames } from "../api.js";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(seconds) {
  if (seconds == null) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function BrowseGames() {
  const [games, setGames] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listGames()
      .then(setGames)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="form-error">{error}</div>;
  if (!games) return <div className="loading">Loading games…</div>;

  return (
    <div className="browse-games">
      <h1>Play Games</h1>
      {games.length === 0 ? (
        <div className="empty-state">
          <p>No puzzles yet. Be the first to create one!</p>
          <Link to="/create" className="btn btn-primary">
            Create a Game
          </Link>
        </div>
      ) : (
        <ul className="game-list">
          {games.map((g) => (
            <li key={g.id}>
              <Link to={`/play/${g.id}`} className="game-list-item">
                <div className="game-list-main">
                  <h3>{g.title}</h3>
                  <p>
                    by {g.creatorName} · {formatDate(g.createdAt)}
                  </p>
                </div>
                <div className="game-list-meta">
                  <span>{g.timesPlayed} play{g.timesPlayed === 1 ? "" : "s"}</span>
                  {g.bestTime != null && <span>best {formatTime(g.bestTime)}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
