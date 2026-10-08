import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
for (const line of fs.readFileSync('.env.vercel.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=');
  if (i < 1 || line.startsWith('#')) continue;
  let value = line.slice(i + 1);
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  env[line.slice(0, i)] = value;
}

const db = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  db: { schema: 'bridging' },
  auth: { persistSession: false },
});

const topics = await db.from('topics').select('code,name', { count: 'exact' }).limit(3);
const questions = await db.from('questions').select('id', { count: 'exact', head: true });
const notes = await db.from('notes').select('id', { count: 'exact', head: true });
console.log('topics', topics.count, topics.error?.message ?? '', (topics.data ?? []).map((row) => row.code).join(','));
console.log('questions', questions.count, questions.error?.message ?? '');
console.log('notes', notes.count, notes.error?.message ?? '');
