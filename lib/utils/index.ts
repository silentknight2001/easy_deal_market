// lib/utils/index.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...i: ClassValue[]) { return twMerge(clsx(i)); }

// ── Format ────────────────────────────────────────────────────────────────────
export function formatPrice(n: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

// ✅ Handles all date formats: Date, Firestore Timestamp, {seconds:number}
function toDate(date: unknown): Date {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  if (typeof (date as {toDate?:unknown}).toDate === 'function') return (date as {toDate():Date}).toDate();
  if (typeof (date as {seconds?:unknown}).seconds === 'number') return new Date((date as {seconds:number}).seconds * 1000);
  return new Date();
}

export function formatDate(date: unknown): string {
  const d = toDate(date);
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

export function timeAgo(date: unknown): string {
  const d   = toDate(date);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals: [number, string][] = [[31536000,'year'],[2592000,'month'],[86400,'day'],[3600,'hour'],[60,'minute']];
  for (const [s, l] of intervals) {
    const c = Math.floor(sec / s);
    if (c >= 1) return `${c} ${l}${c > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function truncate(str: string, len: number): string {
  return str.length <= len ? str : str.slice(0, len).trim() + '…';
}

// ── Slug ──────────────────────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g,'').replace(/[\s_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0, 100);
}

// ── Sanitize ─────────────────────────────────────────────────────────────────
// Strip HTML tags + dangerous chars (client-side pre-sanitization — server always re-validates)
export function sanitizeSearchQuery(q: string): string {
  return q.replace(/<[^>]*>/g, '').replace(/[<>"'`;()|&${}[\]\\]/g, '').trim().slice(0, 200);
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9._-]/gi, '_').replace(/__+/g, '_').toLowerCase().slice(0, 100);
}

// ── File validation ───────────────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MB        = 5;
const DANGER_EXT    = /\.(exe|js|php|bat|sh|py|rb|cmd|ps1|vbs|svg)$/i;

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) return { valid: false, error: `File type not allowed. Use JPG, PNG, or WEBP.` };
  if (file.size > MAX_MB * 1024 * 1024)  return { valid: false, error: `Max ${MAX_MB}MB per image.` };
  if (DANGER_EXT.test(file.name))         return { valid: false, error: 'Dangerous file extension.' };
  return { valid: true };
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
export function buildWhatsAppUrl(phone: string, message: string): string {
  const safe = phone.replace(/[^0-9+]/g, ''); // strip to digits + plus only
  return `https://wa.me/${safe}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppMessage(title: string, url: string): string {
  // Sanitize title before embedding in message
  const safeTitle = title.replace(/[<>"'`]/g, '').slice(0, 100);
  return `Hi! I'm interested in your listing on Easy Deals LMG:\n\n📦 *${safeTitle}*\n🔗 ${url}\n\nIs this still available?`;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function getPaginationRange(current: number, total: number, delta = 2): (number | '...')[] {
  const range: number[] = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) range.push(i);
  if (current - delta > 2)       range.unshift(-1);
  if (current + delta < total - 1) range.push(-1);
  range.unshift(1);
  if (total > 1) range.push(total);
  return range.map((n) => (n === -1 ? '...' : n));
}

// ── Firebase error messages (never expose internal codes) ─────────────────────
export function getFirebaseErrorMessage(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use':                      'An account with this email already exists.',
    'auth/wrong-password':                            'Invalid email or password.',
    'auth/user-not-found':                            'Invalid email or password.', // same — no enumeration
    'auth/too-many-requests':                         'Too many attempts. Try again later.',
    'auth/weak-password':                             'Password is too weak.',
    'auth/invalid-email':                             'Invalid email address.',
    'auth/network-request-failed':                    'Network error. Check your connection.',
    'auth/popup-closed-by-user':                      'Sign-in popup was closed.',
    'auth/account-exists-with-different-credential': 'Account exists with a different login method.',
  };
  return map[code] ?? 'An unexpected error occurred. Please try again.';
}