# Apply notes-0 b64 staging (19 chunks) via Cursor MCP only

Previous `_apply_b64_seed()` failed because seq 4 was truncated (~5933 chars) and/or TRUNCATE ran before apply. Staging was reset; use **fresh** chunks from `chunk-seed-for-mcp.mjs 0` logic (regenerated under `.cursor-run-0.sql` … `.cursor-run-18.sql`, 2858 bytes each).

## Agent loop (only `user-supabase` / `execute_sql`)

```text
TRUNCATE bridging._seed_b64;
node bridge/apply-chunk0-cursor-loop.mjs reset
repeat until complete:
  node bridge/apply-chunk0-cursor-loop.mjs next
  Read bridge/.mcp-active.sql (full single line — do not retype)
  CallDynamicTool execute_sql { "query": <exact file contents> }
  node bridge/apply-chunk0-cursor-loop.mjs mark <index from next>
SELECT bridging._apply_b64_seed();
TRUNCATE bridging._seed_b64;
```

Then apply `bridge/_seed-json-notes-1.sql` (or `node bridge/chunk-seed-for-mcp.mjs 1` + same chunk loop). Skip questions 0–11 if count is already 180.

## Helpers

- `bridge/.chunk0-mcp-queue.jsonl` — all 19 insert queries
- `bridge/mcp-queue-one.mjs <index>` — writes `.mcp-active-payload.json` and prints SQL
- `node -e "..."` → `bridge/.exec-payload.json` for a single `.cursor-run-N.sql`

**Do not** hand-edit base64. **Do not** run TRUNCATE on `_seed_b64` until after successful `_apply_b64_seed()`.
