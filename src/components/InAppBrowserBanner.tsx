import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { isInAppBrowser } from '../lib/browser';

/**
 * Shown only when the site is opened inside an in-app browser (Facebook,
 * Instagram, WhatsApp, etc.), where login and Paystack payment often fail.
 * Tells the student to reopen in Chrome. Dismissible for the session.
 */
export function InAppBrowserBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [inApp] = useState(() => isInAppBrowser());

  if (!inApp || dismissed) return null;

  return (
    <div className="relative z-[60] bg-amber-500 px-4 py-2.5 text-center text-sm text-school-navy">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 pr-6">
        <ExternalLink size={15} className="flex-none" />
        <span className="font-semibold">
          For login &amp; payment to work, tap the <strong>⋮</strong> (or share) menu and choose{' '}
          <strong>“Open in Chrome / Browser.”</strong>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-school-navy/70 hover:bg-black/10"
      >
        <X size={16} />
      </button>
    </div>
  );
}
