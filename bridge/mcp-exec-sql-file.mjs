/**
 * Print SQL file path then SQL on stdout for agent MCP execute_sql.
 * Usage: node bridge/mcp-exec-sql-file.mjs bridge/.part-7-0.sql
 */
import fs from 'node:fs';

const p = process.argv[2];
if (!p) process.exit(1);
process.stdout.write(fs.readFileSync(p, 'utf8'));
