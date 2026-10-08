# Bridging

Singapore E-Math practice and notes at [bridging.lol](https://bridging.lol).

This repository hosts the Vercel deployment for the Bridging web app: the exported WeWeb frontend in `static/`, Vercel serverless APIs under `api/`, and Supabase-backed content in the `bridging` database schema.

## Deploy

Production is deployed from this folder to Vercel (`static` output, API routes in `api/`).

```bash
npm install
npm run build
npx vercel --prod
```

Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or `VITE_SUPABASE_*`) in the Vercel project environment. Do not commit secrets.

## Local scripts

- `scripts/seed-bridging.mjs` — load topics, questions, and notes into Supabase (requires local env file with anon key).
- `scripts/check-bridging.mjs` — verify public reads from the `bridging` schema.
