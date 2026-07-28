import { useEffect, useRef, useState } from 'react';
import { Bot, Send, ArrowRight } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

interface Msg { role: 'user' | 'assistant'; content: string }

/**
 * In-exam AI tutor. Reuses the ai-chat backend; for logged-in Premium students it
 * answers, otherwise it invites sign-up. Themed with the exam's accent colour.
 */
export function ExamAiChat({ accent, examName, onLogin, suggestions }: { accent: string; examName: string; onLogin: () => void; suggestions: string[] }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: `Hi! I’m your ${examName} AI tutor. Ask me anything — I’ll explain it simply.` },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [locked, setLocked] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages, sending, locked]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || sending) return;
    setInput(''); setLocked(false);
    const next = [...messages, { role: 'user' as const, content: q }];
    setMessages(next); setSending(true);
    try {
      const { data } = await supabase.functions.invoke('ai-chat', { body: { message: q, history: next.slice(-11, -1) } });
      if (data?.reply) setMessages((p) => [...p, { role: 'assistant', content: data.reply as string }]);
      else setLocked(true);
    } catch { setLocked(true); } finally { setSending(false); }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col overflow-hidden rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--mt-shadow)' }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ background: accent }}>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}><Bot size={20} /></span>
        <div>
          <div className="mt-display text-base font-extrabold text-white">{examName} AI Tutor</div>
          <div className="mt-body text-[11px]" style={{ color: 'rgba(255,255,255,.85)' }}>Clear explanations · any topic</div>
        </div>
      </div>
      <div ref={listRef} className="flex max-h-[360px] min-h-[240px] flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: m.role === 'user' ? '#0F172A' : accent }}>{m.role === 'user' ? 'You' : <Bot size={14} />}</span>
            <div className="mt-body max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed" style={m.role === 'user' ? { background: '#0F172A', color: '#fff' } : { background: 'var(--surface-2)', color: 'var(--text)' }}>{m.content}</div>
          </div>
        ))}
        {sending && <div className="mt-body text-sm" style={{ color: 'var(--text-muted)' }}>Thinking…</div>}
        {locked && (
          <div className="rounded-2xl border p-4 text-center text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
            <p className="mt-display font-bold" style={{ color: 'var(--text)' }}>Unlock the AI tutor 🔓</p>
            <p className="mt-body mt-1" style={{ color: 'var(--text-muted)' }}>Sign up free and go Premium to chat across every topic.</p>
            <button onClick={onLogin} className="mt-btn mt-3 text-white" style={{ background: accent }}>Start free <ArrowRight size={15} /></button>
          </div>
        )}
        {messages.length <= 1 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="mt-body rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}>{s}</button>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t p-3" style={{ borderColor: 'var(--border)' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a study question…" disabled={sending} className="mt-body flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }} />
        <button type="submit" disabled={sending || !input.trim()} aria-label="Send" className="mt-btn flex-none text-white disabled:opacity-40" style={{ background: accent, width: '2.75rem', height: '2.75rem', padding: 0 }}><Send size={16} /></button>
      </form>
    </div>
  );
}
