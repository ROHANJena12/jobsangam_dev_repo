import React, { useEffect, useState } from 'react';

/**
 * Small, dependency-free theme toggle.
 * Persists preference to localStorage and syncs with prefers-color-scheme.
 */
export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  const next = theme === 'dark' ? 'light' : 'dark';
  const label = theme === 'dark' ? '☀️ Light' : '🌙 Dark';

  return (
    <button
      aria-label="Toggle color theme"
      title={`Switch to ${next} mode`}
      className={`btn-ghost ${className}`}
      onClick={() => setTheme(next)}
      style={{minWidth: 86}}
    >
      {label}
    </button>
  );
}