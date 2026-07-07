import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X, Grid3x3, LogIn, LogOut, User as UserIcon, GraduationCap, Gauge } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EXAMS } from '../config/admitme';

export interface ShellTheme {
  primary: string;
  light?: string;
}
export interface ShellNavItem {
  label: string;
  to: string; // "#anchor" scrolls; "/route" navigates
}

interface SectionShellProps {
  theme: ShellTheme;
  /** Logo text split into two parts (e.g. "JAMB" + "Prep", or "Admit" + "Me"). */
  brandName: string;
  brandAccent: string;
  /** Exam id this section represents (to mark it current in the switcher). */
  currentExamId?: string;
  navItems?: ShellNavItem[];
  onLogin: () => void;
}

/**
 * Shared, themeable top bar for every AdmitMe section (portal, JAMB, UniPort,
 * WAEC…). Gives all sections a consistent header with: an exam switcher (hop
 * between exams), a proper mobile menu, and one "Log in with AdmitMe" control
 * wired to the single shared account — so logging in anywhere unlocks the whole
 * platform.
 */
export function SectionShell({ theme, brandName, brandAccent, currentExamId, navItems = [], onLogin }: SectionShellProps) {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [switchOpen, setSwitchOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const switchRef = useRef<HTMLDivElement>(null);
  const acctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (switchRef.current && !switchRef.current.contains(e.target as Node)) setSwitchOpen(false);
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setAcctOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function go(to: string) {
    setMobileOpen(false);
    if (to.startsWith('#')) document.querySelector(to)?.scrollIntoView({ behavior: 'smooth' });
    else navigate(to);
  }

  const switchTargets = [
    ...EXAMS.filter((e) => e.status === 'live' || e.path).map((e) => ({ id: e.id, name: e.name, accent: e.accent, path: e.path ?? '/' })),
    { id: 'admitme', name: 'AdmitMe Home', accent: theme.primary, path: '/admitme' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <button onClick={() => navigate('/admitme')} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ring-1 ring-black/5" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.light ?? theme.primary})` }}>
            <GraduationCap size={18} />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">{brandName}<span style={{ color: theme.primary }}>{brandAccent}</span></span>
        </button>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((n) => (
            <button key={n.label} onClick={() => go(n.to)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900">
              {n.label}
            </button>
          ))}

          {profile?.is_admin && (
            <button onClick={() => navigate('/hq')} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition hover:text-slate-900">
              <Gauge size={15} /> HQ
            </button>
          )}

          {/* Exam switcher */}
          <div className="relative ml-1" ref={switchRef}>
            <button onClick={() => setSwitchOpen((o) => !o)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
              <Grid3x3 size={15} /> Switch exam <ChevronDown size={14} className={switchOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
            <AnimatePresence>
              {switchOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Explore AdmitMe</p>
                  {switchTargets.map((t) => (
                    <button key={t.id} onClick={() => { setSwitchOpen(false); navigate(t.path); }} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-slate-50 ${t.id === currentExamId ? 'bg-slate-50' : ''}`}>
                      <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: t.accent }} />
                      <span className="text-slate-800">{t.name}</span>
                      {t.id === currentExamId && <span className="ml-auto text-[10px] font-bold text-slate-400">Here</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth */}
          {user ? (
            <div className="relative ml-1" ref={acctRef}>
              <button onClick={() => setAcctOpen((o) => !o)} className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold text-white shadow-sm" style={{ background: theme.primary }}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-xs uppercase">{user.email?.[0] ?? <UserIcon size={13} />}</span>
                <ChevronDown size={14} className={acctOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              <AnimatePresence>
                {acctOpen && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                    <p className="truncate px-3 py-2 text-xs font-semibold text-slate-500">{user.email}</p>
                    <button onClick={() => { setAcctOpen(false); void signOut(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                      <LogOut size={15} /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={onLogin} className="ml-1 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90" style={{ background: theme.primary }}>
              <LogIn size={15} /> Log in
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-800 md:hidden">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            {navItems.map((n) => (
              <button key={n.label} onClick={() => go(n.to)} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50">{n.label}</button>
            ))}
            {profile?.is_admin && (
              <button onClick={() => { setMobileOpen(false); navigate('/hq'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-bold text-slate-800 hover:bg-slate-50">
                <Gauge size={15} /> AdmitMe HQ
              </button>
            )}
            <p className="mt-2 px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Switch exam</p>
            {switchTargets.map((t) => (
              <button key={t.id} onClick={() => { setMobileOpen(false); navigate(t.path); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50">
                <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: t.accent }} /> {t.name}
              </button>
            ))}
            <div className="mt-3 border-t border-slate-100 pt-3">
              {user ? (
                <button onClick={() => { setMobileOpen(false); void signOut(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50">
                  <LogOut size={15} /> Log out ({user.email})
                </button>
              ) : (
                <button onClick={() => { setMobileOpen(false); onLogin(); }} className="flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white" style={{ background: theme.primary }}>
                  <LogIn size={15} /> Log in with AdmitMe
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
