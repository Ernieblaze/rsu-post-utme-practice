import { useEffect, useState } from 'react';
import { AdmitMeNav } from './AdmitMeNav';
import { AdmitMeHero } from './AdmitMeHero';
import { FloatingTrustBar, BentoGrid, ChooseExam } from './AdmitMeSections';
import { SchoolNews, HowItWorks, Testimonials, StatsStrip, Pricing, Faq, SchoolsPartners, FinalCta, AdmitMeFooter } from './AdmitMeSections2';
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
 * AdmitMe homepage (redesign, in progress). Owns the theme (data-theme on <html>;
 * RSU ignores it, so both coexist). PHASE 1 renders the design-system foundation
 * for review — full page sections land in later phases.
 */
export function AdmitMeHome({ onLogin }: { onLogin: () => void }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('mitum_theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div id="top" className="admitme-app">
      <AdmitMeNav theme={theme} onToggleTheme={toggle} onLogin={onLogin} onStart={onLogin} />
      <AdmitMeHero onStart={onLogin} />
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
      <AdmitMeFooter supportEmail={COMPANY.supportEmail} />
    </div>
  );
}
