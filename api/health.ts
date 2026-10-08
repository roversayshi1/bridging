import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse): void {
  res.status(200).json({
    ok: true,
    service: 'emath-marker',
    mark: '/api/practice/mark',
    daily: '/api/practice/daily',
    auth: '/api/auth',
    app: 'https://www.bridging.lol/',
  });
}
