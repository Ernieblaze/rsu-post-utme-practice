import { motion, useReducedMotion } from 'framer-motion';
import { Home, BookOpen, Sparkles, BarChart3, User } from 'lucide-react';
import { RSU_HOME } from '../config/admitme';

interface Tab {
  key: string;      // matches the app `view` for active state
  label: string;
  path: string;
  icon: typeof Home;
}

const TABS: Tab[] = [
  { key: 'home', label: 'Home', path: RSU_HOME, icon: Home },
  { key: 'bank', label: 'Practice', path: '/bank', icon: BookOpen },
  { key: 'ai-tutor', label: 'Tutor', path: '/ai-tutor', icon: Sparkles },
  { key: 'progress', label: 'Progress', path: '/progress', icon: BarChart3 },
  { key: 'dashboard', label: 'Profile', path: '/dashboard', icon: User },
];

/**
 * Mobile-only bottom navigation — the single biggest "this is an app" signal.
 * Fixed to the bottom, one-thumb reachable, with a springy active indicator and
 * iOS home-indicator safe-area padding. Hidden on tablet/desktop (sm+).
 */
export function BottomTabBar({ currentView, onNavigate }: { currentView: string; onNavigate: (path: string) => void }) {
  const reduce = useReducedMotion();
  return (
    <nav
      aria-label="Primary"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-school-green/15 bg-white/95 backdrop-blur sm:hidden dark:border-white/10 dark:bg-school-navy/95"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5">
        {TABS.map((t) => {
          const active = t.key === currentView;
          const Icon = t.icon;
          return (
            <li key={t.key} className="flex-1">
              <button
                onClick={() => onNavigate(t.path)}
                aria-current={active ? 'page' : undefined}
                className="relative flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors"
                style={{ color: active ? '#046a38' : '#94a3b8' }}
              >
                {active && (
                  <motion.span
                    layoutId={reduce ? undefined : 'tabbar-dot'}
                    transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                    className="absolute -top-1.5 h-1 w-6 rounded-full bg-school-green"
                  />
                )}
                <motion.span animate={reduce ? undefined : { y: active ? -1 : 0, scale: active ? 1.08 : 1 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}>
                  <Icon size={21} strokeWidth={active ? 2.4 : 2} />
                </motion.span>
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
