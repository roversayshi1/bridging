/**
 * Write JSONL of all execute_sql steps (chunked) for seed batches 0-13.
 * Agent: for each line, CallDynamicTool user-supabase execute_sql with JSON.parse(line).query
 * (DDL is included once at the start of batch 0 output — skip duplicate DDL on later batches
 *  by using chunk-seed-for-mcp.mjs --no-ddl after first file.)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, '.all-chunk-steps.jsonl');
const lines = [];

for (let i = 0; i < 14; i++) {
  const args = ['chunk-seed-for-mcp.mjs', String(i)];
  const r = spawnSync(process.execPath, [path.join(dir, 'chunk-seed-for-mcp.mjs'), String(i)], {
    encoding: 'utf8',
  });
  if (r.status !== 0) {
    console.error(r.stderr);
    process.exit(1);
  }
  const batchLines = r.stdout.trim().split('\n').filter(Boolean);
  for (const line of batchLines) {
    const obj = JSON.parse(line);
    if (i > 0 && obj.step === 'ddl') continue;
    lines.push(line);
  }
}

fs.writeFileSync(out, lines.join('\n') + '\n', 'utf8');
console.log(JSON.stringify({ out, steps: lines.length }));
