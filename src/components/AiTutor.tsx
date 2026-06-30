import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Send, Crown, Bot, User as UserIcon } from 'lucide-react';
import type { Profile } from '../lib/access';
import { isSubscriptionActive } from '../lib/access';
import { supabase } from '../lib/supabaseClient';

interface AiTutorProps {
  profile: Profile | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_HISTORY_SENT = 10;

export function AiTutor({ profile }: AiTutorProps) {
  const navigate = useNavigate();
  const unlocked = !!profile && (profile.is_admin || isSubscriptionActive(profile));

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setError(null);
    setInput('');
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setSending(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-chat', {
        body: { message: text, history: next.slice(-MAX_HISTORY_SENT - 1, -1) },
      });
      // The edge function always replies with 200 + { error: code } for expected
      // failures (rate limit, not premium, etc.) so the real reason survives the
      // round trip -- supabase-js's FunctionsHttpError otherwise swallows the body.
      if (data?.error === 'rate_limit') {
        setError("You've reached today's question limit. Try again tomorrow.");
        return;
      }
      if (data?.error === 'premium_required') {
        setError('Your premium access seems to have changed. Refresh the page and try again.');
        return;
      }
      if (fnError || data?.error || !data?.reply) {
        setError('Could not reach the AI tutor. Please try again in a moment.');
        return;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply as string }]);
    } catch {
      setError('Could not reach the AI tutor. Please try again in a moment.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-school-green/15 text-school-green">
          <Sparkles size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-sora text-2xl font-bold text-school-navy dark:text-white">AI Study Helper</h1>
            <span className="rounded-full bg-school-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-school-gold">
              Premium
            </span>
          </div>
          <p className="text-sm text-school-navy/60 dark:text-slate-400">
            Ask about anything confusing in any subject — get a clear, simple explanation.
          </p>
        </div>
      </div>

      {!unlocked ? (
        <div className="rounded-2xl border border-school-border bg-school-surface p-8 text-center shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
          <Crown className="mx-auto mb-3 text-school-gold" size={36} />
          <h2 className="font-sora text-lg font-bold text-school-navy dark:text-white">Premium feature</h2>
          <p className="mt-1 text-sm text-school-navy/70 dark:text-slate-300">
            The AI Study Helper is part of premium access. Upgrade to ask unlimited study questions across every subject.
          </p>
          <button
            onClick={() => navigate('/upgrade')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-school-green px-6 py-2.5 font-bold text-white shadow-sm hover:bg-school-green/90"
          >
            <Crown size={16} /> Get Premium
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col rounded-2xl border border-school-border bg-school-surface shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
          <div className="flex max-h-[60vh] min-h-[40vh] flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="m-auto max-w-sm text-center text-sm text-school-muted">
                Ask anything — e.g. "Explain how to balance a chemical equation" or "What's the difference between
                a noun and a pronoun?"
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`flex h-7 w-7 flex-none items-center justify-center rounded-full ${
                    m.role === 'user' ? 'bg-school-blue text-white' : 'bg-school-green/15 text-school-green'
                  }`}
                >
                  {m.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-school-blue text-white'
                      : 'bg-school-light text-school-navy dark:bg-school-navy/60 dark:text-slate-200'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-school-green/15 text-school-green">
                  <Bot size={14} />
                </div>
                <div className="rounded-2xl bg-school-light px-4 py-2.5 text-sm text-school-muted dark:bg-school-navy/60">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="border-t border-school-border px-4 py-2 text-xs font-semibold text-rose-500 dark:border-school-green/20">
              {error}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-school-border p-3 dark:border-school-green/20"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a study question…"
              disabled={sending}
              className="flex-1 rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 text-sm text-school-navy outline-none focus:border-school-green disabled:opacity-60 dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-school-green text-white shadow-sm hover:bg-school-green/90 disabled:opacity-40"
              aria-label="Send"
            >
              <Send size={16} />
            </motion.button>
          </form>
        </div>
      )}
    </main>
  );
}
