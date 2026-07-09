import { useState } from "react";

export default function NameModal({ title, subtitle, confirmLabel, onConfirm, onCancel }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }
    onConfirm(name.trim());
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{title}</h2>
        {subtitle && <p className="modal-subtitle">{subtitle}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            autoFocus
            placeholder="Your name"
            value={name}
            maxLength={30}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
          />
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            {onCancel && (
              <button type="button" className="btn btn-ghost" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {confirmLabel || "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
