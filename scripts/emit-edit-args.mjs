import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const argsPath = join(__dirname, '..', '.cursor-edit-args.json');
const args = JSON.parse(readFileSync(argsPath, 'utf8'));

const payload = {
  id: args.id,
  projectId: args.projectId,
  firstAction: args.firstAction,
  actions: args.actions,
};

// Emit compact JSON for MCP invocation
process.stdout.write(JSON.stringify(payload));
