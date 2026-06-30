import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { Home } from './components/Home';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { Progress } from './components/Progress';
import { Revision } from './components/Revision';
import { PracticeBank } from './components/PracticeBank';
import { ExamFocus } from './components/ExamFocus';
import { Admin } from './components/Admin';
import { Leaderboard } from './components/Leaderboard';
import { ToastProvider } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { Upgrade } from './components/Upgrade';
import { Dashboard } from './components/Dashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { LegalPage } from './components/LegalPage';
import { EmailConfirmed } from './components/EmailConfirmed';
import { UserGuide } from './components/UserGuide';
import { AiTutor } from './components/AiTutor';
import { ResetPassword } from './components/ResetPassword';
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from './data/legalContent';
import { useAuth } from './context/AuthContext';
import { canStartTest, getAccessStatus, isSubscriptionActive } from './lib/access';
import { supabase } from './lib/supabaseClient';
import { startPaystackPayment } from './lib/paystack';
import { captureReferralFromUrl } from './lib/referral';
import { getBank } from './lib/bankStorage';
import {
  getAttempts,
  getDarkMode,
  saveAttempt,
  setDarkMode,
  clearTestState,
} from './lib/storage';
import type { Attempt, Test } from './types';

type View = 'home' | 'quiz' | 'results' | 'progress' | 'revision' | 'bank' | 'exam-focus' | 'admin' | 'leaderboard' | 'upgrade' | 'dashboard' | 'owner' | 'privacy' | 'terms' | 'email-confirmed' | 'reset-password' | 'guide' | 'ai-tutor';
export type NavView = 'home' | 'progress' | 'revision' | 'bank' | 'exam-focus' | 'ai-tutor' | 'admin' | 'leaderboard';

const PATH_TO_VIEW: Record<string, View> = {
  '/': 'home',
  '/quiz': 'quiz',
  '/results': 'results',
  '/progress': 'progress',
  '/revision': 'revision',
  '/bank': 'bank',
  '/exam-focus': 'exam-focus',
  '/admin': 'admin',
  '/leaderboard': 'leaderboard',
  '/upgrade': 'upgrade',
  '/dashboard': 'dashboard',
  '/owner': 'owner',
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/guide': 'guide',
  '/ai-tutor': 'ai-tutor',
  '/email-confirmed': 'email-confirmed',
  '/reset-password': 'reset-password',
};

const NAV_TO_PATH: Record<NavView, string> = {
  home: '/',
  progress: '/progress',
  revision: '/revision',
  bank: '/bank',
  'exam-focus': '/exam-focus',
  'ai-tutor': '/ai-tutor',
  admin: '/admin',
  leaderboard: '/leaderboard',
};

function AppContent() {
  const { user, loading: authLoading, profile, profileLoading, refreshProfile } = useAuth();
  const location = useLocation();
  const routerNavigate = useNavigate();

  const view: View = PATH_TO_VIEW[location.pathname] ?? 'home';

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
    captureReferralFromUrl();
  }, []);

  useEffect(() => {
    const base = 'RSU Post-UTME Practice';
    const titles: Record<View, string> = {
      home: base,
      quiz: `Timed Test | ${base}`,
      results: `Results | ${base}`,
      progress: `Progress | ${base}`,
      revision: `Revision | ${base}`,
      bank: `Practice | ${base}`,
      'exam-focus': `Exam Focus | ${base}`,
      admin: `Question Manager | ${base}`,
      leaderboard: `Leaderboard | ${base}`,
      upgrade: `Upgrade | ${base}`,
      dashboard: `Dashboard | ${base}`,
      owner: `Owner Dashboard | ${base}`,
      privacy: `Privacy Policy | ${base}`,
      terms: `Terms of Service | ${base}`,
      guide: `How to Use | ${base}`,
      'ai-tutor': `AI Study Helper | ${base}`,
      'email-confirmed': `Email Verified | ${base}`,
      'reset-password': `Reset Password | ${base}`,
    };
    document.title = titles[view];
  }, [view]);

  const activeTest = dynamicTest;

  function toggleDark() {
    const next = !dark;
    setDark(next);
    setDarkMode(next);
  }

  function startDynamicTest(test: Test) {
    clearTestState();
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
    if (user) {
      // Best-effort: log this attempt server-side for site-wide usage analytics.
      // Quiz history itself still lives in localStorage — this is purely additive.
      void (async () => {
        await supabase.from('attempts').insert({
          user_id: user.id,
          test_id: attempt.testId,
          test_title: attempt.testTitle,
          score: attempt.score,
          total: attempt.total,
          percentage: attempt.percentage,
          time_spent_seconds: attempt.timeSpentSeconds,
        });
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
      <ScrollToTop />
      {view !== 'quiz' && (
        <Header
          dark={dark}
          currentView={view}
          onToggleDark={toggleDark}
          onNavigate={navigate}
        />
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Home
                  attempts={attempts}
                  onViewProgress={() => routerNavigate('/progress')}
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
                <Revision bank={bank} onBack={() => routerNavigate('/')} initialSubject={revisionSubject} />
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
            path="/exam-focus"
            element={
              <motion.div key="exam-focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <ExamFocus bank={bank} onStart={guardedStartDynamicTest} />
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
              authLoading || profileLoading ? null : profile?.is_admin ? (
                <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Admin onBack={() => routerNavigate('/owner')} onBankChanged={refreshBank} />
                </motion.div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/upgrade"
            element={
              <motion.div key="upgrade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {profile && (profile.is_admin || isSubscriptionActive(profile)) ? (
                  <main className="mx-auto max-w-lg px-4 py-16 text-center">
                    <h1 className="font-sora text-2xl font-bold text-school-navy dark:text-white">
                      You already have full access
                    </h1>
                    <p className="mt-2 text-school-muted">
                      {profile.is_admin
                        ? 'Admin accounts already have unlimited access — no need to pay.'
                        : `Your access is active until ${new Date(profile.paid_until ?? '').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}. You can renew once it's closer to expiring.`}
                    </p>
                    <button
                      onClick={() => routerNavigate('/dashboard')}
                      className="mt-6 rounded-xl bg-school-green px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-school-green/90"
                    >
                      Go to Dashboard
                    </button>
                  </main>
                ) : (
                  <Upgrade
                    onBack={() => routerNavigate('/')}
                    onUpgrade={handleUpgrade}
                    priceLabel="₦2,000"
                  />
                )}
              </motion.div>
            }
          />

          <Route
            path="/dashboard"
            element={
              authLoading ? null : user ? (
                <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Dashboard onBack={() => routerNavigate('/')} onUpgrade={() => routerNavigate('/upgrade')} />
                </motion.div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/owner"
            element={
              authLoading || profileLoading ? null : profile?.is_admin ? (
                <motion.div key="owner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <OwnerDashboard onBack={() => routerNavigate('/')} />
                </motion.div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/privacy"
            element={
              <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <LegalPage {...PRIVACY_POLICY} />
              </motion.div>
            }
          />

          <Route
            path="/terms"
            element={
              <motion.div key="terms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <LegalPage {...TERMS_OF_SERVICE} />
              </motion.div>
            }
          />

          <Route
            path="/guide"
            element={
              <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <UserGuide />
              </motion.div>
            }
          />

          <Route
            path="/ai-tutor"
            element={
              <motion.div key="ai-tutor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <AiTutor profile={profile} />
              </motion.div>
            }
          />

          <Route
            path="/email-confirmed"
            element={
              <motion.div key="email-confirmed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <EmailConfirmed
                  onContinue={() => {
                    routerNavigate('/');
                    if (!user) setAuthModalOpen(true);
                  }}
                />
              </motion.div>
            }
          />

          <Route
            path="/reset-password"
            element={
              <motion.div key="reset-password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <ResetPassword onDone={() => routerNavigate('/dashboard')} />
              </motion.div>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {view !== 'quiz' && <Footer onNavigate={navigate} />}

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
