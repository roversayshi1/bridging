import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleBridge } from './lib/routes.js';

export default function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  return handleBridge(req, res);
}
