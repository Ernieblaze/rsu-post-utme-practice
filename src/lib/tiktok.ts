/**
 * Fires TikTok Pixel conversion events from our own code — more reliable than
 * TikTok's Event Builder (which struggles with single-page-app modals). The
 * base pixel is loaded in index.html; `window.ttq` is the global it creates.
 *
 * Events used:
 *  - CompleteRegistration  → a student signs up (optimize ads toward this)
 *  - CompletePayment       → a student pays for Premium
 */

interface Ttq {
  track: (event: string, params?: Record<string, unknown>) => void;
  page: () => void;
}

declare global {
  interface Window {
    ttq?: Ttq;
  }
}

export function trackTikTok(event: string, params?: Record<string, unknown>): void {
  try {
    window.ttq?.track(event, params);
  } catch {
    /* analytics must never break the app */
  }
}
