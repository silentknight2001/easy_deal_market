// lib/validations/schemas.ts
// Zod schemas — used both client-side (UX) and server-side (API routes)
// Server always re-validates independently — never trust client
import { z } from 'zod';

const strip  = (s: string) => s.replace(/<[^>]*>/g, '').trim();
const noScript = (s: string) => !/<script/i.test(s) && !/javascript:/i.test(s);

const safeStr = (min: number, max: number) =>
  z.string().min(min).max(max).transform(strip).refine(noScript, 'Invalid content');

const phone = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number');

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string().email().max(254).toLowerCase(),
  password: z.string().min(8).max(128),
});

export const registerSchema = z.object({
  email:           z.string().email().max(254).toLowerCase(),
  password:        z.string().min(8).max(128)
    .regex(/[A-Z]/,        'Requires uppercase')
    .regex(/[a-z]/,        'Requires lowercase')
    .regex(/[0-9]/,        'Requires number')
    .regex(/[^A-Za-z0-9]/,'Requires special character'),
  confirmPassword: z.string(),
  displayName:     z.string().min(2).max(60).regex(/^[a-zA-Z\s'-]+$/, 'Letters only').transform((s) => s.trim()),
  role:            z.enum(['buyer', 'seller']),
  agreeTerms:      z.literal(true, { errorMap: () => ({ message: 'Must accept terms' }) }),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

// ── Product ───────────────────────────────────────────────────────────────────
export const VALID_CATEGORIES = ['mobiles','laptops','tvs','furniture','bikes','electronics','home_appliances'] as const;
export const VALID_CONDITIONS  = ['like_new','good','fair','poor'] as const;

export const productSchema = z.object({
  title:          safeStr(5, 100),
  description:    safeStr(20, 2000),
  category:       z.enum(VALID_CATEGORIES),
  condition:      z.enum(VALID_CONDITIONS),
  price:          z.number().int().min(1).max(10_000_000),
  negotiable:     z.boolean().default(false),
  location:       safeStr(2, 200),
  city:           safeStr(2, 100),
  whatsappNumber: phone,
  tags:           z.array(z.string().max(30)).max(10).default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ── Booking ───────────────────────────────────────────────────────────────────
export const bookingSchema = z.object({
  productId:     z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  buyerPhone:    phone,
  buyerWhatsapp: phone,
  message:       safeStr(0, 500).optional(),
  offeredPrice:  z.number().int().min(1).max(10_000_000).optional(),
});

// ── Review ────────────────────────────────────────────────────────────────────
export const reviewSchema = z.object({
  sellerId:  z.string().min(1).max(128),
  productId: z.string().max(128).optional(),
  rating:    z.number().int().min(1).max(5),
  comment:   safeStr(10, 1000),
});

// ── Contact ───────────────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name:    safeStr(2, 100),
  email:   z.string().email().max(254).toLowerCase(),
  phone:   phone.optional().or(z.literal('')),
  subject: safeStr(5, 200),
  message: safeStr(20, 2000),
});

// ── Report ────────────────────────────────────────────────────────────────────
export const reportSchema = z.object({
  productId:   z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  type:        z.enum(['scam','spam','inappropriate','wrong_category','duplicate','other']),
  description: safeStr(10, 500),
});

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminProductActionSchema = z.object({
  productId: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  action:    z.enum(['approve','reject','remove']),
  note:      z.string().max(500).optional().transform((s) => s?.replace(/<[^>]*>/g, '').trim() ?? null),
});

export const adminUserActionSchema = z.object({
  uid:    z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  action: z.enum(['ban','suspend','restore','verify_seller']),
  reason: z.string().max(500).optional().transform((s) => s?.replace(/<[^>]*>/g, '').trim() ?? null),
});

// ── Search ────────────────────────────────────────────────────────────────────
export const searchSchema = z.object({
  q:         z.string().max(200).optional().transform((s) => s?.replace(/[<>"'`;]/g,'').trim()),
  category:  z.enum(VALID_CATEGORIES).optional(),
  city:      z.string().max(100).optional(),
  minPrice:  z.coerce.number().min(0).optional(),
  maxPrice:  z.coerce.number().max(10_000_000).optional(),
  condition: z.enum(VALID_CONDITIONS).optional(),
  sortBy:    z.enum(['newest','price_asc','price_desc','views']).optional(),
  page:      z.coerce.number().int().min(1).max(1000).default(1),
  limit:     z.coerce.number().int().min(1).max(50).default(12),
});

export type SearchParams = z.infer<typeof searchSchema>;