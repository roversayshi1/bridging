import fs from 'fs';
const lines = fs.readFileSync(
  'C:/Users/rover/.cursor/projects/c-Users-rover-Projects-emath-marker/agent-transcripts/cbc9e64e-4c02-47dc-9269-063dff4de4c3/cbc9e64e-4c02-47dc-9269-063dff4de4c3.jsonl',
  'utf8'
).split('\n');
for (const line of lines) {
  if (!line.includes('c8e4a2f1-7b9d-4e6a-a1c3-5d8f0b2e9a74')) continue;
  const idx = line.indexOf('"actions":{"TOGGLE_EXPAND"');
  if (idx === -1) continue;
  const sub = line.slice(idx);
  const end = sub.indexOf('},"description":"On View all');
  if (end === -1) {
    console.log('partial', sub.slice(0, 2000));
    continue;
  }
  const actionsJson = sub.slice('"actions":'.length, end + 1);
  console.log(actionsJson);
}
