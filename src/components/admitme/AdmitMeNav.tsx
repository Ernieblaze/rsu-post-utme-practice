import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { AdmitMeButton } from './AdmitMeButton';

const LINKS = [
  { label: 'Exams', to: '#exams' },
  { label: 'What we offer', to: '#offers' },
  { label: 'News', to: '#news' },
  { label: 'Pricing', to: '#pricing' },
];

interface AdmitMeNavProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogin: () => void;
  onStart: () => void;
}

/** AdmitMe logo — a gold exam-tile "A" + wordmark. */
function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5">
      <span
        className="mt-display flex h-9 w-9 items-center justify-center rounded-xl text-lg font-extrabold"
        style={{ background: 'var(--primary)', color: '#1B1206', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5)' }}
      >
        A
      </span>
      <span className="mt-display text-xl font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
        Admit<span style={{ color: 'var(--primary)' }}>Me</span>
      </span>
    </a>
  );
}

export function AdmitMeNav({ theme, onToggleTheme, onLogin, onStart }: AdmitMeNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${scrolled ? 'mt-glass' : ''}`}
      style={{ borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />

        {/* desktop links */}
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className="mt-body rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="mt-btn mt-btn-secondary"
            style={{ padding: '0.5rem', width: '2.5rem', height: '2.5rem' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </motion.span>
            </AnimatePresence>
          </button>

          <button onClick={onLogin} className="mt-btn mt-btn-tertiary hidden sm:inline-flex">Login</button>
          <AdmitMeButton onClick={onStart} className="hidden sm:inline-flex">Start free</AdmitMeButton>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="mt-btn mt-btn-secondary lg:hidden"
            style={{ padding: '0.5rem', width: '2.5rem', height: '2.5rem' }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="mt-glass overflow-hidden lg:hidden"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              {LINKS.map((l) => (
                <a
                  key={l.to}
                  href={l.to}
                  onClick={() => setOpen(false)}
                  className="mt-body rounded-lg px-3 py-2.5 text-sm font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                <button onClick={onLogin} className="mt-btn mt-btn-secondary flex-1">Login</button>
                <AdmitMeButton onClick={onStart} className="flex-1">Start free</AdmitMeButton>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
