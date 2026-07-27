/**
 * AdmitMe — the parent company/brand.
 *
 * AdmitMe is the umbrella that powers exam-prep for WAEC, JAMB and Post-UTME
 * (multiple schools). This deployment currently serves ONE exam profile (RSU
 * Post-UTME), but everything is organised here so new sections plug in later
 * without touching the app's logic. This is the foundation for the unified
 * platform (and a future mobile app).
 */

export const COMPANY = {
  name: 'AdmitMe',
  tagline: 'Pass WAEC, JAMB & Post-UTME with confidence',
  shortPitch: 'Prepare for your WAEC, JAMB and Post-UTME — all in one place.',
  supportEmail: 'rsupostutmepractice@gmail.com',
} as const;

/** AdmitMe's own brand palette — indigo/violet, distinct from every section. */
export const BRAND = {
  primary: '#4f46e5', // indigo-600
  secondary: '#7c3aed', // violet-600
  deep: '#312e81', // indigo-900
  soft: '#eef2ff', // indigo-50
} as const;

export type ExamCategory = 'post-utme' | 'jamb' | 'waec';
export type ExamStatus = 'live' | 'coming-soon';

export interface ExamOffering {
  id: string;
  category: ExamCategory;
  /** Short label shown to students, e.g. "RSU Post-UTME". */
  name: string;
  /** Full school name, for Post-UTME offerings. */
  school?: string;
  /** Where the school is, shown on the picker card (Post-UTME). */
  location?: string;
  /** One-line description shown on the picker/section card. */
  blurb?: string;
  status: ExamStatus;
  /** Where a live offering sends the student ("/" is the RSU home). */
  path?: string;
  /** The section's own brand colour (hex) so it feels "at home". */
  accent: string;
}

/**
 * Everything AdmitMe offers (or will). `live` = ready now; `coming-soon` = a
 * placeholder slot a future section drops into (just flip to `live` + add data).
 * Adding a new Post-UTME school is now purely a matter of adding a row here.
 */
export const EXAMS: ExamOffering[] = [
  // ── Post-UTME (per school) ──
  { id: 'rsu-post-utme', category: 'post-utme', name: 'RSU Post-UTME', school: 'Rivers State University', location: 'Port Harcourt', blurb: 'Real past questions in RSU’s exact 50-question screening format.', status: 'live', path: '/', accent: '#046a38' }, // forest green
  { id: 'uniport-post-utme', category: 'post-utme', name: 'UniPort Post-UTME', school: 'University of Port Harcourt', location: 'Port Harcourt', blurb: 'Prep tuned to UniPort’s screening — coming soon.', status: 'coming-soon', accent: '#1b3f70', path: '/uniport' }, // UniPort deep navy blue
  { id: 'iaue-post-utme', category: 'post-utme', name: 'IAUE Post-UTME', school: 'Ignatius Ajuru University of Education', location: 'Port Harcourt', blurb: 'Ignatius Ajuru University of Education screening — coming soon.', status: 'coming-soon', accent: '#6b21a8' }, // education purple (no page yet → Notify me)
  // ── National exams ──
  { id: 'jamb', category: 'jamb', name: 'JAMB (UTME)', location: 'Nationwide', blurb: 'Your subject combination, UTME-style CBT mocks.', status: 'live', path: '/jamb', accent: '#10b981' }, // fresh emerald green
  { id: 'waec', category: 'waec', name: 'WAEC (SSCE)', location: 'Nationwide', blurb: 'Science & Arts tracks by subject — coming soon.', status: 'coming-soon', accent: '#1b1b6b', path: '/waec' }, // WAEC deep navy (with gold)
];

/** The exam this deployment currently serves (its face for ads/SEO). */
export const ACTIVE_EXAM_ID = 'rsu-post-utme';

export const activeExam = (): ExamOffering =>
  EXAMS.find((e) => e.id === ACTIVE_EXAM_ID) ?? EXAMS[0];

export const comingSoonExams = (): ExamOffering[] =>
  EXAMS.filter((e) => e.status === 'coming-soon');

/** All offerings in a category (e.g. every Post-UTME school), live ones first. */
export const examsByCategory = (category: ExamCategory): ExamOffering[] =>
  EXAMS.filter((e) => e.category === category).sort(
    (a, b) => (a.status === 'live' ? 0 : 1) - (b.status === 'live' ? 0 : 1)
  );

/** Every Post-UTME school offering — powers the "pick your school" picker. */
export const postUtmeSchools = (): ExamOffering[] => examsByCategory('post-utme');
