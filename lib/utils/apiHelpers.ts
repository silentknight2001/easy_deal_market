// lib/utils/apiHelpers.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, isAdmin, adminDb } from '@/lib/firebase/admin';

// ── Rate limit store (use Redis/Upstash in production) ────────────────────────
const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: NextRequest, key: string, max: number, windowSec: number): boolean {
  const ip  = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const k   = `${ip}:${key}`;
  const now = Date.now();
  const rec = store.get(k);
  if (!rec || now > rec.resetAt) { store.set(k, { count: 1, resetAt: now + windowSec * 1000 }); return true; }
  if (rec.count >= max) return false;
  rec.count++;
  return true;
}

// Cleanup every 5 min
setInterval(() => { const n = Date.now(); store.forEach((v, k) => { if (n > v.resetAt) store.delete(k); }); }, 300_000);

// ── Standard responses ─────────────────────────────────────────────────────────
export const res = {
  ok:        (data: unknown, status = 200) => NextResponse.json({ success: true,  data },    { status }),
  err:       (msg: string,  status: number) => NextResponse.json({ success: false, error: msg }, { status }),
  rateLimit: () => NextResponse.json({ success: false, error: 'Too many requests' }, {
    status: 429, headers: { 'Retry-After': '60' },
  }),
  unauth:    () => NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
  forbidden: () => NextResponse.json({ success: false, error: 'Forbidden' },    { status: 403 }),
  invalid:   (details?: unknown) => NextResponse.json({ success: false, error: 'Validation failed', details }, { status: 422 }),
};

// ── Auth helpers ───────────────────────────────────────────────────────────────
export async function requireAuth(req: NextRequest) {
  const cookie = req.cookies.get(process.env.SESSION_COOKIE_NAME ?? 'easy_deals_session')?.value;
  if (!cookie) return null;
  const { user } = await verifySessionCookie(cookie);
  return user ?? null;
}

export async function requireAdmin(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return null;
  const admin = await isAdmin(user.uid);
  return admin ? user : null;
}

// ── Check user is active (not banned/suspended) ───────────────────────────────
export async function requireActiveUser(uid: string): Promise<boolean> {
  const snap = await adminDb.collection('users').doc(uid).get();
  if (!snap.exists) return false;
  const status = snap.data()?.status;
  return status === 'active';
}

// ── Security headers for all responses ───────────────────────────────────────
export function secureHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options':        'DENY',
    'Cache-Control':          'no-store',
  };
}