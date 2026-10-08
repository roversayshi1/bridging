const args = require('./.cursor-edit-args.json');
const payload = {
  id: args.id,
  projectId: args.projectId,
  firstAction: args.firstAction,
  actions: args.actions,
};
process.stdout.write(JSON.stringify(payload));
