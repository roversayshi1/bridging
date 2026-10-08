import fs from 'node:fs';
const from = Number(process.argv[2] ?? 6);
const to = Number(process.argv[3] ?? 11);
for (let i = from; i <= to; i++) {
  const q = fs.readFileSync(`bridge/.exec-step-${i}.txt`, 'utf8').trim();
  const b = Buffer.from(q, 'utf8').toString('base64');
  const wrap = `SELECT bridging._exec_sql(convert_from(decode('${b}', 'base64'), 'UTF8'));`;
  fs.writeFileSync(`bridge/.wrap-exec-${i}.sql`, wrap);
  fs.writeFileSync(
    `bridge/.mcp-wrap-exec-${i}.json`,
    JSON.stringify({ step: i, bytes: wrap.length, query: wrap }),
  );
  console.log(JSON.stringify({ step: i, bytes: wrap.length }));
}
