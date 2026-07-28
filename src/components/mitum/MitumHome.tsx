import { useEffect, useState } from 'react';
import { MitumNav } from './MitumNav';
import { MitumButton } from './MitumButton';

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

      {/* ── Phase 1 review — design-system foundation ── */}
      <main className="mx-auto max-w-5xl px-4 py-14">
        <p className="mt-label text-xs font-semibold" style={{ color: 'var(--primary)' }}>Phase 1 · Foundation</p>
        <h1 className="mt-display mt-2 text-4xl font-extrabold sm:text-5xl" style={{ color: 'var(--text)', letterSpacing: '-0.02em', textWrap: 'balance' }}>
          The Mitum design system
        </h1>
        <p className="mt-body mt-3 max-w-xl text-base" style={{ color: 'var(--text-muted)' }}>
          Fonts, colour tokens, base styles, the button system, and a working navbar with light/dark toggle.
          Try the theme switch in the navbar — everything below re-themes instantly. Hero and full sections come next.
        </p>

        {/* Colour tokens */}
        <section className="mt-10">
          <p className="mt-label mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>Colour tokens</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([
              ['Primary', 'var(--primary)'],
              ['Accent', 'var(--accent)'],
              ['Success', 'var(--success)'],
              ['Surface-2', 'var(--surface-2)'],
              ['Background', 'var(--bg)'],
              ['Text', 'var(--text)'],
              ['Muted', 'var(--text-muted)'],
              ['Border', 'var(--border)'],
            ] as const).map(([label, val]) => (
              <div key={label} className="mt-card overflow-hidden">
                <div className="h-14" style={{ background: val, borderBottom: '1px solid var(--border)' }} />
                <div className="px-3 py-2">
                  <div className="mt-body text-xs font-bold" style={{ color: 'var(--text)' }}>{label}</div>
                  <div className="mt-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{val}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mt-10">
          <p className="mt-label mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>Typography</p>
          <div className="mt-card mt-grid-surface space-y-4 p-6">
            <div>
              <span className="mt-label text-[10px]" style={{ color: 'var(--text-muted)' }}>Display · Sora</span>
              <p className="mt-display text-3xl font-extrabold" style={{ color: 'var(--text)' }}>Walk into the exam hall ready.</p>
            </div>
            <div>
              <span className="mt-label text-[10px]" style={{ color: 'var(--text-muted)' }}>Body · DM Sans</span>
              <p className="mt-body text-base" style={{ color: 'var(--text-muted)' }}>Real past questions, timed mocks, and an explanation on every answer.</p>
            </div>
            <div>
              <span className="mt-label text-[10px]" style={{ color: 'var(--text-muted)' }}>Numbers · JetBrains Mono</span>
              <p className="mt-mono text-2xl font-bold" style={{ color: 'var(--text)' }}>180 Qs · 120:00 · 92%</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="mt-10">
          <p className="mt-label mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>Buttons</p>
          <div className="mt-card flex flex-wrap items-center gap-3 p-6">
            <MitumButton>Start free →</MitumButton>
            <button className="mt-btn mt-btn-secondary">Explore exams</button>
            <button className="mt-btn mt-btn-tertiary">Learn more</button>
          </div>
        </section>

        <p className="mt-body mt-10 rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
          ✅ <strong style={{ color: 'var(--text)' }}>Phase 1 complete.</strong> Scoped to Mitum only — the live RSU app is untouched.
          Say the word and I’ll build <strong style={{ color: 'var(--text)' }}>Phase 2 — the Hero</strong> (headline, phone mockup, trust strip).
        </p>
      </main>
    </div>
  );
}
