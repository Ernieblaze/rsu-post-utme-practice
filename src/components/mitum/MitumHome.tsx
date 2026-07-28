import { useEffect, useState } from 'react';
import { MitumNav } from './MitumNav';
import { MitumHero } from './MitumHero';
import { FloatingTrustBar, BentoGrid, ChooseExam } from './MitumSections';
import { SchoolNews, HowItWorks, Testimonials, StatsStrip, Pricing, Faq, SchoolsPartners, FinalCta, MitumFooter } from './MitumSections2';
import { COMPANY } from '../../config/admitme';
import { WHATSAPP_NUMBER } from '../../lib/support';

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
      <ChooseExam />
      <HowItWorks />
      <BentoGrid />
      <SchoolNews />
      <Testimonials />
      <StatsStrip />
      <Pricing onStart={onLogin} />
      <Faq />
      <SchoolsPartners waLink={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi AdmitMe — I would like to partner / bring AdmitMe to my students.')}`} />
      <FinalCta onStart={onLogin} />
      <MitumFooter supportEmail={COMPANY.supportEmail} />
    </div>
  );
}
