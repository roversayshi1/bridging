# WeWeb → Supabase rewire (Bridging)

Complete these steps **in the WeWeb editor** before exporting the Vue SPA. WeWeb Auth and WeWeb Backend do not work on Vercel.

## 1. Connect Supabase

1. Open the Supabase connection flow:  
   [Install Supabase integration](https://bcf230cd-e5b1-4fde-814b-0ddd71a314f0-editor.weweb.io/?ww_integration=supabase&ww_connection=new)
2. Use project URL `https://xcyfgrieeatwbkretrdr.supabase.co` and the **anon/publishable** key (already in env vars `SUPABASE_URL` / `SUPABASE_ANON_KEY`).
3. In Supabase Dashboard → **Project Settings → API → Exposed schemas**, add **`bridging`**.

## 2. Switch auth provider

After the connection exists:

- **Settings → Auth provider → Supabase** (replaces WeWeb Auth).
- Keep the same login/signup/forgot-password pages; replace workflows:
  - Sign in → **Sign in with Email** (Supabase)
  - Sign up → **Sign up with Email**
  - Forgot password → **Reset password for email**
  - Google → **Sign in with Provider** (`google`)
  - Sign out → **Sign Out**
- **Admin role:** after your account signs up on Supabase, run in SQL editor:  
  `UPDATE bridging.profiles SET role = 'admin' WHERE id = '<your auth.users.id>';`

Remove or disable WeWeb Auth triggers (`after-sign-up`, `after-sign-in`, `request-password-reset` email via WeWeb).

## 3. Data reads (replace table views)

Create **Supabase integration tables** (front) pointing at:

| Integration table | Supabase table | Notes |
|-------------------|----------------|--------|
| `sb_topics` | `topics` | Public read |
| `sb_questions` | `questions` | Public read |
| `sb_notes` | `notes` | Filter `revision_status = published` |
| `sb_profiles` | `profiles` | `id = auth user id` |
| `sb_attempts` | `attempts` | Filter `user_id = current user` |
| `sb_mock_tests` | `mock_tests` | Same |
| `sb_legacy_users` | `legacy_users` | Admin only |

Replace `fetch-table-view` on old views with **Select** (Supabase) or integration table collections.

## 4. Practice marking + attempts

- Point Practice submit to **`PRACTICE_MARK_API_URL`** (HTTP POST JSON: `{ studentAnswer, questionId }`, optional `Authorization: Bearer <session access token>`).
- On success, UI can rely on the API inserting into `bridging.attempts` when the bearer token is sent (Vercel function uses service role for insert).

## 5. Storage

- Public diagrams → bucket **`bridging-public`** (`storage-get-public-url`).
- Avatars → **`bridging-private`** (`storage-create-signed-url`, path `{user_id}/...`).

## 6. Seed data

Editor databank is already mirrored in Supabase (`17` topics, `37` notes, `180` questions, `1` legacy user). Re-import after production changes:

```bash
node bridge/generate-json-seed-sql.mjs topics notes questions
# Then apply bridge/_seed-json-*.sql via Supabase SQL or:
# DATABASE_URL=... node bridge/apply-json-seed-batches.mjs
```

## 7. QA on WeWeb staging

Sign up fresh, practice one question, open notes, confirm admin legacy list — **then** publish and export.
