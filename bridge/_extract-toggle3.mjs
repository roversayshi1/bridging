import fs from 'fs';
const lines = fs.readFileSync(
  'C:/Users/rover/.cursor/projects/c-Users-rover-Projects-emath-marker/agent-transcripts/cbc9e64e-4c02-47dc-9269-063dff4de4c3/cbc9e64e-4c02-47dc-9269-063dff4de4c3.jsonl',
  'utf8'
).split('\n');
for (const line of lines) {
  if (line.includes('TOGGLE_EXPAND')) {
    console.log(line.match(/TOGGLE_EXPAND[^}]{0,800}/)?.[0] || 'no match');
    console.log('====');
  }
}
