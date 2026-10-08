# Deploy the WeWeb Vue export on Vercel (1:1)

Vercel should serve **WeWeb’s built export**, not `bridging-web/`.

## Get the zip (only you can click this)

WeWeb MCP cannot generate a code export. In the **BRIDGING** editor:

1. Publish at least once (already done).
2. Top right → **Deploy**
3. Open the **Export** tab
4. **Generate code export**
5. Download the zip (use **built interface** files)

Drop the zip in this chat, or extract it so `static/index.html` exists (the zip’s `index.html` and `assets/` at the root of `static/`, not nested in an extra folder).

Then say “zip is in static” and the repo will be deployed with SPA rewrites + `/api/practice/mark`.

## Auth after self-host

WeWeb Auth **does not work** on a self-hosted export (WeWeb microservice). The exported UI is still 1:1 visually; login must use **Supabase** (already in WeWeb env) or it will fail once you leave Launch.

See WeWeb docs: [Hosting & Code Export](https://docs.weweb.io/settings-billing-code-export/hosting-and-code-export.html).
