# Supabase Auth email via Resend

WeWeb’s mail path stays unused. Configure **Supabase** to send auth emails before DNS cutover.

## Resend setup

1. Create a [Resend](https://resend.com) account and verify your sending domain (or use Resend’s test domain for staging only).
2. Create an API key with **Sending access**.

## Supabase Dashboard

1. **Project Settings → Authentication → SMTP Settings**
   - Enable custom SMTP
   - Host: `smtp.resend.com`
   - Port: `465` (SSL) or `587` (STARTTLS)
   - Username: `resend`
   - Password: your Resend API key
   - Sender email: e.g. `auth@yourdomain.com` (must match verified domain)

2. **Authentication → Email templates** — adjust copy for signup confirm and reset password if needed.

3. **Authentication → URL configuration**
   - Site URL: your WeWeb staging URL first, then `https://www.bridging.lol` (or Vercel preview) after export.
   - Redirect URLs: add WeWeb editor/preview, `*.vercel.app`, and production domain.

## Google OAuth (if kept)

In Google Cloud Console, add authorized JavaScript origins and redirect URIs for:

- WeWeb preview / staging
- Vercel preview (`https://<project>.vercel.app`)
- Production domain (after cutover)

Use the same OAuth client as today (`PROVIDER_GOOGLE_*` values); Supabase Google provider uses Supabase callback URLs — configure **Authentication → Providers → Google** in Supabase with client id/secret.

## Test before cutover

1. Sign up with a **real inbox** you control.
2. Trigger **forgot password** and confirm the email arrives within a minute.
3. Only then point DNS at Vercel / drop WeWeb Launch.

## Optional: WeWeb Resend integration

For transactional mail from workflows (not auth), install the WeWeb **Resend** integration separately; auth mail should still go through Supabase SMTP above.
