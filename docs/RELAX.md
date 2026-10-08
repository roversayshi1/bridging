# Bridging without WeWeb

Bridging now lives in this repo as **`bridging-web/`** — a Vue 3 SPA on **Vercel** with **Supabase Auth + `bridging` schema**. You can stop paying for WeWeb Launch once DNS and QA are done.

## What runs where

| Piece | Host |
|--------|------|
| **App (UI, auth, notes, practice)** | Vercel — `emath-marker` project → `bridging-web/dist` |
| **Marking + attempt logging** | Same Vercel project — `/api/practice/mark` |
| **Database & auth** | Supabase — schema `bridging` |

WeWeb is **not** required for production anymore. Keep the old project only until you have cut over and cancelled Launch.

## One-time setup (still needed if not done)

1. **Expose `bridging` schema** — [Supabase API settings](https://supabase.com/dashboard/project/xcyfgrieeatwbkretrdr/settings/api) → **Exposed schemas** → add `bridging`.

2. **Vercel env** ([project settings](https://vercel.com/elijah-9f8c/emath-marker/settings/environment-variables)):

   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Production + Preview)
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (for API routes)
   - Optional: `VITE_MARK_API_URL=/api/practice/mark`

3. **Resend SMTP** in Supabase for signup/reset — [`bridging-resend-supabase.md`](./bridging-resend-supabase.md).

4. **Deploy** — push to git or `vercel deploy --prod` from repo root (runs `build:vercel`).

5. **Domain** — point `bridging.lol` / `www` to Vercel per [`bridging-domain-cutover.md`](./bridging-domain-cutover.md). Update Google OAuth redirect URIs to the new origin.

6. **Admin users** — set `bridging.profiles.role = 'admin'` in Supabase for your account (admin route + `legacy_users`).

## Local dev

```bash
cd bridging-web
cp .env.example .env   # fill Supabase URL + anon key
npm install
npm run dev
```

Mark API locally: run the root demo or deploy preview; set `VITE_MARK_API_URL` to your deployed `/api/practice/mark` if needed.

## Students

- **New accounts:** sign up on the Vercel/Bridging domain (Supabase). Old WeWeb passwords are **not** migrated.
- **Legacy email list:** admin-only `legacy_users` table for reference.

See also [`bridging-vercel-deploy.md`](./bridging-vercel-deploy.md).
