/** Print one query from .mcp-q-NN.txt for MCP. Usage: node bridge/mcp-exec-index.mjs 03 */
import fs from 'node:fs';
const i = process.argv[2];
const p = `bridge/.mcp-q-${i}.txt`;
process.stdout.write(fs.readFileSync(p, 'utf8'));
