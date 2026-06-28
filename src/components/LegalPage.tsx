import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { LegalDoc } from '../data/legalContent';

export function LegalPage({ title, lastUpdated, sections }: LegalDoc) {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="font-sora text-3xl font-bold text-school-navy dark:text-white">{title}</h1>
      <p className="mt-1 text-sm text-school-muted">Last updated: {lastUpdated}</p>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">
              {section.heading}
            </h2>
            <div className="mt-2 space-y-2">
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-school-navy/80 dark:text-slate-300">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
