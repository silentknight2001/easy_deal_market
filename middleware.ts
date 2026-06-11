// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Route definitions ────────────────────────────────────────────────────────

const ADMIN_ROUTES    = ['/admin'];
const AUTH_ROUTES     = ['/sell', '/profile', '/bookings', '/wishlist'];
const PUBLIC_ROUTES   = ['/', '/products', '/categories', '/about', '/contact', '/faq', '/privacy', '/terms', '/login', '/register'];

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, path: string, limit: number, windowSec: number): boolean {
  const key = `${ip}:${path}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}

// Periodic cleanup to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitStore.entries()) {
    if (now > val.resetAt) rateLimitStore.delete(key);
  }
}, 60_000);

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip           = getIp(req);

  // ── Security Headers ──────────────────────────────────────────────────────
  const res = NextResponse.next();

  // Block suspicious user agents
  const ua = req.headers.get('user-agent') ?? '';
  if (/sqlmap|nikto|nmap|masscan|zgrab|python-requests\/2\.[01]/i.test(ua)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // ── Rate Limiting ─────────────────────────────────────────────────────────

  // Auth endpoints: strict
  if (pathname.startsWith('/api/auth/login')) {
    if (!rateLimit(ip, 'login', 5, 900)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Too many login attempts. Try again in 15 minutes.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '900' } }
      );
    }
  }

  // OTP endpoint: very strict
  if (pathname.startsWith('/api/auth/otp')) {
    if (!rateLimit(ip, 'otp', 3, 3600)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Too many OTP requests. Try again in 1 hour.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Product upload: moderate
  if (pathname.startsWith('/api/products') && req.method === 'POST') {
    if (!rateLimit(ip, 'product_upload', 10, 3600)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Upload limit reached. Try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Search: generous
  if (pathname.startsWith('/api/products') && req.method === 'GET') {
    if (!rateLimit(ip, 'search', 100, 60)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Too many requests.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Contact form: strict
  if (pathname.startsWith('/api/contact')) {
    if (!rateLimit(ip, 'contact', 3, 3600)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Too many contact form submissions.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // ── Route Protection ──────────────────────────────────────────────────────

  const sessionCookie = req.cookies.get('easy_deals_session')?.value;

  // Admin routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'auth_required');
      return NextResponse.redirect(loginUrl);
    }
    // Full role check happens in the page/API via Admin SDK
    // Middleware only does a lightweight cookie presence check
  }

  // Protected user routes
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === '/login' || pathname === '/register') && sessionCookie) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // ── CORS for API routes ───────────────────────────────────────────────────

  if (pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'https://easydealslmg.com',
      'https://www.easydealslmg.com',
    ];

    if (req.method === 'OPTIONS') {
      const preflightRes = new NextResponse(null, { status: 204 });
      if (origin && allowedOrigins.includes(origin)) {
        preflightRes.headers.set('Access-Control-Allow-Origin', origin);
      }
      preflightRes.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      preflightRes.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      preflightRes.headers.set('Access-Control-Max-Age', '86400');
      return preflightRes;
    }

    if (origin && allowedOrigins.includes(origin)) {
      res.headers.set('Access-Control-Allow-Origin', origin);
      res.headers.set('Vary', 'Origin');
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|icons|images|robots.txt|sitemap.xml).*)',
  ],
};