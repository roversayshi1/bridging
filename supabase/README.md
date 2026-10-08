# Bridging on Supabase

## Schema

All Bridging tables live in the **`bridging`** Postgres schema (keeps them separate from other apps on the same Supabase project).

After deploying migrations, open **Project Settings → API → Exposed schemas** and add **`bridging`** so PostgREST and the WeWeb Supabase plugin can query `bridging.topics`, etc.

## Migrations

Apply with Supabase CLI (`supabase db push`) or the SQL files under `migrations/`.

## Storage

- `bridging-public` — question diagrams (public read)
- `bridging-private` — avatars (`{user_id}/…` path)

## Auth

- Email + password and optional Google (configure in Supabase Dashboard → Authentication).
- New users get a row in `bridging.profiles` via trigger `on_auth_user_created_bridging`.
- Set admin: `UPDATE bridging.profiles SET role = 'admin' WHERE id = '<auth.users.id>';`

## Email (Resend)

See `docs/bridging-resend-supabase.md`.

## Env for exported Vue (Vercel)

- `VITE_SUPABASE_URL` / WeWeb public env: project URL
- `VITE_SUPABASE_ANON_KEY` — anon key only (never service role in the SPA)
