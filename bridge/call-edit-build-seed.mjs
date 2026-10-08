import fs from 'fs';
const args = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
process.stdout.write(JSON.stringify({
  id: args.id,
  projectId: args.projectId,
  actions: args.actions,
}));
