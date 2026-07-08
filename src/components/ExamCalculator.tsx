import { useRef, useState } from 'react';
import { Calculator as CalcIcon, X } from 'lucide-react';

/**
 * A compact, draggable on-screen calculator for the exam — like the real RSU
 * Post-UTME CBT. Tap the floating button to open; it expands into a small panel
 * you can drag out of the way, and close anytime — it never covers the whole
 * screen or blocks the questions. Click-only (no keyboard capture) so it can't
 * interfere with quiz navigation. Self-contained: drop <ExamCalculator/> anywhere.
 */
export function ExamCalculator() {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState(true);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  function fmt(n: number): string {
    if (!Number.isFinite(n)) return 'Error';
    return String(Math.round(n * 1e10) / 1e10);
  }
  function apply(a: number, o: string, b: number): number {
    switch (o) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }
  function digit(d: string) {
    setDisplay((cur) => (overwrite ? d : cur === '0' ? d : cur + d));
    setOverwrite(false);
  }
  function dot() {
    if (overwrite) { setDisplay('0.'); setOverwrite(false); return; }
    setDisplay((cur) => (cur.includes('.') ? cur : cur + '.'));
  }
  function clearAll() { setDisplay('0'); setPrev(null); setOp(null); setOverwrite(true); }
  function back() {
    setDisplay((cur) => (cur.length <= 1 || (cur.length === 2 && cur.startsWith('-')) ? '0' : cur.slice(0, -1)));
  }
  function sign() { setDisplay((cur) => (cur === '0' || cur === 'Error' ? cur : cur.startsWith('-') ? cur.slice(1) : '-' + cur)); }
  function pct() { setDisplay((cur) => fmt(parseFloat(cur) / 100)); setOverwrite(true); }
  function chooseOp(next: string) {
    const val = parseFloat(display);
    if (prev !== null && op && !overwrite) {
      const res = apply(prev, op, val);
      setDisplay(fmt(res));
      setPrev(Number.isFinite(res) ? res : null);
    } else {
      setPrev(Number.isNaN(val) ? null : val);
    }
    setOp(next);
    setOverwrite(true);
  }
  function equals() {
    if (op !== null && prev !== null) {
      const res = apply(prev, op, parseFloat(display));
      setDisplay(fmt(res));
      setPrev(null);
      setOp(null);
      setOverwrite(true);
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }
  function onMove(e: PointerEvent) {
    if (!drag.current) return;
    const w = panelRef.current?.offsetWidth ?? 240;
    const h = panelRef.current?.offsetHeight ?? 340;
    const x = Math.min(Math.max(4, e.clientX - drag.current.dx), window.innerWidth - w - 4);
    const y = Math.min(Math.max(4, e.clientY - drag.current.dy), window.innerHeight - h - 4);
    setPos({ x, y });
  }
  function onUp() {
    drag.current = null;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  }

  const KEYS: { label: string; run: () => void; kind: 'num' | 'op' | 'fn' | 'eq' }[] = [
    { label: 'C', run: clearAll, kind: 'fn' }, { label: '⌫', run: back, kind: 'fn' }, { label: '%', run: pct, kind: 'fn' }, { label: '÷', run: () => chooseOp('÷'), kind: 'op' },
    { label: '7', run: () => digit('7'), kind: 'num' }, { label: '8', run: () => digit('8'), kind: 'num' }, { label: '9', run: () => digit('9'), kind: 'num' }, { label: '×', run: () => chooseOp('×'), kind: 'op' },
    { label: '4', run: () => digit('4'), kind: 'num' }, { label: '5', run: () => digit('5'), kind: 'num' }, { label: '6', run: () => digit('6'), kind: 'num' }, { label: '−', run: () => chooseOp('−'), kind: 'op' },
    { label: '1', run: () => digit('1'), kind: 'num' }, { label: '2', run: () => digit('2'), kind: 'num' }, { label: '3', run: () => digit('3'), kind: 'num' }, { label: '+', run: () => chooseOp('+'), kind: 'op' },
    { label: '±', run: sign, kind: 'fn' }, { label: '0', run: () => digit('0'), kind: 'num' }, { label: '.', run: dot, kind: 'num' }, { label: '=', run: equals, kind: 'eq' },
  ];
  const kindClass: Record<string, string> = {
    num: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    op: 'bg-school-green/10 text-school-green hover:bg-school-green/20',
    fn: 'bg-slate-200/70 text-slate-600 hover:bg-slate-300',
    eq: 'bg-school-green text-white hover:bg-school-green/90',
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open calculator"
        className="fixed right-3 top-1/2 z-[70] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-school-navy text-white shadow-lg ring-2 ring-white transition hover:scale-105"
      >
        <CalcIcon size={22} />
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className="fixed z-[70] w-60 select-none rounded-2xl border border-slate-300 bg-white shadow-2xl"
      style={pos ? { left: pos.x, top: pos.y } : { right: 12, top: 84 }}
    >
      <div onPointerDown={onPointerDown} className="flex cursor-move touch-none items-center justify-between rounded-t-2xl bg-school-navy px-3 py-2 text-white">
        <span className="flex items-center gap-1.5 text-xs font-bold"><CalcIcon size={14} /> Calculator</span>
        <button onClick={() => setOpen(false)} aria-label="Close calculator" className="rounded p-0.5 hover:bg-white/15"><X size={16} /></button>
      </div>
      <div className="px-3 pt-3">
        <div className="overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 text-right text-2xl font-bold tabular-nums text-slate-900">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-1.5 p-3">
        {KEYS.map((k) => (
          <button key={k.label} onClick={k.run} className={`h-11 rounded-lg text-base font-semibold transition ${kindClass[k.kind]}`}>
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}
