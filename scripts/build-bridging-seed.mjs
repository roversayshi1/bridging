import fs from 'fs';

const topics = JSON.parse(fs.readFileSync('content/export/supabase-seed/topics.json', 'utf8'));
const questions = JSON.parse(fs.readFileSync('content/export/supabase-seed/questions-prod.json', 'utf8'));
const notes = JSON.parse(fs.readFileSync('content/export/supabase-seed/notes-public.json', 'utf8'));

function tag(payload) {
  const json = JSON.stringify(payload);
  if (json.includes('$seed$')) throw new Error('seed delimiter collision');
  return json;
}

const topicRows = topics.map((row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  category: row.category,
  description: row.description,
  question_count: row.question_count ?? 0,
  created_at: row.createdAt,
  updated_at: row.updatedAt,
}));

const questionRows = questions.map((row) => {
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

const noteRows = notes.map((row) => ({
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

fs.mkdirSync('bridge/seed', { recursive: true });

function sql(table, rows) {
  return `insert into bridging.${table}\nselect * from jsonb_populate_recordset(null::bridging.${table}, $seed$${tag(rows)}$seed$)\non conflict (id) do nothing;\n`;
}

fs.writeFileSync('bridge/seed/topics.sql', sql('topics', topicRows));
const chunk = 45;
for (let i = 0; i < questionRows.length; i += chunk) {
  const part = questionRows.slice(i, i + chunk);
  fs.writeFileSync(`bridge/seed/questions-${String(i / chunk).padStart(2, '0')}.sql`, sql('questions', part));
}
fs.writeFileSync('bridge/seed/notes.sql', sql('notes', noteRows).replace('on conflict (id)', 'on conflict (id)'));
console.log('topics', topicRows.length, 'questions', questionRows.length, 'notes', noteRows.length);
