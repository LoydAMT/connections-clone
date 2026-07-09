import { useState } from "react";
import { Link } from "react-router-dom";
import NameModal from "../components/NameModal.jsx";
import PuzzleForm, { emptyGroups, validatePuzzle } from "../components/PuzzleForm.jsx";
import { createGame } from "../api.js";

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

  function handleSubmit(e) {
    e.preventDefault();
    const validationError = validatePuzzle(groups);
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

      <PuzzleForm
        title={title}
        groups={groups}
        onTitleChange={setTitle}
        onCategoryChange={updateCategory}
        onWordChange={updateWord}
        onSubmit={handleSubmit}
        error={error}
        saving={saving}
        submitLabel="Save Puzzle"
      />

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
