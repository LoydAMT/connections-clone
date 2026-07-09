import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import NameModal from "../components/NameModal.jsx";
import { getGame, getScores, submitScore, deleteGame } from "../api.js";

const MAX_MISTAKES = 4;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function PlayGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");
  const [tiles, setTiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [solved, setSolved] = useState([]);
  const [mistakesRemaining, setMistakesRemaining] = useState(MAX_MISTAKES);
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState("playing"); // playing | won | lost
  const [showNameModal, setShowNameModal] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState(null);
  const timerRef = useRef(null);
  const triedCombos = useRef(new Set());

  useEffect(() => {
    getGame(id)
      .then((g) => {
        setGame(g);
        const words = g.groups.flatMap((grp) => grp.words);
        setTiles(shuffle(words));
      })
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (!game || status !== "playing") return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [game, status]);

  const wordToGroup = useMemo(() => {
    if (!game) return {};
    const map = {};
    game.groups.forEach((grp, idx) => {
      grp.words.forEach((w) => (map[w] = idx));
    });
    return map;
  }, [game]);

  function toggleTile(word) {
    if (status !== "playing") return;
    setMessage("");
    setSelected((prev) => {
      if (prev.includes(word)) return prev.filter((w) => w !== word);
      if (prev.length >= 4) return prev;
      return [...prev, word];
    });
  }

  function endGame(won) {
    clearInterval(timerRef.current);
    setStatus(won ? "won" : "lost");
    if (!won) {
      const remainingGroups = game.groups
        .map((g, idx) => idx)
        .filter((idx) => !solved.some((s) => s.idx === idx));
      setSolved((prev) => [
        ...prev,
        ...remainingGroups.map((idx) => ({ idx, ...game.groups[idx] })),
      ]);
    }
    setTimeout(() => setShowNameModal(true), won ? 800 : 1200);
  }

  function handleSubmit() {
    if (selected.length !== 4 || status !== "playing") return;

    const comboKey = selected.slice().sort().join("|");
    const groupIdxs = selected.map((w) => wordToGroup[w]);
    const allSame = groupIdxs.every((idx) => idx === groupIdxs[0]);

    if (allSame) {
      const idx = groupIdxs[0];
      const solvedGroup = { idx, ...game.groups[idx] };
      const newSolved = [...solved, solvedGroup];
      setSolved(newSolved);
      setTiles((prev) => prev.filter((w) => !selected.includes(w)));
      setSelected([]);
      setMessage("");
      if (newSolved.length === 4) {
        endGame(true);
      }
      return;
    }

    if (triedCombos.current.has(comboKey)) {
      setMessage("Already tried that combination");
      return;
    }
    triedCombos.current.add(comboKey);

    const counts = {};
    groupIdxs.forEach((idx) => (counts[idx] = (counts[idx] || 0) + 1));
    const oneAway = Object.values(counts).some((c) => c === 3);

    setShake(true);
    setTimeout(() => setShake(false), 500);
    setMessage(oneAway ? "One away…" : "Not quite");

    setMistakesRemaining((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setTimeout(() => endGame(false), 50);
      }
      return next;
    });
  }

  async function handleNameConfirm(name) {
    try {
      await submitScore(id, {
        name,
        timeSeconds: elapsed,
        mistakes: MAX_MISTAKES - mistakesRemaining,
        won: status === "won",
      });
      setScoreSaved(true);
      const scores = await getScores(id);
      setLeaderboard(scores);
    } catch (err) {
      setError(err.message);
    } finally {
      setShowNameModal(false);
    }
  }

  async function handleDeleteGame() {
    if (!window.confirm("Delete this puzzle? This can't be undone.")) return;
    try {
      await deleteGame(id);
      navigate("/play");
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <div className="form-error">{error}</div>;
  if (!game) return <div className="loading">Loading puzzle…</div>;

  return (
    <div className="play-game">
      <div className="play-header">
        <h1>{game.title}</h1>
        <p className="page-subtitle">by {game.creatorName}</p>
      </div>

      <div className="play-owner-actions">
        <Link to={`/edit/${id}`} className="btn btn-ghost">
          Edit puzzle
        </Link>
        <button type="button" className="btn btn-ghost" onClick={handleDeleteGame}>
          Delete puzzle
        </button>
      </div>

      <div className="play-stats">
        <span>⏱ {formatTime(elapsed)}</span>
        <span className="mistakes-tracker">
          Mistakes:
          {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
            <span
              key={i}
              className={`mistake-dot ${i < mistakesRemaining ? "" : "used"}`}
            />
          ))}
        </span>
      </div>

      <p className="hint">Find groups of four items that share something in common.</p>

      <div className="board">
        {solved.map((g) => (
          <div key={g.idx} className={`solved-row difficulty-${g.idx}`}>
            <div className="solved-category">{g.category}</div>
            <div className="solved-words">{g.words.join(", ")}</div>
          </div>
        ))}

        <div className="tile-grid">
          {tiles.map((word) => (
            <button
              key={word}
              type="button"
              className={`tile ${selected.includes(word) ? "selected" : ""} ${shake && selected.includes(word) ? "shake" : ""}`}
              onClick={() => toggleTile(word)}
              disabled={status !== "playing"}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="play-message">{message}</div>}

      {status === "playing" && (
        <div className="play-controls">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setTiles((prev) => shuffle(prev))}
          >
            Shuffle
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setSelected([])}
            disabled={selected.length === 0}
          >
            Deselect All
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={selected.length !== 4}
          >
            Submit
          </button>
        </div>
      )}

      {status !== "playing" && (
        <div className="end-banner">
          <h2>{status === "won" ? "🎉 Solved it!" : "Better luck next time"}</h2>
          <p>
            Time: {formatTime(elapsed)} · Mistakes: {MAX_MISTAKES - mistakesRemaining}
          </p>
        </div>
      )}

      {scoreSaved && leaderboard && (
        <div className="leaderboard">
          <h3>Leaderboard</h3>
          <ol>
            {leaderboard.slice(0, 10).map((s, i) => (
              <li key={i}>
                <span>{s.name}</span>
                <span>
                  {formatTime(s.timeSeconds)} · {s.mistakes} mistake{s.mistakes === 1 ? "" : "s"}
                  {!s.won && " · DNF"}
                </span>
              </li>
            ))}
          </ol>
          <div className="modal-actions">
            <Link to="/play" className="btn btn-secondary">
              More games
            </Link>
            <Link to="/create" className="btn btn-primary">
              Create your own
            </Link>
          </div>
        </div>
      )}

      {showNameModal && (
        <NameModal
          title={status === "won" ? "You solved it!" : "Nice try!"}
          subtitle="Enter your name to save your score."
          confirmLabel="Save Score"
          onConfirm={handleNameConfirm}
        />
      )}
    </div>
  );
}
