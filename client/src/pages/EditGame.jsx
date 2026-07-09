import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PuzzleForm, { validatePuzzle } from "../components/PuzzleForm.jsx";
import { getGame, updateGame } from "../api.js";

export default function EditGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [groups, setGroups] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGame(id)
      .then((g) => {
        setTitle(g.title === "Untitled Puzzle" ? "" : g.title);
        setGroups(g.groups.map((grp) => ({ category: grp.category, words: [...grp.words] })));
        setLoaded(true);
      })
      .catch((err) => setError(err.message));
  }, [id]);

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

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validatePuzzle(groups);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSaving(true);
    try {
      await updateGame(id, { title, groups });
      navigate(`/play/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error && !loaded) return <div className="form-error">{error}</div>;
  if (!loaded) return <div className="loading">Loading puzzle…</div>;

  return (
    <div className="create-game">
      <h1>Edit Puzzle</h1>
      <p className="page-subtitle">Update the categories and words, then save your changes.</p>

      <PuzzleForm
        title={title}
        groups={groups}
        onTitleChange={setTitle}
        onCategoryChange={updateCategory}
        onWordChange={updateWord}
        onSubmit={handleSubmit}
        error={error}
        saving={saving}
        submitLabel="Save Changes"
      />
    </div>
  );
}
