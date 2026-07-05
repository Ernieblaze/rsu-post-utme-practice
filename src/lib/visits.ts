import { supabase } from './supabaseClient';

/**
 * Lightweight, anonymous website-visit logging so the Owner Dashboard can show
 * live traffic (last hour / 12h / 24h) and where visitors came from. No
 * personal data — just a random per-browser visitor id, the page path, and the
 * entry source (utm_source, referral link, or referrer domain).
 */

const VISITOR_KEY = 'rsu_visitor_id';
const SESSION_SOURCE_KEY = 'rsu_visit_source';

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

/** Where this visit originally came from — computed once per browser session. */
function detectSource(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = params.get('utm_source');
    if (utm) return utm.trim().toLowerCase().slice(0, 40);
    const ref = document.referrer;
    if (!ref) return 'direct';
    const host = new URL(ref).hostname.replace(/^www\./, '');
    if (host.includes('rsu-post-utme-practice')) return 'direct'; // internal
    return host.slice(0, 60);
  } catch {
    return 'direct';
  }
}

function getSessionSource(): string {
  try {
    let s = sessionStorage.getItem(SESSION_SOURCE_KEY);
    if (s === null) {
      s = detectSource();
      sessionStorage.setItem(SESSION_SOURCE_KEY, s);
    }
    return s;
  } catch {
    return detectSource();
  }
}

let lastPath = '';

/** Fire-and-forget: record one page view. Deduped per path so re-renders don't double-count. */
export function logVisit(path: string): void {
  if (path === lastPath) return;
  lastPath = path;
  const visitor_id = getVisitorId();
  const source = getSessionSource();
  void supabase
    .from('site_visits')
    .insert({ visitor_id, path, source })
    .then(
      () => {},
      () => {}, // ignore failures — analytics must never break the app
    );
}
