import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anon) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url || '', anon || '', {
  db: { schema: 'bridging' },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Profile = {
  id: string;
  role: 'student' | 'admin';
  full_name: string | null;
  level: string | null;
};

export async function getProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('id, role, full_name, level').eq('id', user.id).maybeSingle();
  return data as Profile | null;
}

export const markApiUrl =
  (import.meta.env.VITE_MARK_API_URL as string) || '/api/practice/mark';
