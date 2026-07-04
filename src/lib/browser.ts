/**
 * Detects "in-app browsers" — the sandboxed mini-browsers that open when a
 * link is tapped inside Facebook, Instagram, WhatsApp, etc. These often block
 * the network requests our login and Paystack payment need, causing errors
 * like "Failed to fetch". We use this to nudge the user to open in Chrome.
 */
export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const markers = [
    'FBAN', 'FBAV', 'FB_IAB', // Facebook
    'Instagram',
    'Line/',
    'Twitter',
    'WhatsApp',
    'Snapchat',
    'TikTok', 'musical_ly', 'BytedanceWebview',
    '; wv', // generic Android WebView
  ];
  return markers.some((m) => ua.includes(m));
}
