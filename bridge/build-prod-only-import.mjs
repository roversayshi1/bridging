import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const agentTools =
  'C:/Users/rover/.cursor/projects/c-Users-rover-Projects-emath-marker/agent-tools';

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizePrompt(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const prod = loadJson(
  path.join(agentTools, '1096b2d6-3fae-4c90-9890-2050c38f7da2.txt')
).data;
const editorPages = [
  '12af0a6f-9ecb-4087-9085-af71b9e30e78.txt',
  'a49db12f-674b-4c74-b7da-b95ed98486e3.txt',
  'c76ecb85-f217-417b-b6ec-e67e597df9e0.txt',
].map((name) => loadJson(path.join(agentTools, name)));
const editor = editorPages.flatMap((page) => page.data || page);

const topicIdToCode = new Map(
  [
    ['019f9df7-a2a2-790d-b90f-3e453f40cd4c', 't14'],
    ['019f9df7-a2a0-71cf-9863-4d6d67e42e6d', 't01'],
    ['019f9df7-a2a2-7888-aef2-fd58477eb864', 't07'],
    ['019f9df7-a2a2-78c7-aa4b-565799c65ce4', 't10'],
    ['019f9df7-a2a2-7865-ab8c-df9bc214c173', 't05'],
    ['019f9df7-a2a2-77cc-bb88-40ce254805a8', 't02'],
    ['019f9df7-a2a2-7853-96ff-2c02dc5e1f10', 't04'],
    ['019f9df7-a2a2-7877-afdf-c436930f3059', 't06'],
    ['019f9df7-a2a2-7839-8287-1e75e9dd37f8', 't03'],
    ['019f9df7-a2a2-7899-9f80-1aed5da88c11', 't08'],
    ['019f9df7-a2a2-7930-a717-cd252273c91f', 't16'],
    ['019f9df7-a2a2-7941-9e48-3d4dda1f252c', 't17'],
  ].map(([id, code]) => [id, code])
);

const editorIds = new Set(editor.map((q) => q.id));
const editorPrompts = new Set(editor.map((q) => normalizePrompt(q.prompt)));
const prodOnly = prod.filter((q) => !editorIds.has(q.id));
const toImport = prodOnly.filter((q) => !editorPrompts.has(normalizePrompt(q.prompt)));
const dupes = prodOnly.filter((q) => editorPrompts.has(normalizePrompt(q.prompt)));

const importItems = toImport.map((q) => {
  const meta = q.metadata || {};
  return {
    topic_code: topicIdToCode.get(q.topic_id),
    difficulty: q.difficulty || 'Medium',
    diagram_required: !!meta.diagram_required,
    subtopic: meta.subtopic || '',
    question_type: meta.question_type || 'open',
    tags: meta.tags || '',
    prompt: q.prompt,
    model_answer: q.model_answer,
    explanation: q.explanation || '',
    diagram_filename: q.diagram_path
      ? q.diagram_path.replace('question-diagrams/', '')
      : '',
  };
});

const out = { questions: importItems };
const outPath = path.join(root, 'content/_import-prod-only.json');
const onelinePath = path.join(root, 'content/_import-prod-only-oneline.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
fs.writeFileSync(onelinePath, JSON.stringify(out));

console.log(
  JSON.stringify(
    {
      production: prod.length,
      editor: editor.length,
      prodOnlyById: prodOnly.length,
      prodOnlyNewPrompts: toImport.length,
      prodOnlyDuplicatePrompts: dupes.length,
      importItems: importItems.length,
      outPath,
      onelinePath,
      onelineBytes: fs.statSync(onelinePath).size,
      sampleTags: toImport.slice(0, 5).map((q) => q.metadata?.tags),
    },
    null,
    2
  )
);
