import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

/**
 * Keep every device on the latest build. The app is a PWA, so an old service
 * worker can otherwise keep serving a returning student a stale cached bundle —
 * including an out-of-date question bank (e.g. a phone that cached an early
 * build where a subject was missing). `registerType: 'autoUpdate'` activates
 * the new worker via skipWaiting/clientsClaim; here we reload the page the
 * moment that new worker takes control, so the fresh assets are actually used.
 *
 * Guarded on an existing controller so this only fires for RETURNING visitors
 * (an update), never on a first-ever install — avoiding a needless reload.
 */
if ('serviceWorker' in navigator) {
  if (navigator.serviceWorker.controller) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }
  navigator.serviceWorker.ready
    .then((reg) => {
      reg.update(); // check for a newer build on every load
      setInterval(() => reg.update(), 30 * 60 * 1000); // and every 30 min while open
    })
    .catch(() => {
      /* SW not ready yet — nothing to update */
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
        <Analytics />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
