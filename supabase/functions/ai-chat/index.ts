/**
 * AI Study Helper — Supabase Edge Function
 *
 * Powers the Premium "AI Study Helper" chat (src/components/AiTutor.tsx). The
 * front end calls it via supabase.functions.invoke('ai-chat', { body: { message, history } })
 * and expects a 200 response shaped like:
 *   { reply: "..." }                 on success
 *   { error: "premium_required" }    when the user isn't logged in / not premium
 *   { error: "rate_limit" }          when the free LLM quota is exhausted
 *   { error: "llm_error" }           for anything else
 * (It always returns 200 so the error code survives supabase-js.)
 *
 * Uses Google Gemini's FREE tier — no paid API needed.
 *
 * Required Supabase secret (set once):
 *   GEMINI_API_KEY   — free key from https://aistudio.google.com/app/apikey
 * Optional:
 *   GEMINI_MODEL     — defaults to "gemini-1.5-flash"
 *
 * SUPABASE_URL and SUPABASE_ANON_KEY are injected automatically.
 *
 * Deploy:
 *   supabase secrets set GEMINI_API_KEY=your_key_here
 *   supabase functions deploy ai-chat
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-1.5-flash';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const SYSTEM_PROMPT =
  'You are a friendly, patient study tutor for Nigerian students preparing for the ' +
  'Rivers State University (RSU) Post-UTME / JAMB exam. Explain clearly and simply at ' +
  'SS3 level. Keep answers short — a few brief paragraphs at most, with steps or examples ' +
  'where helpful. Use Nigerian exam context. If a question is not about studying or a school ' +
  'subject, gently guide the student back to their exam preparation.';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

interface ChatTurn { role: string; content: string }

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    // ── Identify the caller from their JWT and confirm Premium ──
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: 'premium_required' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('has_paid, paid_until, is_admin')
      .eq('id', user.id)
      .single();

    const premium =
      !!profile &&
      (profile.is_admin === true ||
        profile.has_paid === true ||
        (!!profile.paid_until && new Date(profile.paid_until).getTime() > Date.now()));
    if (!premium) return json({ error: 'premium_required' });

    // ── Read the message + short history ──
    const payload = await req.json().catch(() => ({}));
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';
    if (!message) return json({ error: 'bad_request' });
    const history: ChatTurn[] = Array.isArray(payload.history) ? payload.history : [];

    // ── Build Gemini request ──
    const contents = [
      ...history
        .filter((m) => m && typeof m.content === 'string')
        .slice(-10)
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content).slice(0, 2000) }],
        })),
      { role: 'user', parts: [{ text: message.slice(0, 2000) }] },
    ];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.5, maxOutputTokens: 800 },
        }),
      },
    );

    // Free-tier quota exhausted → let the UI show the friendly "limit reached" note.
    if (geminiRes.status === 429) return json({ error: 'rate_limit' });
    if (!geminiRes.ok) return json({ error: 'llm_error' });

    const data = await geminiRes.json();
    const reply: string =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('').trim() ?? '';
    if (!reply) return json({ error: 'llm_error' });

    return json({ reply });
  } catch {
    return json({ error: 'llm_error' });
  }
});
