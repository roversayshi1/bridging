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

const topics = JSON.parse(fs.readFileSync('content/export/supabase-seed/topics.json', 'utf8')).map((row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  category: row.category,
  description: row.description,
  question_count: row.question_count ?? 0,
  created_at: row.createdAt,
  updated_at: row.updatedAt,
}));

const questions = JSON.parse(fs.readFileSync('content/export/supabase-seed/questions-prod.json', 'utf8')).map((row) => {
  const meta = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  return {
    id: row.id,
    topic_id: row.topic_id,
    prompt: row.prompt,
    model_answer: row.model_answer,
    explanation: row.explanation,
    difficulty: row.difficulty,
    diagram_path: row.diagram_path,
    metadata: meta,
    question_type: meta.question_type ?? null,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
});

const notes = JSON.parse(fs.readFileSync('content/export/supabase-seed/notes-public.json', 'utf8')).map((row) => ({
  id: row.id,
  topic_id: row.topic_id,
  subtopic_name: row.subtopic_name,
  summary: row.summary,
  formulas: row.formulas ?? [],
  exam_tips: row.exam_tips ?? [],
  key_concepts: row.key_concepts ?? [],
  common_mistakes: row.common_mistakes ?? [],
  worked_examples: row.worked_examples ?? [],
  related_topic_codes: row.related_topic_codes ?? [],
  order_index: row.order_index ?? 0,
  updated_at: row.updatedAt,
}));

async function put(table, rows) {
  const { error } = await db.from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(table, rows.length);
}

await put('topics', topics);
for (let i = 0; i < questions.length; i += 40) {
  await put('questions', questions.slice(i, i + 40));
}
await put('notes', notes);
