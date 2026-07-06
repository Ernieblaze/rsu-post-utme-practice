import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calculator, Target, Lock, Share2, CheckCircle2, MapPin, Sparkles,
  TrendingUp, GraduationCap, Info,
} from 'lucide-react';
import type { Profile } from '../lib/access';
import { getAccessStatus } from '../lib/access';
import {
  computeAggregate, evaluateAll, groupResults, JAMB_MAX, POSTUTME_MAX,
  type Likelihood, type CourseEvaluation, type GroupedResults,
} from '../lib/aggregate';
import type { Stream } from '../data/admissionCutoffs';

interface AdmissionPredictorProps {
  profile: Profile | null;
  onUpgrade: () => void;
}

type StreamChoice = Stream | 'all';

const STREAMS: { key: StreamChoice; label: string; emoji: string }[] = [
  { key: 'Science', label: 'Science', emoji: '🔬' },
  { key: 'Arts', label: 'Arts', emoji: '📚' },
  { key: 'Commercial', label: 'Commercial', emoji: '💼' },
  { key: 'all', label: 'Show all', emoji: '🎓' },
];

const LIKELIHOOD_STYLE: Record<Likelihood, string> = {
  High: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Moderate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Low: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Very low': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

function band(aggregate: number): { label: string; color: string } {
  if (aggregate >= 70) return { label: 'Excellent 🔥', color: 'text-emerald-600 dark:text-emerald-400' };
  if (aggregate >= 60) return { label: 'Very good 💪', color: 'text-emerald-600 dark:text-emerald-400' };
  if (aggregate >= 50) return { label: 'Good 👍', color: 'text-school-blue dark:text-sky-400' };
  if (aggregate >= 40) return { label: 'Fair', color: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Aim higher', color: 'text-rose-500' };
}

export function AdmissionPredictor({ profile, onUpgrade }: AdmissionPredictorProps) {
  const navigate = useNavigate();
  const status = getAccessStatus(profile);
  const unlocked = status === 'admin' || status === 'paid';

  const [jamb, setJamb] = useState('');
  const [postUtme, setPostUtme] = useState('');
  const [stream, setStream] = useState<StreamChoice>('Science');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ aggregate: number; groups: GroupedResults } | null>(null);
  const [copied, setCopied] = useState(false);

  function calculate() {
    setError('');
    const j = Number(jamb);
    const p = Number(postUtme);
    if (!jamb || !postUtme) return setError('Enter both your JAMB and Post-UTME scores.');
    if (Number.isNaN(j) || j < 0 || j > JAMB_MAX) return setError(`JAMB score must be between 0 and ${JAMB_MAX}.`);
    if (Number.isNaN(p) || p < 0 || p > POSTUTME_MAX) return setError(`Post-UTME score must be between 0 and ${POSTUTME_MAX}.`);
    const aggregate = computeAggregate(j, p);
    const evals = evaluateAll(aggregate, stream === 'all' ? [] : [stream]);
    setResult({ aggregate, groups: groupResults(evals) });
  }

  async function shareResult() {
    if (!result) return;
    const text = `My RSU Post-UTME aggregate is ${result.aggregate}/100 🎯 Check yours & see what course you can get: ${window.location.origin}`;
    try {
      if (navigator.share) await navigator.share({ title: 'My RSU Aggregate', text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      /* user cancelled share */
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-school-green/15 text-school-green">
          <Target size={24} />
        </div>
        <div>
          <h1 className="font-sora text-2xl font-bold text-school-navy dark:text-white">Admission Predictor 🎯</h1>
          <p className="text-sm text-school-navy/60 dark:text-slate-400">
            Enter your scores → see your aggregate and the courses you can get into RSU.
          </p>
        </div>
      </div>

      {/* Input card */}
      <div className="rounded-3xl border border-school-green/10 bg-white p-6 shadow-md dark:border-school-green/20 dark:bg-school-navy/40">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
              JAMB score (out of 400)
            </span>
            <input
              type="number" inputMode="numeric" value={jamb} min={0} max={JAMB_MAX}
              onChange={(e) => setJamb(e.target.value)}
              placeholder="e.g. 240"
              className="w-full rounded-xl border border-school-green/20 bg-school-light px-3 py-3 text-lg font-bold text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
              Post-UTME score (out of 50)
            </span>
            <input
              type="number" inputMode="numeric" value={postUtme} min={0} max={POSTUTME_MAX}
              onChange={(e) => setPostUtme(e.target.value)}
              placeholder="e.g. 40"
              className="w-full rounded-xl border border-school-green/20 bg-school-light px-3 py-3 text-lg font-bold text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
            />
          </label>
        </div>

        {/* Stream chips */}
        <div className="mt-4">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
            Your stream
          </span>
          <div className="flex flex-wrap gap-2">
            {STREAMS.map((s) => (
              <button
                key={s.key}
                onClick={() => setStream(s.key)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  stream === s.key
                    ? 'border-school-green bg-school-green text-white'
                    : 'border-school-green/20 bg-school-light text-school-navy hover:bg-school-pale dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200'
                }`}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-rose-500">{error}</p>}

        <button
          onClick={calculate}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-school-green px-6 py-3.5 text-lg font-bold text-white shadow-sm transition hover:bg-school-green/90"
        >
          <Calculator size={20} /> Calculate my aggregate
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-5">
            {/* Aggregate number */}
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-school-navy via-[#003a7a] to-school-green p-6 text-center text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-widest text-school-gold">Your aggregate score</p>
              <div className="my-1 font-sora text-6xl font-extrabold">{result.aggregate}<span className="text-2xl font-bold text-white/70">/100</span></div>
              <p className={`text-sm font-bold ${band(result.aggregate).color.replace('text-school-blue', 'text-sky-300')}`}>{band(result.aggregate).label}</p>
              <p className="mt-2 text-xs text-white/70">
                Formula: (JAMB ÷ 8) + Post-UTME = ({jamb} ÷ 8) + {postUtme}
              </p>
              <button
                onClick={shareResult}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/25"
              >
                <Share2 size={15} /> {copied ? 'Copied!' : 'Share my result'}
              </button>
            </div>

            {unlocked ? (
              <UnlockedResults groups={result.groups} />
            ) : (
              <LockedTeaser groups={result.groups} onUpgrade={onUpgrade} />
            )}

            <p className="flex items-start gap-2 rounded-xl bg-school-light px-4 py-3 text-xs text-school-navy/60 dark:bg-school-navy/60 dark:text-slate-400">
              <Info size={14} className="mt-0.5 flex-none" />
              These are estimates based on RSU's <strong>2025/2026</strong> cut-offs. Cut-offs change yearly — final admission is decided by Rivers State University.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/** Premium view: full grouped course breakdown. */
function UnlockedResults({ groups }: { groups: GroupedResults }) {
  const qualifyCount = groups.merit.length + groups.catchment.length;
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900/40 dark:bg-emerald-900/15">
        <p className="font-sora text-lg font-bold text-emerald-800 dark:text-emerald-300">
          🎉 You qualify for <span className="text-2xl">{qualifyCount}</span> course{qualifyCount === 1 ? '' : 's'} in your stream
        </p>
      </div>

      <ResultGroup
        title="✅ You qualify — Merit" subtitle="Your aggregate meets the full cut-off"
        icon={<CheckCircle2 size={18} className="text-emerald-600" />}
        items={groups.merit} accent="border-emerald-200 dark:border-emerald-900/40"
      />
      <ResultGroup
        title="📍 Qualify under Catchment" subtitle="You meet the lower catchment-area cut-off"
        icon={<MapPin size={18} className="text-school-blue" />}
        items={groups.catchment} accent="border-school-blue/20"
      />
      <ResultGroup
        title="🤏 Close calls — good backups" subtitle="Just below the cut-off — strong for change of course / supplementary"
        icon={<TrendingUp size={18} className="text-amber-600" />}
        items={groups.close} accent="border-amber-200 dark:border-amber-900/40"
      />

      {groups.merit.length === 0 && groups.catchment.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center dark:border-amber-900/40 dark:bg-amber-900/15">
          <p className="font-bold text-amber-800 dark:text-amber-300">No merit match in this stream yet</p>
          <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-400/80">
            Check the "Close calls" above for backup options, or try another stream — and keep practising to lift your Post-UTME score.
          </p>
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  title, subtitle, icon, items, accent,
}: { title: string; subtitle: string; icon: React.ReactNode; items: CourseEvaluation[]; accent: string }) {
  if (items.length === 0) return null;
  return (
    <div className={`rounded-2xl border ${accent} bg-white p-4 shadow-sm dark:bg-school-navy/40`}>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <div>
          <h3 className="font-sora text-base font-bold text-school-navy dark:text-white">{title}</h3>
          <p className="text-xs text-school-navy/60 dark:text-slate-400">{subtitle}</p>
        </div>
        <span className="ml-auto rounded-full bg-school-light px-2.5 py-0.5 text-xs font-bold text-school-navy dark:bg-school-navy/60 dark:text-slate-300">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((e) => (
          <div key={e.course.id} className="flex items-center justify-between gap-3 rounded-xl bg-school-light/60 px-3 py-2.5 dark:bg-school-navy/60">
            <div className="min-w-0">
              <p className="truncate font-semibold text-school-navy dark:text-white">{e.course.course}</p>
              <p className="text-xs text-school-navy/60 dark:text-slate-400">
                {e.course.faculty} · cut-off {e.course.merit}
                {e.margin != null && (
                  <span className={e.margin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                    {' '}· you {e.margin >= 0 ? `+${e.margin}` : e.margin}
                  </span>
                )}
              </p>
            </div>
            <span className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-bold ${LIKELIHOOD_STYLE[e.likelihood]}`}>
              {e.likelihood}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Free view: aggregate is shown above; the course breakdown is locked. */
function LockedTeaser({ groups, onUpgrade }: { groups: GroupedResults; onUpgrade: () => void }) {
  const qualifyCount = groups.merit.length + groups.catchment.length;
  return (
    <div className="relative overflow-hidden rounded-3xl border border-school-gold/30 bg-gradient-to-br from-school-navy to-school-green p-6 text-center text-white shadow-lg">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
        <Lock size={22} className="text-school-gold" />
      </div>
      <h3 className="font-sora text-xl font-bold">
        You qualify for <span className="text-school-gold">{qualifyCount}</span> course{qualifyCount === 1 ? '' : 's'} 👀
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-white/85">
        Unlock <strong>Premium</strong> to see <strong>exactly which courses</strong> you can get, your admission chances (High/Moderate/Low), catchment options, and the best backup courses for change of course.
      </p>
      <button
        onClick={onUpgrade}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-school-gold px-6 py-3 font-bold text-school-navy shadow-sm transition hover:opacity-90"
      >
        <Sparkles size={17} /> Unlock my course matches — ₦2,000
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/70">
        <GraduationCap size={13} /> One payment · full access until your exam
      </p>
    </div>
  );
}
