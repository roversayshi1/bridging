CREATE TABLE IF NOT EXISTS bridging._seed_b64 (seq int PRIMARY KEY, data text NOT NULL);
CREATE OR REPLACE FUNCTION bridging._apply_b64_seed() RETURNS void LANGUAGE plpgsql AS $$
DECLARE s text;
BEGIN
  SELECT string_agg(data, '' ORDER BY seq) INTO s FROM bridging._seed_b64;
  IF s IS NULL OR s = '' THEN
    RAISE EXCEPTION 'no seed chunks loaded';
  END IF;
  EXECUTE convert_from(decode(s, 'base64'), 'UTF8');
END;
$$;