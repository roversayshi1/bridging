/**
 * Generate batched SQL for notes + questions into bridge/_seed-content-N.sql
 */
import fs from 'node:fs';
import path from 'node:path';

const seedDir = path.join(path.resolve(import.meta.dirname, '..'), 'content/export/supabase-seed');
const outDir = path.resolve(import.meta.dirname);

function sqlStr(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return 'ARRAY[]::text[]';
    return `ARRAY[${v.map((x) => sqlStr(x)).join(', ')}]::text[]`;
  }
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

const notes = JSON.parse(fs.readFileSync(path.join(seedDir, 'notes-public.json'), 'utf8'));
const questions = JSON.parse(fs.readFileSync(path.join(seedDir, 'questions-prod.json'), 'utf8'));

function noteSql(r) {
  return `INSERT INTO bridging.notes (id, topic_id, subtopic_name, summary, key_concepts, formulas, worked_examples, common_mistakes, exam_tips, related_topic_codes, order_index, level_band, recommended_levels, curriculum_stage, strand, estimated_minutes, revision_status, created_at, updated_at) VALUES (${sqlStr(r.id)}::uuid, ${sqlStr(r.topic_id)}::uuid, ${sqlStr(r.subtopic_name)}, ${sqlStr(r.summary)}, ${sqlStr(r.key_concepts)}, ${sqlStr(r.formulas)}, ${sqlStr(r.worked_examples)}, ${sqlStr(r.common_mistakes)}, ${sqlStr(r.exam_tips)}, ${sqlStr(r.related_topic_codes)}, ${r.order_index ?? 'NULL'}, ${sqlStr(r.level_band)}, ${sqlStr(r.recommended_levels)}, ${sqlStr(r.curriculum_stage ?? 'O-Level')}, ${sqlStr(r.strand)}, ${r.estimated_minutes ?? 'NULL'}, ${sqlStr(r.revision_status ?? 'published')}, ${sqlStr(r.createdAt)}::timestamptz, ${sqlStr(r.updatedAt)}::timestamptz) ON CONFLICT (id) DO NOTHING;`;
}

function questionSql(r) {
  return `INSERT INTO bridging.questions (id, topic_id, prompt, model_answer, explanation, difficulty, metadata, diagram_path, question_type, answer_tolerance, accepted_answers, case_sensitive, require_simplified_form, require_units, required_unit, accepted_units, marking_notes, syntax_migration_status, syntax_migration_notes, created_at, updated_at) VALUES (${sqlStr(r.id)}::uuid, ${sqlStr(r.topic_id)}::uuid, ${sqlStr(r.prompt)}, ${sqlStr(r.model_answer)}, ${sqlStr(r.explanation)}, ${sqlStr(r.difficulty)}, ${sqlStr(r.metadata)}, ${sqlStr(r.diagram_path)}, ${sqlStr(r.question_type)}, ${r.answer_tolerance ?? 'NULL'}, ${r.accepted_answers ? `ARRAY[${r.accepted_answers.map((x) => sqlStr(x)).join(', ')}]::text[]` : 'NULL'}, ${r.case_sensitive == null ? 'NULL' : r.case_sensitive}, ${r.require_simplified_form == null ? 'NULL' : r.require_simplified_form}, ${r.require_units == null ? 'NULL' : r.require_units}, ${sqlStr(r.required_unit)}, ${r.accepted_units ? `ARRAY[${r.accepted_units.map((x) => sqlStr(x)).join(', ')}]::text[]` : 'NULL'}, ${sqlStr(r.marking_notes)}, ${sqlStr(r.syntax_migration_status)}, ${sqlStr(r.syntax_migration_notes)}, ${sqlStr(r.createdAt)}::timestamptz, ${sqlStr(r.updatedAt)}::timestamptz) ON CONFLICT (id) DO NOTHING;`;
}

function writeBatches(label, lines, size) {
  let batch = 0;
  for (let i = 0; i < lines.length; i += size) {
    const chunk = lines.slice(i, i + size).join('\n');
    fs.writeFileSync(path.join(outDir, `_seed-${label}-${batch}.sql`), chunk);
    batch++;
  }
  console.log(label, lines.length, 'rows', batch, 'files');
}

writeBatches('notes', notes.map(noteSql), 5);
writeBatches('questions', questions.map(questionSql), 3);
