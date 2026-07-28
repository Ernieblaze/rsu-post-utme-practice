import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

function initial(): Theme {
  try {
    const saved = localStorage.getItem('mitum_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* ignore */ }
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * AdmitMe light/dark theme — sets data-theme on <html> (RSU ignores it, so both
 * coexist) and persists the choice. Shared by the home and every exam page.
 */
export function useMitumTheme() {
  const [theme, setTheme] = useState<Theme>(initial);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('mitum_theme', theme); } catch { /* ignore */ }
  }, [theme]);
  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}
