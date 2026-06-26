import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

export function AuthControl() {
  const { user, loading, signOut } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-[10rem] truncate rounded-lg bg-school-pale px-3 py-2 text-xs font-semibold text-school-navy dark:bg-white/10 dark:text-slate-200 sm:block">
          {user.email}
        </span>
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg border border-school-green/20 bg-school-light px-3 py-2 text-sm font-semibold text-school-navy transition hover:bg-school-pale dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white dark:hover:bg-school-navy/40"
        >
          Dashboard
        </button>
        <button
          onClick={() => signOut()}
          className="rounded-lg border border-school-green/20 bg-school-light px-3 py-2 text-sm font-semibold text-school-navy transition hover:bg-school-pale dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white dark:hover:bg-school-navy/40"
        >
          Log out
        </button>
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
