import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AtSign, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const DISMISS_KEY = 'rsu_username_prompt_dismissed';
const DISMISS_DAYS = 3;

/**
 * A gentle, delayed prompt that appears for logged-in users who haven't set a
 * display name yet, inviting them to add one. Dismissible ("Maybe later"), and
 * won't nag again for a few days after being dismissed.
 */
export function UsernamePrompt() {
  const { user, profile, refreshProfile } = useAuth();
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !profile || profile.username) return;
    try {
      const d = localStorage.getItem(DISMISS_KEY);
      if (d && Date.now() - Number(d) < DISMISS_DAYS * 86_400_000) return;
    } catch { /* ignore */ }
    const t = setTimeout(() => setShow(true), 5000); // gradual — 5s after landing
    return () => clearTimeout(t);
  }, [user, profile]);

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
    setShow(false);
  }

  async function save() {
    if (!user) return;
    const clean = name.trim().slice(0, 30);
    if (!clean) return;
    setSaving(true);
    await supabase.from('profiles').update({ username: clean }).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setShow(false);
  }

  if (!show) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[998] flex items-end justify-center bg-black/40 px-4 pb-6 sm:items-center sm:pb-0"
        onClick={dismiss}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-school-navy"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-school-green/15 text-school-green"><AtSign size={20} /></span>
            <div>
              <h3 className="font-sora font-bold text-school-navy dark:text-white">Add a display name 🏷️</h3>
              <p className="text-xs text-school-muted">Shown on leaderboards & shout-outs — your email stays private.</p>
            </div>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            placeholder="e.g. David O."
            autoFocus
            className="w-full rounded-lg border border-school-green/20 bg-school-light px-3 py-2.5 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-white/10 dark:text-white"
          />
          <div className="mt-3 flex gap-2">
            <button onClick={dismiss} className="flex-1 rounded-lg border border-school-green/20 px-4 py-2.5 text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200 dark:hover:bg-white/10">
              Maybe later
            </button>
            <button
              onClick={save}
              disabled={saving || !name.trim()}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-school-green px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40"
            >
              {saving ? 'Saving…' : <><Check size={15} /> Save</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
