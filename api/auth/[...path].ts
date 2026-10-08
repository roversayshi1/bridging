import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type Session, type User } from '@supabase/supabase-js';

const SESSION_COOKIE = 'better-auth.session_token';
const REFRESH_COOKIE = 'bridging.refresh_token';

type AuthBody = {
  email?: string;
  password?: string;
  name?: string;
  displayName?: string;
  image?: string;
  callbackURL?: string;
  provider?: string;
  rememberMe?: boolean;
  currentPassword?: string;
  newPassword?: string;
  token?: string;
  otp?: string;
  type?: string;
  redirectTo?: string;
};

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function authPath(req: VercelRequest): string {
  const q = req.query.path;
  if (Array.isArray(q)) return q.filter(Boolean).join('/');
  if (typeof q === 'string' && q.length > 0) return q;
  const url = req.url ?? '';
  const marker = '/api/auth/';
  const i = url.indexOf(marker);
  const rest = i >= 0 ? url.slice(i + marker.length) : url.replace(/^\/+/, '');
  return rest.split('?')[0].replace(/\/$/, '');
}

function readCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    out[key] = decodeURIComponent(value);
  }
  return out;
}

function cookieDomain(req: VercelRequest): string | null {
  const host = String(req.headers.host ?? '').split(':')[0].toLowerCase();
  if (host === 'bridging.lol' || host.endsWith('.bridging.lol')) return '.bridging.lol';
  return null;
}

function cookie(name: string, value: string, maxAge: number, domain: string | null): string {
  const bits = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (domain) bits.push(`Domain=${domain}`);
  if (process.env.VERCEL) bits.push('Secure');
  return bits.join('; ');
}

function clearCookie(name: string, domain: string | null): string {
  const bits = [`${name}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (domain) bits.push(`Domain=${domain}`);
  if (process.env.VERCEL) bits.push('Secure');
  return bits.join('; ');
}

function setSessionCookies(req: VercelRequest, res: VercelResponse, session: Session, remember: boolean): void {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
  const domain = cookieDomain(req);
  const jar = [cookie(SESSION_COOKIE, session.access_token, maxAge, domain)];
  if (session.refresh_token) jar.push(cookie(REFRESH_COOKIE, session.refresh_token, maxAge, domain));
  res.setHeader('Set-Cookie', jar);
}

function clearSessionCookies(req: VercelRequest, res: VercelResponse): void {
  const domain = cookieDomain(req);
  res.setHeader('Set-Cookie', [clearCookie(SESSION_COOKIE, domain), clearCookie(REFRESH_COOKIE, domain)]);
}

function jwtRole(token: string): string | null {
  const parts = token.trim().split('.');
  if (parts.length < 2) return null;
  try {
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(padded, 'base64').toString('utf8');
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

function supabaseClients() {
  const url = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').trim();
  const anon = (process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
  const service = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!url || !anon) throw new Error('Supabase env not configured');
  const anonClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const admin =
    jwtRole(service) === 'service_role'
      ? createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;
  return { anonClient, admin };
}

function toBetterUser(user: User) {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    user.email ||
    '';
  return {
    id: user.id,
    name,
    email: user.email ?? '',
    emailVerified: Boolean(user.email_confirmed_at),
    image: typeof meta.avatar_url === 'string' ? meta.avatar_url : null,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

function toBetterSession(user: User, session: Session) {
  const expiresAt = session.expires_at
    ? new Date(session.expires_at * 1000).toISOString()
    : new Date(Date.now() + 60 * 60 * 1000).toISOString();
  return {
    session: {
      id: user.id,
      token: session.access_token.slice(0, 12),
      userId: user.id,
      expiresAt,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
    user: toBetterUser(user),
  };
}

function authError(res: VercelResponse, status: number, message: string, code = 'BAD_REQUEST'): void {
  sendJson(res, status, { message, code });
}

async function readBody(req: VercelRequest): Promise<AuthBody> {
  if (req.body == null || req.body === '') return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as AuthBody;
    } catch {
      return {};
    }
  }
  return req.body as AuthBody;
}

async function resolveSession(req: VercelRequest) {
  const { anonClient } = supabaseClients();
  const cookies = readCookies(req);
  const header = String(req.headers.authorization ?? '');
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const access = cookies[SESSION_COOKIE] || bearer;
  const refresh = cookies[REFRESH_COOKIE];
  if (!access && !refresh) return { session: null as Session | null, user: null as User | null };

  if (access) {
    const { data, error } = await anonClient.auth.getUser(access);
    if (!error && data.user) {
      return {
        session: {
          access_token: access,
          refresh_token: refresh ?? '',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: data.user,
        } as Session,
        user: data.user,
      };
    }
  }

  if (refresh) {
    const { data, error } = await anonClient.auth.refreshSession({ refresh_token: refresh });
    if (!error && data.session && data.user) {
      return { session: data.session, user: data.user };
    }
  }

  return { session: null as Session | null, user: null as User | null };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const path = authPath(req);

  try {
    if ((path === 'get-session' || path === 'ok') && (req.method === 'GET' || req.method === 'POST')) {
      const { session, user } = await resolveSession(req);
      if (!session || !user) {
        sendJson(res, 200, null);
        return;
      }
      setSessionCookies(req, res, session, true);
      sendJson(res, 200, toBetterSession(user, session));
      return;
    }

    if (path === 'callback' && req.method === 'GET') {
      const { anonClient } = supabaseClients();
      const code = typeof req.query.code === 'string' ? req.query.code : '';
      const origin = `https://${String(req.headers.host ?? 'bridging.lol').split(':')[0]}`;
      if (!code) {
        res.redirect(302, `${origin}/login`);
        return;
      }
      const exchanged = await anonClient.auth.exchangeCodeForSession(code);
      if (exchanged.error || !exchanged.data.session) {
        res.redirect(302, `${origin}/login?error=google`);
        return;
      }
      setSessionCookies(req, res, exchanged.data.session, true);
      res.redirect(302, `${origin}/practice`);
      return;
    }

    if (req.method !== 'POST') {
      authError(res, 405, 'Method not allowed');
      return;
    }

    const body = await readBody(req);
    const { anonClient, admin } = supabaseClients();

    if (path === 'sign-up/email') {
      const email = String(body.email ?? '').trim();
      const password = String(body.password ?? '');
      const name = String(body.name ?? body.displayName ?? '').trim();
      if (!email || !password) {
        authError(res, 400, 'Email and password are required');
        return;
      }

      let session: Session | null = null;
      let user: User | null = null;
      let skipPublicSignUp = false;

      if (admin) {
        const created = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: name || undefined, name: name || undefined, image: body.image },
        });
        if (!created.error) {
          skipPublicSignUp = true;
        } else if (/already|registered|exists/i.test(created.error.message)) {
          skipPublicSignUp = true;
        } else if (!/invalid api key/i.test(created.error.message)) {
          authError(res, 400, created.error.message, 'SIGN_UP_FAILED');
          return;
        }
      }

      if (!skipPublicSignUp) {
        const signedUp = await anonClient.auth.signUp({
          email,
          password,
          options: { data: { full_name: name || undefined, name: name || undefined } },
        });
        if (signedUp.error) {
          authError(res, 400, signedUp.error.message, 'SIGN_UP_FAILED');
          return;
        }
        session = signedUp.data.session;
        user = signedUp.data.user;
      }

      if (!session) {
        const signedIn = await anonClient.auth.signInWithPassword({ email, password });
        if (signedIn.error || !signedIn.data.session || !signedIn.data.user) {
          authError(
            res,
            400,
            signedIn.error?.message || 'Account created. Confirm your email, then sign in.',
            'EMAIL_NOT_CONFIRMED'
          );
          return;
        }
        session = signedIn.data.session;
        user = signedIn.data.user;
      }

      setSessionCookies(req, res, session, true);
      sendJson(res, 200, { token: session.access_token, user: toBetterUser(user!) });
      return;
    }

    if (path === 'sign-in/email') {
      const email = String(body.email ?? '').trim();
      const password = String(body.password ?? '');
      if (!email || !password) {
        authError(res, 400, 'Email and password are required');
        return;
      }
      const signedIn = await anonClient.auth.signInWithPassword({ email, password });
      if (signedIn.error || !signedIn.data.session || !signedIn.data.user) {
        authError(res, 401, signedIn.error?.message || 'Invalid email or password', 'INVALID_EMAIL_OR_PASSWORD');
        return;
      }
      setSessionCookies(req, res, signedIn.data.session, body.rememberMe !== false);
      sendJson(res, 200, {
        token: signedIn.data.session.access_token,
        user: toBetterUser(signedIn.data.user),
        redirect: false,
      });
      return;
    }

    if (path === 'sign-out') {
      clearSessionCookies(req, res);
      sendJson(res, 200, { success: true });
      return;
    }

    if (path === 'sign-in/social') {
      const provider = body.provider === 'google' ? 'google' : null;
      if (!provider) {
        authError(res, 400, 'Only Google is enabled on this host.', 'PROVIDER_NOT_ENABLED');
        return;
      }
      const origin = req.headers.origin || `https://${req.headers.host}`;
      const redirectTo = `${origin}/api/auth/callback`;
      const { data, error } = await anonClient.auth.signInWithOAuth({
        provider,
        options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'consent' } },
      });
      if (error || !data.url) {
        authError(res, 400, error?.message || 'Google sign-in is not configured', 'SOCIAL_FAILED');
        return;
      }
      sendJson(res, 200, { url: data.url, redirect: true });
      return;
    }

    if (path === 'request-password-reset' || path === 'forget-password' || path === 'email-otp/send-verification-otp') {
      const email = String(body.email ?? '').trim();
      if (!email) {
        authError(res, 400, 'Email is required');
        return;
      }
      const origin = req.headers.origin || `https://${req.headers.host}`;
      const { error } = await anonClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/forgot-password`,
      });
      if (error) {
        authError(res, 400, error.message);
        return;
      }
      sendJson(res, 200, { status: true, message: 'If that email exists, a reset link was sent.' });
      return;
    }

    if (path === 'reset-password') {
      const { session } = await resolveSession(req);
      const token = body.token;
      const newPassword = String(body.newPassword ?? body.password ?? '');
      if (!newPassword) {
        authError(res, 400, 'New password is required');
        return;
      }
      if (!session && !token) {
        authError(res, 401, 'Reset session missing. Use the link from your email.');
        return;
      }
      const client = createClient(
        process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '',
        process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '',
        {
          auth: { persistSession: false, autoRefreshToken: false },
          global: session ? { headers: { Authorization: `Bearer ${session.access_token}` } } : undefined,
        }
      );
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) {
        authError(res, 400, error.message);
        return;
      }
      sendJson(res, 200, { status: true });
      return;
    }

    authError(res, 404, `Auth route not implemented: ${path}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
    authError(res, 500, message, 'INTERNAL');
  }
}
