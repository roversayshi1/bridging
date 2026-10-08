/**
 * Emit one SQL statement per entity type using json_populate_recordset (for MCP execute_sql).
 */
import fs from 'node:fs';
import path from 'node:path';

const seedDir = path.join(path.resolve(import.meta.dirname, '..'), 'content/export/supabase-seed');
const kind = process.argv[2] ?? 'notes';

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(seedDir, name), 'utf8'));
}

function mapNote(r) {
  return {
    id: r.id,
    topic_id: r.topic_id,
    subtopic_name: r.subtopic_name,
    summary: r.summary ?? null,
    key_concepts: r.key_concepts ?? null,
    formulas: r.formulas ?? null,
    worked_examples: r.worked_examples ?? null,
    common_mistakes: r.common_mistakes ?? null,
    exam_tips: r.exam_tips ?? null,
    related_topic_codes: r.related_topic_codes ?? null,
    order_index: r.order_index ?? null,
    level_band: r.level_band ?? null,
    recommended_levels: r.recommended_levels ?? null,
    curriculum_stage: r.curriculum_stage ?? 'O-Level',
    strand: r.strand ?? null,
    estimated_minutes: r.estimated_minutes ?? null,
    revision_status: r.revision_status ?? 'published',
    created_at: r.createdAt ?? r.updatedAt,
    updated_at: r.updatedAt,
  };
}

function mapQuestion(r) {
  return {
    id: r.id,
    topic_id: r.topic_id,
    prompt: r.prompt,
    model_answer: r.model_answer,
    explanation: r.explanation,
    difficulty: r.difficulty,
    metadata: r.metadata ?? null,
    diagram_path: r.diagram_path ?? null,
    question_type: r.question_type ?? null,
    answer_tolerance: r.answer_tolerance ?? null,
    accepted_answers: r.accepted_answers ?? null,
    case_sensitive: r.case_sensitive ?? null,
    require_simplified_form: r.require_simplified_form ?? null,
    require_units: r.require_units ?? null,
    required_unit: r.required_unit ?? null,
    accepted_units: r.accepted_units ?? null,
    marking_notes: r.marking_notes ?? null,
    syntax_migration_status: r.syntax_migration_status ?? null,
    syntax_migration_notes: r.syntax_migration_notes ?? null,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

function emit(kind, rows, table, mapper, batchSize) {
  const mapped = rows.map(mapper);
  for (let i = 0; i < mapped.length; i += batchSize) {
    const chunk = mapped.slice(i, i + batchSize);
    const json = JSON.stringify(chunk).replace(/'/g, "''");
    const sql = `INSERT INTO bridging.${table}\nSELECT * FROM json_populate_recordset(null::bridging.${table}, '${json}'::json)\nON CONFLICT (id) DO NOTHING;`;
    const file = path.join(outDir, `_seed-json-${table}-${i / batchSize}.sql`);
    fs.writeFileSync(file, sql);
    console.log('wrote', file, chunk.length);
  }
}

const outDir = path.resolve(import.meta.dirname);

if (kind === 'notes') {
  emit('notes', load('notes-public.json'), 'notes', mapNote, 20);
} else if (kind === 'questions') {
  emit('questions', load('questions-prod.json'), 'questions', mapQuestion, 15);
} else if (kind === 'topics') {
  const rows = load('topics.json').map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    category: r.category,
    description: r.description,
    question_count: r.question_count ?? 0,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  }));
  const json = JSON.stringify(rows).replace(/'/g, "''");
  console.log(
    `INSERT INTO bridging.topics\nSELECT * FROM json_populate_recordset(null::bridging.topics, '${json}'::json)\nON CONFLICT (id) DO UPDATE SET code=EXCLUDED.code, name=EXCLUDED.name, category=EXCLUDED.category, description=EXCLUDED.description, question_count=EXCLUDED.question_count, updated_at=EXCLUDED.updated_at;`
  );
}
