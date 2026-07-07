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
  status: ExamStatus;
  /** Where a live offering sends the student ("/" is the RSU home). */
  path?: string;
  /** The section's own brand colour (hex) so it feels "at home". */
  accent: string;
}

/**
 * Everything AdmitMe offers (or will). `live` = ready now; `coming-soon` = a
 * placeholder slot a future section drops into (just flip to `live` + add data).
 */
export const EXAMS: ExamOffering[] = [
  { id: 'rsu-post-utme', category: 'post-utme', name: 'RSU Post-UTME', school: 'Rivers State University', status: 'live', path: '/', accent: '#046a38' }, // forest green
  { id: 'uniport-post-utme', category: 'post-utme', name: 'UniPort Post-UTME', school: 'University of Port Harcourt', status: 'coming-soon', accent: '#1d4ed8', path: '/uniport' }, // blue
  { id: 'jamb', category: 'jamb', name: 'JAMB (UTME)', status: 'live', path: '/jamb', accent: '#10b981' }, // fresh emerald green
  { id: 'waec', category: 'waec', name: 'WAEC (SSCE)', status: 'coming-soon', accent: '#1b1b6b', path: '/waec' }, // WAEC deep navy (with gold)
];

/** The exam this deployment currently serves (its face for ads/SEO). */
export const ACTIVE_EXAM_ID = 'rsu-post-utme';

export const activeExam = (): ExamOffering =>
  EXAMS.find((e) => e.id === ACTIVE_EXAM_ID) ?? EXAMS[0];

export const comingSoonExams = (): ExamOffering[] =>
  EXAMS.filter((e) => e.status === 'coming-soon');
