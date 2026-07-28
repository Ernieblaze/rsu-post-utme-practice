import { useEffect, useState } from 'react';
import { MitumNav } from './MitumNav';
import { MitumHero } from './MitumHero';
import { FloatingTrustBar, BentoGrid, ChooseExam } from './MitumSections';

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
      <FloatingTrustBar />
      <BentoGrid />
      <ChooseExam />

      <main className="mx-auto max-w-3xl px-4 py-14">
        <p className="mt-body rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
          ✅ <strong style={{ color: 'var(--text)' }}>Phase 3 complete</strong> — floating trust bar, bento feature grid, and the “Choose your exam” cards.
          Next: <strong style={{ color: 'var(--text)' }}>Phase 4 — AI Study Helper, School News, How it works, testimonials, stats, Coming Soon, FAQ, Schools, final CTA, footer.</strong>
        </p>
      </main>
    </div>
  );
}
