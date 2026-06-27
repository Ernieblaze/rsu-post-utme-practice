import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

export function AuthControl() {
  const { user, loading, profile, signOut } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return null;

  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex max-w-[10rem] items-center gap-1.5 rounded-lg border border-school-green/20 bg-school-light px-3 py-2 text-sm font-semibold text-school-navy transition hover:bg-school-pale dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white dark:hover:bg-school-navy/40"
        >
          <span className="min-w-0 flex-1 truncate">{user.email}</span>
          <ChevronDown size={14} className={`shrink-0 transition ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-school-green/20 bg-white shadow-xl dark:border-school-green/30 dark:bg-school-navy"
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate('/dashboard');
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-school-navy transition hover:bg-school-pale dark:text-slate-200 dark:hover:bg-school-navy/60"
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>
            {profile?.is_admin && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/owner');
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-school-navy transition hover:bg-school-pale dark:text-slate-200 dark:hover:bg-school-navy/60"
              >
                <ShieldCheck size={14} /> Owner Dashboard
              </button>
            )}
            <button
              onClick={() => {
                setMenuOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-school-navy transition hover:bg-school-pale dark:text-slate-200 dark:hover:bg-school-navy/60"
            >
              <LogOut size={14} /> Log out
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="rounded-lg bg-school-green px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-school-green/90"
      >
        Sign up / Log in
      </button>
      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
