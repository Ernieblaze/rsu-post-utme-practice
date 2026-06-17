import { useState, useRef, useEffect } from 'react';
import { BookOpen, Moon, Sun, BarChart3, Home, ChevronDown, Menu, X, GraduationCap, Layers, Trophy, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { tests } from '../data/tests';

type NavView = 'home' | 'progress' | 'revision' | 'bank' | 'admin' | 'leaderboard';

interface HeaderProps {
  dark: boolean;
  currentView: string;
  onToggleDark: () => void;
  onNavigate: (view: NavView) => void;
  onStartExam: (testId: string) => void;
}

export function Header({ dark, currentView, onToggleDark, onNavigate, onStartExam }: HeaderProps) {
  const [examMenuOpen, setExamMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const examRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (examRef.current && !examRef.current.contains(e.target as Node)) {
        setExamMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function startExam(id: string) {
    setExamMenuOpen(false);
    setMobileOpen(false);
    onStartExam(id);
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-school-green/20 bg-white/95 shadow-sm backdrop-blur-md dark:border-school-green/30 dark:bg-school-navy/95"
    >
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
          {[
            { key: 'home', label: 'Home', icon: <Home size={16} /> },
            { key: 'bank', label: 'Practice', icon: <Layers size={16} /> },
            { key: 'progress', label: 'Progress', icon: <BarChart3 size={16} /> },
            { key: 'revision', label: 'Revision', icon: <GraduationCap size={16} /> },
            { key: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
          ].map((item) => {
            const active = currentView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key as NavView)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-school-green text-white shadow-sm'
                    : 'text-school-navy/80 hover:bg-school-pale dark:text-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {item.icon} {item.label}
              </button>
            );
          })}

          {/* Exam switch dropdown */}
          <div className="relative ml-1" ref={examRef}>
            <button
              onClick={() => setExamMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-school-green/20 bg-school-light px-3 py-2 text-sm font-semibold text-school-navy hover:bg-school-pale dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white dark:hover:bg-school-navy/40"
            >
              Select Exam <ChevronDown size={14} className={`transition ${examMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {examMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-school-green/20 bg-white shadow-xl dark:border-school-green/30 dark:bg-school-navy"
              >
                {tests.map((test) => (
                  <button
                    key={test.id}
                    onClick={() => startExam(test.id)}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-school-navy transition hover:bg-school-pale dark:text-slate-200 dark:hover:bg-school-navy/60"
                  >
                    {test.title.replace('RSU POST-UTME \u2013 ', '')}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <button
            onClick={() => onNavigate('admin')}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg border border-school-gold/30 bg-school-gold/10 text-school-gold hover:bg-school-gold/20"
            aria-label="Admin"
            title="Admin"
          >
            <Shield size={16} />
          </button>

          <button
            onClick={onToggleDark}
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg border border-school-green/20 bg-school-light text-school-navy hover:bg-school-pale dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
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
          <button
            onClick={() => { onNavigate('home'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
          >
            <Home size={16} /> Home
          </button>
          <button
            onClick={() => { onNavigate('bank'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
          >
            <Layers size={16} /> Practice
          </button>
          <button
            onClick={() => { onNavigate('progress'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
          >
            <BarChart3 size={16} /> Progress
          </button>
          <button
            onClick={() => { onNavigate('revision'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
          >
            <GraduationCap size={16} /> Revision
          </button>
          <button
            onClick={() => { onNavigate('leaderboard'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
          >
            <Trophy size={16} /> Leaderboard
          </button>
          <button
            onClick={() => { onNavigate('admin'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-gold hover:bg-school-light"
          >
            <Shield size={16} /> Admin
          </button>
          <div className="mt-2 text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">Exams</div>
          {tests.map((test) => (
            <button
              key={test.id}
              onClick={() => startExam(test.id)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-school-navy hover:bg-school-light dark:text-slate-200"
            >
              <BookOpen size={14} /> {test.title.replace('RSU POST-UTME \u2013 ', '')}
            </button>
          ))}
        </motion.div>
      )}
    </motion.header>
  );
}
