import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EmailConfirmedProps {
  onContinue: () => void;
}

export function EmailConfirmed({ onContinue }: EmailConfirmedProps) {
  const { user, loading } = useAuth();
  const alreadySignedIn = !loading && !!user;

  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-school-green/15 text-school-green">
        <CheckCircle2 size={32} />
      </div>
      <h1 className="font-sora text-2xl font-bold text-school-navy dark:text-white">Email verified!</h1>
      <p className="mt-2 text-school-muted">
        {alreadySignedIn
          ? "Your email address has been confirmed and you're signed in. You can start practicing now."
          : 'Your email address has been confirmed. You can now log in and start practicing.'}
      </p>
      <button
        onClick={onContinue}
        className="mt-6 rounded-xl bg-school-green px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-school-green/90"
      >
        {alreadySignedIn ? 'Start practicing' : 'Go to log in'}
      </button>
    </main>
  );
}
