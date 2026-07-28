import { useEffect, useState } from 'react';
import { MitumNav } from './MitumNav';
import { MitumHero } from './MitumHero';

type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem('mitum_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* ignore */ }
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Mitum homepage (redesign, in progress). Owns the theme (data-theme on <html>;
 * RSU ignores it, so both coexist). PHASE 1 renders the design-system foundation
 * for review — full page sections land in later phases.
 */
export function MitumHome({ onLogin }: { onLogin: () => void }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('mitum_theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div id="top" className="mitum-app">
      <MitumNav theme={theme} onToggleTheme={toggle} onLogin={onLogin} onStart={onLogin} />
      <MitumHero onStart={onLogin} />

      <main className="mx-auto max-w-3xl px-4 py-14">
        <p className="mt-body rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
          ✅ <strong style={{ color: 'var(--text)' }}>Phase 2 (Hero) complete.</strong> Try the theme toggle — the page re-themes; the hero stays a dark exam-hall band by design.
          Next up: <strong style={{ color: 'var(--text)' }}>Phase 3 — floating trust bar, the bento feature grid, and the “Choose your exam” cards.</strong>
        </p>
      </main>
    </div>
  );
}
