-- Expose bridging schema to PostgREST (Supabase API)
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, bridging';
NOTIFY pgrst, 'reload config';
