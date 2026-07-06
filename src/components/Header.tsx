import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, BarChart3, Home, Menu, X, GraduationCap, Layers, Trophy, Target,
  HelpCircle, Sparkles, TrendingUp, ChevronDown, LayoutDashboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthControl } from './AuthControl';
import { ExamCountdown } from './ExamCountdown';

type NavView = 'home' | 'progress' | 'revision' | 'bank' | 'exam-focus' | 'ai-tutor' | 'admin' | 'leaderboard';

interface HeaderProps {
  dark: boolean;
  currentView: string;
  onToggleDark: () => void;
  onNavigate: (view: NavView) => void;
}

/** Views that live inside the "More" dropdown — used to highlight it when active. */
const MORE_VIEWS = ['revision', 'progress', 'ai-tutor', 'leaderboard', 'dashboard', 'guide'];

export function Header({ dark, currentView, onToggleDark, onNavigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();
  const moreRef = useRef<HTMLDivElement>(null);

  // Close the "More" dropdown on outside click / Escape.
  useEffect(() => {
    if (!moreOpen) return;
    function onDown(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setMoreOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [moreOpen]);

  const primary = [
    { key: 'home', label: 'Home', icon: <Home size={16} /> },
    { key: 'exam-focus', label: 'Exam Focus', icon: <Target size={16} /> },
    { key: 'bank', label: 'Practice', icon: <Layers size={16} /> },
  ] as const;

  const moreItems = [
    { label: 'Revision', icon: <GraduationCap size={16} />, run: () => onNavigate('revision') },
    { label: 'AI Tutor', icon: <Sparkles size={16} />, run: () => onNavigate('ai-tutor') },
    { label: 'Progress', icon: <BarChart3 size={16} />, run: () => onNavigate('progress') },
    { label: 'Leaderboard', icon: <Trophy size={16} />, run: () => onNavigate('leaderboard') },
    { label: 'My Dashboard', icon: <LayoutDashboard size={16} />, run: () => navigate('/dashboard') },
    { label: 'How to Use', icon: <HelpCircle size={16} />, run: () => navigate('/guide') },
  ];

  const moreActive = MORE_VIEWS.includes(currentView);

  function navClass(active: boolean) {
    return `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
      active
        ? 'bg-school-green text-white shadow-sm'
        : 'text-school-navy/80 hover:bg-school-pale dark:text-slate-200 dark:hover:bg-white/10'
    }`;
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-school-green/20 bg-white/95 shadow-sm backdrop-blur-md dark:border-school-green/30 dark:bg-school-navy/95"
    >
      <ExamCountdown />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-school-green to-school-navy text-white shadow-md ring-1 ring-school-gold/40">
            <span className="text-xs font-extrabold tracking-tighter">RSU</span>
            <span className="text-[6px] font-semibold uppercase tracking-widest text-school-gold">Post-UTME</span>
          </div>
          <div className="hidden text-left leading-tight sm:block">
            <div className="text-sm font-extrabold tracking-tight text-school-navy dark:text-white">RSU Post-UTME</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
              Practice Platform
            </div>
          </div>
        </motion.button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {primary.map((item) => (
            <button key={item.key} onClick={() => onNavigate(item.key as NavView)} className={navClass(currentView === item.key)}>
              {item.icon} {item.label}
            </button>
          ))}

          {/* Predictor — highlighted with a "new" dot */}
          <button onClick={() => navigate('/predictor')} className={`relative ${navClass(currentView === 'predictor')}`}>
            <TrendingUp size={16} /> Predictor
            {currentView !== 'predictor' && (
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
              </span>
            )}
          </button>

          {/* "More" dropdown — deliberately styled to look clickable/discoverable */}
          <div className="relative ml-1" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-bold transition ${
                moreActive || moreOpen
                  ? 'border-school-gold bg-school-gold/15 text-school-navy dark:text-school-gold'
                  : 'border-school-gold/40 bg-gradient-to-r from-school-gold/10 to-school-green/10 text-school-navy hover:from-school-gold/20 hover:to-school-green/20 dark:text-slate-100'
              }`}
            >
              <Sparkles size={15} className="text-school-gold" /> More
              <ChevronDown size={15} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-school-green/15 bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:border-school-green/25 dark:bg-school-navy dark:ring-white/5"
                >
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-school-muted">More tools</p>
                  {moreItems.map((item) => (
                    <button
                      key={item.label}
                      role="menuitem"
                      onClick={() => { item.run(); setMoreOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-school-navy transition hover:bg-school-pale dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      <span className="text-school-green">{item.icon}</span> {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onToggleDark}
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg border border-school-green/20 bg-school-light text-school-navy hover:bg-school-pale dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="ml-2">
            <AuthControl />
          </div>
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onToggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-school-green/20 bg-school-light text-school-navy dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-school-light text-school-navy dark:bg-school-navy/60 dark:text-white"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-school-green/10 bg-white px-4 py-3 dark:border-school-green/20 dark:bg-school-navy/95 md:hidden"
        >
          <MobileItem icon={<Home size={16} />} label="Home" onClick={() => { onNavigate('home'); setMobileOpen(false); }} />
          <MobileItem icon={<Target size={16} />} label="Exam Focus" onClick={() => { onNavigate('exam-focus'); setMobileOpen(false); }} />
          <MobileItem icon={<Layers size={16} />} label="Practice" onClick={() => { onNavigate('bank'); setMobileOpen(false); }} />
          <MobileItem
            icon={<TrendingUp size={16} />}
            label="Admission Predictor"
            badge="New"
            onClick={() => { navigate('/predictor'); setMobileOpen(false); }}
          />
          <MobileItem icon={<GraduationCap size={16} />} label="Revision" onClick={() => { onNavigate('revision'); setMobileOpen(false); }} />
          <MobileItem icon={<Sparkles size={16} />} label="AI Tutor" onClick={() => { onNavigate('ai-tutor'); setMobileOpen(false); }} />
          <MobileItem icon={<BarChart3 size={16} />} label="Progress" onClick={() => { onNavigate('progress'); setMobileOpen(false); }} />
          <MobileItem icon={<Trophy size={16} />} label="Leaderboard" onClick={() => { onNavigate('leaderboard'); setMobileOpen(false); }} />
          <MobileItem icon={<LayoutDashboard size={16} />} label="My Dashboard" onClick={() => { navigate('/dashboard'); setMobileOpen(false); }} />
          <MobileItem icon={<HelpCircle size={16} />} label="How to Use" onClick={() => { navigate('/guide'); setMobileOpen(false); }} />
          <div className="mt-3">
            <AuthControl />
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

function MobileItem({
  icon, label, onClick, badge,
}: { icon: React.ReactNode; label: string; onClick: () => void; badge?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
    >
      {icon} {label}
      {badge && (
        <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
