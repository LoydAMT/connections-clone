import { useEffect, useRef, useState } from "react";
import { THEMES, applyTheme, getStoredTheme } from "../theme.js";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getStoredTheme);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickAway(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, []);

  function choose(value) {
    setTheme(value);
    applyTheme(value);
    setOpen(false);
  }

  const current = THEMES.find((t) => t.value === theme) || THEMES[0];

  return (
    <div className="theme-toggle" ref={rootRef}>
      <button
        type="button"
        className="theme-toggle-btn"
        aria-label="Change theme"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="theme-toggle-icon">{current.icon}</span>
      </button>
      {open && (
        <div className="theme-menu">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`theme-menu-item ${t.value === theme ? "active" : ""}`}
              onClick={() => choose(t.value)}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
