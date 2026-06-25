import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import { useAuth } from './context/AuthContext';
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

type View = 'home' | 'quiz' | 'results' | 'progress' | 'revision' | 'bank' | 'admin' | 'leaderboard';
export type NavView = 'home' | 'progress' | 'revision' | 'bank' | 'admin' | 'leaderboard';

function AppContent() {
  const { user } = useAuth();
  const [view, setView] = useState<View>('home');
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
    setView('quiz');
  }

  function startDynamicTest(test: Test) {
    clearTestState();
    setActiveTestId(test.id);
    setDynamicTest(test);
    setView('quiz');
  }

  function requireAuth(action: () => void) {
    if (user) {
      action();
      return;
    }
    setPendingAction(() => action);
    setAuthModalOpen(true);
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
    setView('results');
  }

  function retakeTest() {
    if (activeTest) {
      clearTestState();
      setView('quiz');
    }
  }

  function navigate(destination: NavView) {
    setRevisionSubject('');
    setView(destination);
  }

  function reviseSubject(subject: string) {
    setRevisionSubject(subject);
    setView('revision');
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
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Home
              tests={yearlyTests}
              attempts={attempts}
              activeTestStateTestId={activeTestStateTestId}
              onStart={guardedStartTest}
              onViewProgress={() => setView('progress')}
              onViewRevision={() => setView('revision')}
            />
          </motion.div>
        )}

        {view === 'quiz' && activeTest && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Quiz test={activeTest} onFinish={finishTest} onCancel={() => setView('home')} />
          </motion.div>
        )}

        {view === 'results' && result && activeTest && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Results
              attempt={result}
              test={activeTest}
              onRetake={retakeTest}
              onHome={() => setView('home')}
              onProgress={() => setView('progress')}
              onReviseSubject={reviseSubject}
            />
          </motion.div>
        )}

        {view === 'progress' && (
          <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Progress attempts={attempts} onBack={() => setView('home')} onClear={clearHistory} />
          </motion.div>
        )}

        {view === 'revision' && (
          <motion.div key="revision" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Revision tests={yearlyTests} onBack={() => setView('home')} onStartTest={guardedStartTest} initialSubject={revisionSubject} />
          </motion.div>
        )}

        {view === 'bank' && (
          <motion.div key="bank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <PracticeBank bank={bank} onBack={() => setView('home')} onStart={guardedStartDynamicTest} />
          </motion.div>
        )}

        {view === 'leaderboard' && (
          <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Leaderboard attempts={attempts} onBack={() => setView('home')} />
          </motion.div>
        )}

        {view === 'admin' && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Admin onBack={() => setView('home')} onBankChanged={refreshBank} />
          </motion.div>
        )}
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
