import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { InAppBrowserBanner } from './components/InAppBrowserBanner';
import { WhatsAppButton } from './components/WhatsAppButton';
import { WelcomeModal } from './components/WelcomeModal';
import { UsernamePrompt } from './components/UsernamePrompt';
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
import { Paywall } from './components/Paywall';
import { Dashboard } from './components/Dashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { AdmitMeHQ } from './components/AdmitMeHQ';
import { NotFound } from './components/NotFound';
import { LoginHelp } from './components/LoginHelp';
import { LegalPage } from './components/LegalPage';
import { EmailConfirmed } from './components/EmailConfirmed';
import { UserGuide } from './components/UserGuide';
import { AiTutor } from './components/AiTutor';
import { AdmissionPredictor } from './components/AdmissionPredictor';
import { AdmitMeHub } from './components/AdmitMeHub';
import { JambPractice } from './components/JambPractice';
import { WaecSection } from './components/WaecSection';
import { UniportSection } from './components/UniportSection';
import { QuestionOfTheDay } from './components/QuestionOfTheDay';
import { StartLanding } from './components/StartLanding';
import { ResetPassword } from './components/ResetPassword';
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from './data/legalContent';
import { useAuth } from './context/AuthContext';
import { canStartTest, getAccessStatus, isSubscriptionActive, setPremiumLocally } from './lib/access';
import { supabase } from './lib/supabaseClient';
import { startPaystackPayment } from './lib/paystack';
import { captureReferralFromUrl } from './lib/referral';
import { logVisit } from './lib/visits';
import { trackTikTok } from './lib/tiktok';
import { recordStudyDay } from './lib/streak';
import { recordActivity } from './lib/presence';
import { getBank } from './lib/bankStorage';
import {
  getAttempts,
  getDarkMode,
  saveAttempt,
  setDarkMode,
  clearTestState,
} from './lib/storage';
import type { Attempt, Test } from './types';

type View = 'home' | 'quiz' | 'results' | 'progress' | 'revision' | 'bank' | 'exam-focus' | 'admin' | 'leaderboard' | 'upgrade' | 'dashboard' | 'owner' | 'hq' | 'privacy' | 'terms' | 'email-confirmed' | 'reset-password' | 'guide' | 'login-help' | 'ai-tutor' | 'predictor' | 'admitme' | 'jamb' | 'waec' | 'uniport' | 'daily' | 'start';
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
  '/hq': 'hq',
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/guide': 'guide',
  '/login-help': 'login-help',
  '/ai-tutor': 'ai-tutor',
  '/predictor': 'predictor',
  '/admitme': 'admitme',
  '/jamb': 'jamb',
  '/waec': 'waec',
  '/uniport': 'uniport',
  '/daily': 'daily',
  '/start': 'start',
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

/** Human-readable "what they're doing" for the live activity feed. */
const ACTION_FOR_VIEW: Partial<Record<View, string>> = {
  home: 'Browsing home',
  quiz: 'Taking a test',
  results: 'Reviewing results',
  'exam-focus': 'In Exam Focus',
  bank: 'Building practice',
  revision: 'Revision',
  predictor: 'Aggregate checker',
  jamb: 'JAMB prep',
  waec: 'WAEC section',
  uniport: 'UniPort section',
  admitme: 'On AdmitMe',
  daily: 'Question of the Day',
  progress: 'Viewing progress',
  dashboard: 'On dashboard',
  leaderboard: 'Leaderboard',
  'ai-tutor': 'AI Tutor',
};

function AppContent() {
  const { user, loading: authLoading, profile, profileLoading, refreshProfile } = useAuth();
  const location = useLocation();
  const routerNavigate = useNavigate();

  const view: View = PATH_TO_VIEW[location.pathname] ?? 'home';

  // True while we still don't know the user's real access. On a hard refresh,
  // auth resolves a moment BEFORE the profile finishes loading — without this,
  // guarded routes (owner/admin/revision) briefly see "no profile" and wrongly
  // redirect home. Waiting for the profile keeps you on the page you refreshed.
  const gateLoading = authLoading || profileLoading || (!!user && !profile);

  const [dynamicTest, setDynamicTest] = useState<Test | null>(null);
  const [result, setResult] = useState<Attempt | null>(null);
  const [dark, setDark] = useState(getDarkMode);
  const [attempts, setAttempts] = useState<Attempt[]>(() => getAttempts());
  const [revisionSubject, setRevisionSubject] = useState<string>('');
  const [bank, setBank] = useState(() => getBank());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [paywallPending, setPaywallPending] = useState(false);
  const [paywallLoading, setPaywallLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    captureReferralFromUrl();
  }, []);

  // Log each page view for the dashboard's traffic stats (anonymous, best-effort).
  useEffect(() => {
    logVisit(location.pathname);
  }, [location.pathname]);

  // Live presence — record what the signed-in user is doing (on view change + every 45s).
  useEffect(() => {
    if (!user) return;
    const action = ACTION_FOR_VIEW[view] ?? 'Using the app';
    const email = user.email ?? null;
    const username = profile?.username ?? null;
    recordActivity(user.id, email, username, action);
    const id = setInterval(() => recordActivity(user.id, email, username, action), 45000);
    return () => clearInterval(id);
  }, [user, view, profile?.username]);

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
      hq: `AdmitMe HQ`,
      privacy: `Privacy Policy | ${base}`,
      terms: `Terms of Service | ${base}`,
      guide: `How to Use | ${base}`,
      'login-help': `Login Help | ${base}`,
      'ai-tutor': `AI Study Helper | ${base}`,
      predictor: `Admission Predictor | ${base}`,
      admitme: `AdmitMe — WAEC · JAMB · Post-UTME`,
      jamb: `JAMB (UTME) Practice | AdmitMe`,
      waec: `WAEC (SSCE) | AdmitMe`,
      uniport: `UniPort Post-UTME | AdmitMe`,
      daily: `Question of the Day | ${base}`,
      start: `Start Practicing | ${base}`,
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
    recordStudyDay(); // keep the daily practice streak alive
    setAttempts(getAttempts());
    setResult(attempt);

    const status = getAccessStatus(profile);
    const isPremium = status === 'admin' || status === 'paid';

    // Consume free trial regardless of whether they pay for results
    if (user && profile && status === 'free-available') {
      void (async () => {
        try {
          await supabase.from('profiles').update({ free_test_used: true }).eq('id', user.id);
          await refreshProfile();
        } catch {
          /* network hiccup — trial state will reconcile on next profile load */
        }
      })();
    }

    // Best-effort server-side attempt log
    if (user) {
      void (async () => {
        try {
          await supabase.from('attempts').insert({
            user_id: user.id,
            test_id: attempt.testId,
            test_title: attempt.testTitle,
            score: attempt.score,
            total: attempt.total,
            percentage: attempt.percentage,
            time_spent_seconds: attempt.timeSpentSeconds,
          });
        } catch {
          /* logging is best-effort; ignore failures */
        }
      })();
    }

    if (isPremium) {
      routerNavigate('/results');
    } else {
      setPaywallPending(true);
      routerNavigate('/results');
    }
  }

  function handleUpgrade(afterPayDestination?: string) {
    if (!user?.email) {
      setAuthModalOpen(true);
      return;
    }
    const email = user.email;
    const userId = user.id;
    const amountKobo = Number(import.meta.env.VITE_APP_PRICE ?? '200000');
    // Capture destination at call-time so the closure is stable
    const cameFromPaywall = paywallPending;
    const destination = afterPayDestination
      ?? (cameFromPaywall && result ? '/results' : '/');

    setPaywallLoading(true);
    startPaystackPayment({
      email,
      userId,
      amountKobo,
      onSuccess: () => {
        // TikTok conversion: a student paid for Premium.
        trackTikTok('CompletePayment', { value: amountKobo / 100, currency: 'NGN' });
        // Grant access IMMEDIATELY via localStorage — fires the moment
        // Paystack confirms payment, no webhook delay needed. Scoped to this
        // user so it can never unlock premium for anyone else on the device.
        setPremiumLocally(userId);
        setPaywallLoading(false);
        setPaywallPending(false);
        routerNavigate(destination);
        // Refresh Supabase profile in background so server-side eventually catches up.
        void refreshProfile();
      },
      onError: (message) => {
        setPaywallLoading(false);
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
      <InAppBrowserBanner />
      {view !== 'quiz' && view !== 'start' && view !== 'admitme' && view !== 'jamb' && view !== 'waec' && view !== 'uniport' && <WelcomeModal />}
      {view !== 'quiz' && view !== 'start' && <UsernamePrompt />}
      {view !== 'quiz' && view !== 'start' && view !== 'admitme' && view !== 'jamb' && view !== 'waec' && view !== 'uniport' && (
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
                  onReviseSubject={reviseSubject}
                />
              </motion.div>
            }
          />

          <Route
            path="/quiz"
            element={
              activeTest ? (
                <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Quiz
                    test={activeTest}
                    onFinish={finishTest}
                    onCancel={() => routerNavigate('/')}
                    isPremium={(() => { const s = getAccessStatus(profile); return s === 'admin' || s === 'paid'; })()}
                    userId={user?.id ?? ''}
                    onUpgrade={() => handleUpgrade('/quiz')}
                    paywallLoading={paywallLoading}
                    priceLabel="₦2,000"
                  />
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
                  {paywallPending ? (
                    <Paywall
                      variant="post-test"
                      priceLabel="₦2,000"
                      loading={paywallLoading}
                      onUpgrade={handleUpgrade}
                      onHome={() => {
                        setPaywallPending(false);
                        routerNavigate('/');
                      }}
                    />
                  ) : (
                    <Results
                      attempt={result}
                      test={activeTest}
                      onRetake={retakeTest}
                      onHome={() => routerNavigate('/')}
                      onProgress={() => routerNavigate('/progress')}
                      onReviseSubject={reviseSubject}
                    />
                  )}
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
                {gateLoading ? null : (
                  (() => {
                    const status = getAccessStatus(profile);
                    return status === 'admin' || status === 'paid' ? (
                      <Revision bank={bank} onBack={() => routerNavigate('/')} initialSubject={revisionSubject} onStart={guardedStartDynamicTest} />
                    ) : (
                      <Paywall
                        variant="revision"
                        priceLabel="₦2,000"
                        loading={paywallLoading}
                        onUpgrade={() => handleUpgrade('/revision')}
                        onHome={() => routerNavigate('/')}
                      />
                    );
                  })()
                )}
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
                <ExamFocus bank={bank} onStart={guardedStartDynamicTest} userId={user?.id ?? ''} />
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
              gateLoading ? null : profile?.is_admin ? (
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
                    loading={paywallLoading}
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
              gateLoading ? null : profile?.is_admin ? (
                <motion.div key="owner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <OwnerDashboard onBack={() => routerNavigate('/hq')} />
                </motion.div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/hq"
            element={
              gateLoading ? null : profile?.is_admin ? (
                <motion.div key="hq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <AdmitMeHQ onBack={() => routerNavigate('/')} />
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
                <AiTutor profile={profile} onUpgrade={() => handleUpgrade('/ai-tutor')} />
              </motion.div>
            }
          />

          <Route
            path="/predictor"
            element={
              <motion.div key="predictor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <AdmissionPredictor profile={profile} onUpgrade={() => handleUpgrade('/predictor')} />
              </motion.div>
            }
          />

          <Route
            path="/admitme"
            element={
              <motion.div key="admitme" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <AdmitMeHub onLogin={() => setAuthModalOpen(true)} />
              </motion.div>
            }
          />

          <Route
            path="/jamb"
            element={
              <motion.div key="jamb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <JambPractice bank={bank} onStart={guardedStartDynamicTest} onLogin={() => setAuthModalOpen(true)} />
              </motion.div>
            }
          />

          <Route
            path="/waec"
            element={
              <motion.div key="waec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <WaecSection onLogin={() => setAuthModalOpen(true)} />
              </motion.div>
            }
          />

          <Route
            path="/uniport"
            element={
              <motion.div key="uniport" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <UniportSection onLogin={() => setAuthModalOpen(true)} />
              </motion.div>
            }
          />

          <Route
            path="/daily"
            element={
              <motion.div key="daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <QuestionOfTheDay bank={bank} onRequireAuth={() => setAuthModalOpen(true)} />
              </motion.div>
            }
          />

          <Route
            path="/start"
            element={
              <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <StartLanding
                  onGetStarted={() => {
                    if (user) routerNavigate('/exam-focus');
                    else setAuthModalOpen(true);
                  }}
                />
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

          <Route
            path="/login-help"
            element={
              <motion.div key="login-help" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <LoginHelp />
              </motion.div>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {view !== 'quiz' && view !== 'start' && view !== 'admitme' && view !== 'jamb' && view !== 'waec' && view !== 'uniport' && <Footer onNavigate={navigate} />}
      {view !== 'quiz' && view !== 'start' && view !== 'admitme' && view !== 'jamb' && view !== 'waec' && view !== 'uniport' && <WhatsAppButton />}

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
