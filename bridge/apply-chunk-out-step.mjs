/**
 * Agent helper: print one line JSON {step, query} for bridge/.chunk-out-<step>.sql
 * Usage: node bridge/apply-chunk-out-step.mjs <step>
 * Agent: CallDynamicTool user-supabase execute_sql with parsed query, then mark batch when done.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const step = process.argv[2];
const p = path.join(dir, `.chunk-out-${step}.sql`);
if (!fs.existsSync(p)) {
  const lines = fs.readFileSync(path.join(dir, '.all-chunk-steps.jsonl'), 'utf8').trim().split('\n');
  const s = Number(step);
  if (!Number.isInteger(s) || s < 0 || s >= lines.length) {
    console.error('missing chunk file and invalid step', step);
    process.exit(1);
  }
  fs.writeFileSync(p, JSON.parse(lines[s]).query);
}
const query = fs.readFileSync(p, 'utf8');
process.stdout.write(JSON.stringify({ step: Number(step), bytes: query.length, query }));
