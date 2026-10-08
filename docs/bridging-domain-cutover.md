# Domain cutover (after Vercel QA)

Domains are already attached to Vercel project `emath-marker`. Traffic still hits WeWeb until **Atom** DNS is changed.

## Atom DNS (keep nameservers `ns1.atomregistrar.com` / `ns2.atomregistrar.com`)

In Atom → `bridging.lol` → DNS records, **replace** the WeWeb/CloudFront records:

| Type | Name | Value |
|------|------|--------|
| A | `@` | `216.198.79.1` |
| A | `@` | `64.29.17.1` |
| CNAME | `www` | `2e5b2f29c34a4a20.vercel-dns-017.com` |

Delete the old apex A (`52.20.84.62`) and the `www` CNAME to CloudFront. If Atom only allows one A on `@`, use `76.76.21.21` instead.

Do **not** switch nameservers to Vercel unless you want Vercel to host DNS.

After DNS updates, tell me — I will run `vercel domains verify`. Keep WeWeb Launch until www.bridging.lol serves this app.

## Supabase

- **Authentication → URL configuration:** set Site URL to production `https://www.bridging.lol` (or chosen canonical).
- Add production URLs to **Redirect URLs**.

## Google OAuth

Add production origin and redirect URI in Google Cloud Console (and Supabase Google provider redirect list).

## WeWeb

After traffic is on Vercel and students can sign up on Supabase, **cancel WeWeb Launch** (and the editor subscription if you no longer need the old project). Production no longer depends on WeWeb export or env vars like `PRACTICE_MARK_API_URL` in the builder.

## Rollback

Leave WeWeb DNS/hosting configured but unused for one week; revert DNS only if a blocking issue appears.
