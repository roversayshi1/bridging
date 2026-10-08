import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { FALLBACK_DAILY, dayIndex, isDailyFriendlyPrompt, singaporeDate, wrapPromptMath } from './dailyBank.js';

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const date = singaporeDate();
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && anonKey) {
    const supabase = createClient(supabaseUrl, anonKey, {
      db: { schema: 'bridging' },
      auth: { persistSession: false },
    });

    const { data: rows, error } = await supabase
      .from('questions')
      .select('id, prompt, difficulty, metadata')
      .not('prompt', 'is', null)
      .not('model_answer', 'is', null)
      .order('id', { ascending: true });

    if (!error && rows?.length) {
      const usable = rows.filter((row) =>
        isDailyFriendlyPrompt(String(row.prompt ?? ''), row.metadata as Record<string, unknown> | null)
      );
      if (usable.length) {
        const picked = usable[dayIndex(date, usable.length)];
        sendJson(res, 200, {
          date,
          questionId: picked.id,
          prompt: wrapPromptMath(String(picked.prompt)),
          difficulty: picked.difficulty ?? null,
          source: 'bank',
        });
        return;
      }
    }
  }

  const picked = FALLBACK_DAILY[dayIndex(date, FALLBACK_DAILY.length)];
  sendJson(res, 200, {
    date,
    questionId: picked.id,
    prompt: picked.prompt,
    difficulty: picked.difficulty,
    source: 'fallback',
  });
}
