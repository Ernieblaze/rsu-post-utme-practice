import { Newspaper, Bell } from 'lucide-react';

/**
 * Honest "coming soon" state for an exam's News tab. Instead of fake article
 * cards, it shows a clear placeholder so students know real updates are on the
 * way — no pretending. Themed with the exam's accent.
 */
export function ExamNews({ accent, examName }: { accent: string; examName: string }) {
  const soft = (pct: number) => `color-mix(in srgb, ${accent} ${pct}%, transparent)`;
  return (
    <div>
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: soft(14), color: accent }}><Newspaper size={24} /></span>
        <h2 className="mt-display mt-3 text-2xl font-extrabold" style={{ color: 'var(--text)' }}>{examName} news &amp; updates</h2>
        <p className="mt-body mx-auto mt-1.5 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>Deadlines, changes and study tips — coming soon. We’ll post the updates that actually affect your {examName} here.</p>
        <span className="mt-label mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: soft(14), color: accent }}>
          <Bell size={13} /> Coming soon
        </span>
      </div>

      {/* Ghost placeholders — show the shape of what's coming, clearly not real content */}
      <div className="grid gap-5 sm:grid-cols-3" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div key={i} className="mt-card p-6" style={{ opacity: 0.55 }}>
            <span className="mt-label inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: soft(12), color: accent }}>{examName}</span>
            <div className="mt-4 space-y-2">
              <span className="block h-3.5 rounded-full" style={{ background: 'var(--surface-2)', width: '92%' }} />
              <span className="block h-3.5 rounded-full" style={{ background: 'var(--surface-2)', width: '70%' }} />
            </div>
            <div className="mt-4 space-y-1.5">
              <span className="block h-2.5 rounded-full" style={{ background: 'var(--surface-2)', width: '100%' }} />
              <span className="block h-2.5 rounded-full" style={{ background: 'var(--surface-2)', width: '85%' }} />
              <span className="block h-2.5 rounded-full" style={{ background: 'var(--surface-2)', width: '60%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
