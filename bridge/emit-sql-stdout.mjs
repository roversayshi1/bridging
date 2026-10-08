import fs from 'node:fs';

const i = process.argv[2];
const useWrapped = process.argv[3] === '--wrapped';
const path = useWrapped
  ? `bridge/.mcp-wrapped-${i}.sql`
  : `bridge/.mcp-query-${i}.sql`;
process.stdout.write(fs.readFileSync(path, 'utf8'));
