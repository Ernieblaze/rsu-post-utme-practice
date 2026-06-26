import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { Progress } from './components/Progress';
import { Revision } from './components/Revision';
import { PracticeBank } from './components/PracticeBank';
import { Admin } from './components/Admin';
import { Leaderboard } from './components/Leaderboard';
import { ToastProvider } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { Upgrade } from './components/Upgrade';
import { useAuth } from './context/AuthContext';
import { canStartTest, getAccessStatus, isSubscriptionActive } from './lib/access';
import { supabase } from './lib/supabaseClient';
import { startPaystackPayment } from './lib/paystack';
import { tests } from './data/tests';
import { getYearlyTests } from './data/questionBank';
import { getBank } from './lib/bankStorage';
import {
  getAttempts,
  getDarkMode,
  getTestState,
  saveAttempt,
  setDarkMode,
  clearTestState,
} from './lib/storage';
import type { Attempt, Test } from './types';

type View = 'home' | 'quiz' | 'results' | 'progress' | 'revision' | 'bank' | 'admin' | 'leaderboard' | 'upgrade';
export type NavView = 'home' | 'progress' | 'revision' | 'bank' | 'admin' | 'leaderboard';

const PATH_TO_VIEW: Record<string, View> = {
  '/': 'home',
  '/quiz': 'quiz',
  '/results': 'results',
  '/progress': 'progress',
  '/revision': 'revision',
  '/bank': 'bank',
  '/admin': 'admin',
  '/leaderboard': 'leaderboard',
  '/upgrade': 'upgrade',
};

const NAV_TO_PATH: Record<NavView, string> = {
  home: '/',
  progress: '/progress',
  revision: '/revision',
  bank: '/bank',
  admin: '/admin',
  leaderboard: '/leaderboard',
};

function AppContent() {
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const location = useLocation();
  const routerNavigate = useNavigate();

  const view: View = PATH_TO_VIEW[location.pathname] ?? 'home';

  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [dynamicTest, setDynamicTest] = useState<Test | null>(null);
  const [result, setResult] = useState<Attempt | null>(null);
  const [dark, setDark] = useState(getDarkMode);
  const [attempts, setAttempts] = useState<Attempt[]>(() => getAttempts());
  const [revisionSubject, setRevisionSubject] = useState<string>('');
  const [bank, setBank] = useState(() => getBank());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    const base = 'RSU Post-UTME Practice';
    const titles: Record<View, string> = {
      home: base,
      quiz: `Timed Test | ${base}`,
      results: `Results | ${base}`,
      progress: `Progress | ${base}`,
      revision: `Revision | ${base}`,
      bank: `Practice | ${base}`,
      admin: `Question Manager | ${base}`,
      leaderboard: `Leaderboard | ${base}`,
      upgrade: `Upgrade | ${base}`,
    };
    document.title = titles[view];
  }, [view]);

  const yearlyTests = useMemo(() => getYearlyTests(bank), [bank]);

  const activeTest = useMemo(() => {
    if (dynamicTest) return dynamicTest;
    return (
      yearlyTests.find((t) => t.id === activeTestId) ||
      tests.find((t) => t.id === activeTestId) ||
      null
    );
  }, [activeTestId, dynamicTest, yearlyTests]);

  const activeTestStateTestId = useMemo(() => {
    const state = getTestState();
    return state ? state.testId : null;
  }, [view, attempts]);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    setDarkMode(next);
  }

  function startTest(id: string) {
    setDynamicTest(null);
    setActiveTestId(id);
    routerNavigate('/quiz');
  }

  function startDynamicTest(test: Test) {
    clearTestState();
    setActiveTestId(test.id);
    setDynamicTest(test);
    routerNavigate('/quiz');
  }

  function requireAuth(action: () => void) {
    if (!user) {
      setPendingAction(() => action);
      setAuthModalOpen(true);
      return;
    }
    if (profileLoading) {
      action();
      return;
    }
    if (canStartTest(profile)) {
      action();
      return;
    }
    routerNavigate('/upgrade');
  }

  function guardedStartTest(id: string) {
    requireAuth(() => startTest(id));
  }

  function guardedStartDynamicTest(test: Test) {
    requireAuth(() => startDynamicTest(test));
  }

  useEffect(() => {
    if (user && pendingAction) {
      pendingAction();
      setPendingAction(null);
      setAuthModalOpen(false);
    }
  }, [user, pendingAction]);

  function finishTest(attempt: Attempt) {
    saveAttempt(attempt);
    setAttempts(getAttempts());
    setResult(attempt);
    routerNavigate('/results');
    if (user && profile && getAccessStatus(profile) === 'free-available') {
      void (async () => {
        await supabase.from('profiles').update({ free_test_used: true }).eq('id', user.id);
        await refreshProfile();
      })();
    }
  }

  function handleUpgrade() {
    if (!user?.email) {
      setAuthModalOpen(true);
      return;
    }
    const email = user.email;
    const userId = user.id;
    const amountKobo = Number(import.meta.env.VITE_APP_PRICE ?? '200000');

    startPaystackPayment({
      email,
      userId,
      amountKobo,
      onSuccess: () => {
        void (async () => {
          // Access is granted server-side by the Paystack webhook.
          // Poll the profile a few times until the webhook has updated it.
          let granted = false;
          for (let attempt = 0; attempt < 6; attempt++) {
            const p = await refreshProfile();
            if (p && isSubscriptionActive(p)) {
              granted = true;
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
          if (!granted) {
            window.alert(
              'Payment received. Your access will unlock shortly — please refresh the page in a moment.'
            );
          }
          routerNavigate('/');
        })();
      },
      onError: (message) => {
        window.alert('Payment could not be completed: ' + message);
      },
    });
  }

  function retakeTest() {
    if (activeTest) {
      clearTestState();
      routerNavigate('/quiz');
    }
  }

  function navigate(destination: NavView) {
    setRevisionSubject('');
    routerNavigate(NAV_TO_PATH[destination]);
  }

  function reviseSubject(subject: string) {
    setRevisionSubject(subject);
    routerNavigate('/revision');
  }

  function refreshBank() {
    setBank(getBank());
  }

  function clearHistory() {
    if (typeof window !== 'undefined' && window.confirm('Clear all progress history? This cannot be undone.')) {
      localStorage.removeItem('rsu_practice_scores');
      setAttempts(getAttempts());
    }
  }

  return (
    <div className="min-h-screen bg-school-radial text-school-navy">
      {view !== 'quiz' && (
        <Header
          tests={yearlyTests}
          dark={dark}
          currentView={view}
          onToggleDark={toggleDark}
          onNavigate={navigate}
          onStartExam={guardedStartTest}
        />
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Home
                  tests={yearlyTests}
                  attempts={attempts}
                  activeTestStateTestId={activeTestStateTestId}
                  onStart={guardedStartTest}
                  onViewProgress={() => routerNavigate('/progress')}
                  onViewRevision={() => routerNavigate('/revision')}
                />
              </motion.div>
            }
          />

          <Route
            path="/quiz"
            element={
              activeTest ? (
                <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Quiz test={activeTest} onFinish={finishTest} onCancel={() => routerNavigate('/')} />
                </motion.div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/results"
            element={
              result && activeTest ? (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Results
                    attempt={result}
                    test={activeTest}
                    onRetake={retakeTest}
                    onHome={() => routerNavigate('/')}
                    onProgress={() => routerNavigate('/progress')}
                    onReviseSubject={reviseSubject}
                  />
                </motion.div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/progress"
            element={
              <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Progress attempts={attempts} onBack={() => routerNavigate('/')} onClear={clearHistory} />
              </motion.div>
            }
          />

          <Route
            path="/revision"
            element={
              <motion.div key="revision" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Revision tests={yearlyTests} onBack={() => routerNavigate('/')} onStartTest={guardedStartTest} initialSubject={revisionSubject} />
              </motion.div>
            }
          />

          <Route
            path="/bank"
            element={
              <motion.div key="bank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <PracticeBank bank={bank} onBack={() => routerNavigate('/')} onStart={guardedStartDynamicTest} />
              </motion.div>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Leaderboard attempts={attempts} onBack={() => routerNavigate('/')} />
              </motion.div>
            }
          />

          <Route
            path="/admin"
            element={
              <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Admin onBack={() => routerNavigate('/')} onBankChanged={refreshBank} />
              </motion.div>
            }
          />

          <Route
            path="/upgrade"
            element={
              <motion.div key="upgrade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Upgrade
                  onBack={() => routerNavigate('/')}
                  onUpgrade={handleUpgrade}
                  priceLabel="₦2,000"
                />
              </motion.div>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {view !== 'quiz' && <Footer tests={yearlyTests} onNavigate={navigate} onStartTest={guardedStartTest} />}

      <AuthModal
        open={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAction(null);
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
