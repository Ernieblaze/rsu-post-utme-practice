import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, Home } from 'lucide-react';
import { BRAND } from '../config/admitme';

/** Friendly branded 404 for genuinely unknown URLs (kept inside the app shell). */
export function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
        <Compass size={30} />
      </div>
      <h1 className="mt-5 font-sora text-6xl font-extrabold text-school-navy dark:text-white">404</h1>
      <p className="mt-2 text-lg font-bold text-school-navy dark:text-white">Page not found</p>
      <p className="mt-1 text-school-navy/60 dark:text-slate-400">
        The page you're looking for doesn't exist or has moved.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-school-green px-5 py-2.5 font-bold text-white shadow-sm hover:bg-school-green/90"
        >
          <Home size={16} /> Go home
        </button>
        <button
          onClick={() => navigate('/admitme')}
          className="inline-flex items-center gap-1.5 rounded-xl border border-school-green/30 px-5 py-2.5 font-bold text-school-navy hover:bg-school-light dark:text-slate-200 dark:hover:bg-school-navy/40"
        >
          Explore AdmitMe <ArrowRight size={15} />
        </button>
      </div>
    </main>
  );
}
