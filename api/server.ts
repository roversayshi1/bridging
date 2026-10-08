import { createServer } from 'node:http';
import { markAnswer } from '../src/markAnswer.js';
import type { MarkAnswerInput } from '../src/types.js';

const PORT = Number(process.env.PORT ?? 3920);

interface MarkRequestBody extends MarkAnswerInput {}

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res: import('node:http').ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'POST' && req.url === '/mark') {
    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw) as MarkRequestBody;

      if (!body.studentAnswer || !body.canonicalAnswer || !body.questionType) {
        sendJson(res, 400, { error: 'studentAnswer, canonicalAnswer, and questionType are required' });
        return;
      }

      const result = markAnswer(body);
      sendJson(res, 200, result);
      return;
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return;
    }
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`emath-marker demo API listening on http://localhost:${PORT}`);
  console.log('POST /mark  — mark a student answer');
  console.log('GET  /health — health check');
});
