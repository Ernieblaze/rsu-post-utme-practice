import { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { isInAppBrowser } from '../lib/browser';

/**
 * Prominent, unmissable prompt shown when the page is opened inside an in-app
 * browser (TikTok, Facebook, Instagram, etc.). Those sandboxed browsers block
 * the auth network requests, so sign-up fails with "Failed to fetch". The only
 * real fix is getting the student into Chrome/Safari — so we give them a
 * one-tap "Copy link" button plus clear instructions. Rendered at the very top
 * of the /start ad landing page, where most paid TikTok traffic lands.
 */
export function InAppBrowserNotice() {
  const [inApp] = useState(() => isInAppBrowser());
  const [copied, setCopied] = useState(false);

  if (!inApp) return null;

  const url =
    typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Some in-app browsers block the clipboard API — fall back to a manual copy prompt.
      window.prompt('Copy this link, then open it in Chrome:', url);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-left shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-amber-400 text-school-navy">
          <ExternalLink size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-sora text-base font-extrabold text-school-navy">
            ⚠️ Open in Chrome to sign up
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-school-navy/80">
            You're viewing inside the TikTok app, where creating an account won't work. Copy the link
            and paste it into <strong>Chrome</strong> (or Safari) to sign up — it takes 5 seconds.
          </p>
          <button
            onClick={copyLink}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-school-navy px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-school-navy/90"
          >
            {copied ? (
              <>
                <Check size={17} /> Copied! Now paste in Chrome
              </>
            ) : (
              <>
                <Copy size={17} /> Copy link
              </>
            )}
          </button>
          <p className="mt-3 text-xs font-semibold text-school-navy/70">
            Or tap the <strong>⋮</strong> / <strong>share</strong> icon at the top of this screen and
            choose <strong>“Open in browser.”</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
