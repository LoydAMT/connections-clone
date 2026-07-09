const DIFFICULTY_LABELS = ["Yellow (easiest)", "Green", "Blue", "Purple (trickiest)"];

export function emptyGroups() {
  return Array.from({ length: 4 }, () => ({ category: "", words: ["", "", "", ""] }));
}

export function validatePuzzle(groups) {
  for (const g of groups) {
    if (!g.category.trim()) return "Every group needs a category name.";
    if (g.words.some((w) => !w.trim())) return "Every group needs 4 words filled in.";
  }
  const allWords = groups.flatMap((g) => g.words.map((w) => w.trim().toUpperCase()));
  if (new Set(allWords).size !== 16) return "All 16 words must be unique.";
  return "";
}

export default function PuzzleForm({
  title,
  groups,
  onTitleChange,
  onCategoryChange,
  onWordChange,
  onSubmit,
  error,
  saving,
  submitLabel,
}) {
  return (
    <form onSubmit={onSubmit}>
      <label className="puzzle-title-field">
        Puzzle title (optional)
        <input
          type="text"
          value={title}
          maxLength={60}
          placeholder="e.g. Friday Trivia"
          onChange={(e) => onTitleChange(e.target.value)}
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
            onChange={(e) => onCategoryChange(gi, e.target.value)}
          />
          <div className="words-grid">
            {g.words.map((w, wi) => (
              <input
                key={wi}
                type="text"
                placeholder={`Word ${wi + 1}`}
                value={w}
                maxLength={20}
                onChange={(e) => onWordChange(gi, wi, e.target.value)}
              />
            ))}
          </div>
        </fieldset>
      ))}

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
