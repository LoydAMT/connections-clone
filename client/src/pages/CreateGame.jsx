import { useState } from "react";
import { Link } from "react-router-dom";
import NameModal from "../components/NameModal.jsx";
import { createGame } from "../api.js";

const DIFFICULTY_LABELS = ["Yellow (easiest)", "Green", "Blue", "Purple (trickiest)"];

function emptyGroups() {
  return Array.from({ length: 4 }, () => ({ category: "", words: ["", "", "", ""] }));
}

export default function CreateGame() {
  const [title, setTitle] = useState("");
  const [groups, setGroups] = useState(emptyGroups());
  const [showNameModal, setShowNameModal] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  function updateCategory(groupIndex, value) {
    setGroups((prev) =>
      prev.map((g, i) => (i === groupIndex ? { ...g, category: value } : g))
    );
  }

  function updateWord(groupIndex, wordIndex, value) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? { ...g, words: g.words.map((w, wi) => (wi === wordIndex ? value : w)) }
          : g
      )
    );
  }

  function validate() {
    for (const g of groups) {
      if (!g.category.trim()) return "Every group needs a category name.";
      if (g.words.some((w) => !w.trim())) return "Every group needs 4 words filled in.";
    }
    const allWords = groups.flatMap((g) => g.words.map((w) => w.trim().toUpperCase()));
    if (new Set(allWords).size !== 16) return "All 16 words must be unique.";
    return "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setShowNameModal(true);
  }

  async function handleNameConfirm(creatorName) {
    setSaving(true);
    try {
      const res = await createGame({ title, creatorName, groups });
      setResult({ id: res.id, creatorName });
      setShowNameModal(false);
    } catch (err) {
      setError(err.message);
      setShowNameModal(false);
    } finally {
      setSaving(false);
    }
  }

  if (result) {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/play/${result.id}`;
    return (
      <div className="create-success">
        <h2>Puzzle saved!</h2>
        <p>Thanks, {result.creatorName}. Your puzzle is ready to play.</p>
        <div className="share-box">
          <input type="text" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigator.clipboard.writeText(shareUrl)}
          >
            Copy link
          </button>
        </div>
        <div className="modal-actions">
          <Link to="/play" className="btn btn-secondary">
            Browse games
          </Link>
          <Link to={`/play/${result.id}`} className="btn btn-primary">
            Play it now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="create-game">
      <h1>Create a Game</h1>
      <p className="page-subtitle">
        Fill in 4 categories, each with 4 words. Order them from easiest (yellow) to trickiest (purple).
      </p>

      <form onSubmit={handleSubmit}>
        <label className="puzzle-title-field">
          Puzzle title (optional)
          <input
            type="text"
            value={title}
            maxLength={60}
            placeholder="e.g. Friday Trivia"
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        {groups.map((g, gi) => (
          <fieldset key={gi} className={`group-fieldset difficulty-${gi}`}>
            <legend>{DIFFICULTY_LABELS[gi]}</legend>
            <input
              type="text"
              className="category-input"
              placeholder="Category name (e.g. Types of Pasta)"
              value={g.category}
              maxLength={40}
              onChange={(e) => updateCategory(gi, e.target.value)}
            />
            <div className="words-grid">
              {g.words.map((w, wi) => (
                <input
                  key={wi}
                  type="text"
                  placeholder={`Word ${wi + 1}`}
                  value={w}
                  maxLength={20}
                  onChange={(e) => updateWord(gi, wi, e.target.value)}
                />
              ))}
            </div>
          </fieldset>
        ))}

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Puzzle"}
          </button>
        </div>
      </form>

      {showNameModal && (
        <NameModal
          title="What's your name?"
          subtitle="We'll show this as the puzzle's creator."
          confirmLabel="Save Puzzle"
          onConfirm={handleNameConfirm}
          onCancel={() => setShowNameModal(false)}
        />
      )}
    </div>
  );
}
