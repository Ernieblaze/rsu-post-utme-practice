/**
 * RSU aggregate + admission-chance engine.
 *
 * Aggregate = (JAMB score ÷ 8) + Post-UTME score  → out of 100.
 * (JAMB 400 ÷ 8 = 50 max, Post-UTME 50 max, total 100.)
 *
 * Everything is an ESTIMATE against previously published cut-offs — RSU makes
 * the final decision. The UI always labels it as such.
 */
import { CUTOFFS, type CutoffCourse, type Stream } from '../data/admissionCutoffs';

export const JAMB_MAX = 400;
export const POSTUTME_MAX = 50;
/** How far below the merit cut-off still counts as "close / consider as supplementary". */
const CLOSE_MARGIN = 5;

export function computeAggregate(jamb: number, postUtme: number): number {
  const a = jamb / 8 + postUtme;
  return Math.round(a * 10) / 10; // 1 decimal place
}

export type Verdict = 'merit' | 'catchment' | 'close' | 'below';
export type Likelihood = 'High' | 'Moderate' | 'Low' | 'Very low';

export interface CourseEvaluation {
  course: CutoffCourse;
  verdict: Verdict;
  likelihood: Likelihood;
  margin: number | null; // aggregate − merit (null when no cut-off published)
}

function likelihoodFor(verdict: Verdict, margin: number | null, hasCutoff: boolean): Likelihood {
  if (!hasCutoff) return 'Moderate'; // no published cut-off → unknown, treat as moderate
  switch (verdict) {
    case 'merit':
      return (margin ?? 0) >= 5 ? 'High' : 'Moderate';
    case 'catchment':
      return 'Moderate';
    case 'close':
      return 'Low';
    default:
      return 'Very low';
  }
}

export function evaluateCourse(aggregate: number, c: CutoffCourse): CourseEvaluation {
  if (c.merit == null) {
    return { course: c, verdict: 'below', likelihood: 'Moderate', margin: null };
  }
  const margin = Math.round((aggregate - c.merit) * 10) / 10;
  let verdict: Verdict;
  if (aggregate >= c.merit) verdict = 'merit';
  else if (c.catchment != null && aggregate >= c.catchment) verdict = 'catchment';
  else if (aggregate >= c.merit - CLOSE_MARGIN) verdict = 'close';
  else verdict = 'below';
  return { course: c, verdict, likelihood: likelihoodFor(verdict, margin, true), margin };
}

/** All courses in the chosen stream(s), evaluated. Empty streams = every course. */
export function evaluateAll(aggregate: number, streams: Stream[]): CourseEvaluation[] {
  const inStream = (c: CutoffCourse) =>
    streams.length === 0 || c.streams.some((s) => streams.includes(s));
  return CUTOFFS.filter(inStream).map((c) => evaluateCourse(aggregate, c));
}

/** Grouped results for display: what you qualify for, catchment, close calls, and out of reach. */
export interface GroupedResults {
  merit: CourseEvaluation[];
  catchment: CourseEvaluation[];
  close: CourseEvaluation[];
  below: CourseEvaluation[];
  noCutoff: CourseEvaluation[];
}

export function groupResults(evaluations: CourseEvaluation[]): GroupedResults {
  const byMargin = (a: CourseEvaluation, b: CourseEvaluation) => (b.margin ?? 0) - (a.margin ?? 0);
  const withCutoff = evaluations.filter((e) => e.course.merit != null);
  const noCutoff = evaluations.filter((e) => e.course.merit == null);
  return {
    merit: withCutoff.filter((e) => e.verdict === 'merit').sort(byMargin),
    catchment: withCutoff.filter((e) => e.verdict === 'catchment').sort(byMargin),
    close: withCutoff.filter((e) => e.verdict === 'close').sort(byMargin),
    below: withCutoff.filter((e) => e.verdict === 'below').sort(byMargin),
    noCutoff,
  };
}
