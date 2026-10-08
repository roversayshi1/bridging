import fs from 'fs';
const lines = fs.readFileSync(
  'C:/Users/rover/.cursor/projects/c-Users-rover-Projects-emath-marker/agent-transcripts/cbc9e64e-4c02-47dc-9269-063dff4de4c3/cbc9e64e-4c02-47dc-9269-063dff4de4c3.jsonl',
  'utf8'
).split('\n');
for (const line of lines) {
  if (line.includes('Toggle Topic Questions Expand')) {
    const idx = line.indexOf('Toggle Topic Questions Expand');
    console.log(line.slice(Math.max(0, idx - 200), idx + 300));
    console.log('---');
  }
}
