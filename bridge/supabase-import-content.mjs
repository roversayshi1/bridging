/**
 * Import Bridging syllabus JSON into Supabase bridging.* tables.
 *
 * Requires:
 *   SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *
 * Optional seed dir (default content/export/supabase-seed):
 *   topics.json, questions-prod.json, notes-public.json, legacy-users.json
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const seedDir = process.env.BRIDGING_SEED_DIR ?? path.join(root, 'content/export/supabase-seed');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

function load(name) {
  const p = path.join(seedDir, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function mapTopic(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    description: row.description ?? null,
    question_count: row.question_count ?? 0,
    created_at: row.createdAt ?? row.created_at,
    updated_at: row.updatedAt ?? row.updated_at,
  };
}

function mapNote(row) {
  return {
    id: row.id,
    topic_id: row.topic_id,
    subtopic_name: row.subtopic_name,
    summary: row.summary ?? null,
    key_concepts: row.key_concepts ?? null,
    formulas: row.formulas ?? null,
    worked_examples: row.worked_examples ?? null,
    common_mistakes: row.common_mistakes ?? null,
    exam_tips: row.exam_tips ?? null,
    related_topic_codes: row.related_topic_codes ?? null,
    order_index: row.order_index ?? null,
    level_band: row.level_band ?? null,
    recommended_levels: row.recommended_levels ?? null,
    curriculum_stage: row.curriculum_stage ?? 'O-Level',
    strand: row.strand ?? null,
    estimated_minutes: row.estimated_minutes ?? null,
    revision_status: row.revision_status ?? 'published',
    created_at: row.createdAt ?? row.created_at,
    updated_at: row.updatedAt ?? row.updated_at,
  };
}

function mapQuestion(row) {
  return {
    id: row.id,
    topic_id: row.topic_id,
    prompt: row.prompt,
    model_answer: row.model_answer,
    explanation: row.explanation,
    difficulty: row.difficulty,
    metadata: row.metadata ?? null,
    diagram_path: row.diagram_path ?? null,
    question_type: row.question_type ?? row.metadata?.question_type ?? null,
    answer_tolerance: row.answer_tolerance ?? null,
    accepted_answers: row.accepted_answers ?? null,
    case_sensitive: row.case_sensitive ?? null,
    require_simplified_form: row.require_simplified_form ?? null,
    require_units: row.require_units ?? null,
    required_unit: row.required_unit ?? null,
    accepted_units: row.accepted_units ?? null,
    marking_notes: row.marking_notes ?? null,
    syntax_migration_status: row.syntax_migration_status ?? null,
    syntax_migration_notes: row.syntax_migration_notes ?? null,
    created_at: row.createdAt ?? row.created_at,
    updated_at: row.updatedAt ?? row.updated_at,
  };
}

function mapLegacy(row) {
  return {
    email: row.email,
    display_name: row.display_name ?? row.name ?? null,
    weweb_user_id: row.user_id ?? row.id ?? null,
    weweb_created_at: row.createdAt ?? row.created_at ?? null,
    source: 'weweb',
  };
}

const schemaHeaders = {
  'Content-Profile': 'bridging',
  'Accept-Profile': 'bridging',
};

async function upsert(table, rows, onConflict = 'id') {
  if (!rows?.length) return { count: 0 };
  const res = await fetch(`${url}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
      ...schemaHeaders,
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${table} upsert failed ${res.status}: ${text}`);
  }
  return { count: rows.length };
}

async function main() {
  const topics = load('topics.json');
  const questions = load('questions-prod.json');
  const notes = load('notes-public.json');
  const legacy = load('legacy-users.json');

  if (topics) {
    const r = await upsert('topics', topics.map(mapTopic));
    console.log('topics', r.count);
  }
  if (notes) {
    for (let i = 0; i < notes.length; i += 50) {
      const chunk = notes.slice(i, i + 50).map(mapNote);
      const r = await upsert('notes', chunk);
      console.log('notes', i, '+', r.count);
    }
  }
  if (questions) {
    for (let i = 0; i < questions.length; i += 25) {
      const chunk = questions.slice(i, i + 25).map(mapQuestion);
      const r = await upsert('questions', chunk);
      console.log('questions', i, '+', r.count);
    }
  }
  if (legacy) {
    for (let i = 0; i < legacy.length; i += 50) {
      const chunk = legacy.slice(i, i + 50).map(mapLegacy);
      const res = await fetch(`${url}/rest/v1/legacy_users?on_conflict=email,source`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
          ...schemaHeaders,
        },
        body: JSON.stringify(chunk),
      });
      if (!res.ok) throw new Error(await res.text());
      console.log('legacy_users', i, '+', chunk.length);
    }
  }
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
