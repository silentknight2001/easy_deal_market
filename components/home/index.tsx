// components/home/index.tsx
'use client';

import { motion }         from 'framer-motion';
import Link               from 'next/link';
import { AlertTriangle }  from 'lucide-react';
import { SERVICE_AREAS }  from '@/types';

// ── HowItWorks ────────────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, emoji: '📸', title: 'List Your Product',   desc: 'Upload photos and details. Takes just 2 minutes.' },
  { num: 2, emoji: '✅', title: 'Get Verified',        desc: 'Our team reviews your listing for quality.' },
  { num: 3, emoji: '🤝', title: 'Connect with Buyers', desc: 'Buyers contact you directly via WhatsApp.' },
  { num: 4, emoji: '💰', title: 'Get Paid Fast',       desc: 'Complete the deal and receive instant payment.' },
] as const;

export function HowItWorks() {
  return (
    <section className="py-20 bg-white" aria-labelledby="how-heading">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 id="how-heading" className="section-heading">How It Works</h2>
          <p className="section-subheading mx-auto">Selling your old products is simple, safe, and fast</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map(({ num, emoji, title, desc }, i) => (
            <motion.div key={num}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="relative text-center">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+3rem)] right-0 h-0.5 bg-gradient-to-r from-brand-200 to-transparent" aria-hidden />
              )}
              <div className="w-16 h-16 rounded-2xl bg-brand-50 border-2 border-brand-200 flex items-center justify-center mx-auto mb-4 text-3xl"
                role="img" aria-label={title}>
                {emoji}
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center" aria-hidden>
                {num}
              </div>
              <h3 className="font-display text-lg font-bold text-surface-900 mb-2">{title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ServiceAreas ──────────────────────────────────────────────────────────────
// Static data from types — no user input, safe from XSS
const AREA_COLORS = [
  'from-brand-50 to-brand-100',
  'from-accent-50 to-accent-100',
  'from-purple-50 to-purple-100',
  'from-yellow-50 to-yellow-100',
  'from-pink-50 to-pink-100',
  'from-blue-50 to-blue-100',
];

export function ServiceAreas() {
  return (
    <section className="py-20 bg-surface-50" aria-labelledby="areas-heading">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 id="areas-heading" className="section-heading">We Serve Across Assam</h2>
          <p className="section-subheading mx-auto">
            Sell used phone Silchar or find a second hand buyer Guwahati — we&apos;ve got you covered
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SERVICE_AREAS.map(({ name, district }, i) => (
            <motion.div key={name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}>
              {/* name comes from a hardcoded constant — safe for href */}
              <Link href={`/products?city=${encodeURIComponent(name)}`}
                className={`bg-gradient-to-br ${AREA_COLORS[i % AREA_COLORS.length]} rounded-2xl p-5 text-center hover:shadow-md transition-all duration-200 border border-white/80 block`}
                aria-label={`Browse products in ${name}`}>
                <span className="text-2xl mb-2 block" role="img" aria-hidden>📍</span>
                <h3 className="font-display font-bold text-surface-900 text-sm">{name}</h3>
                <p className="text-xs text-surface-500 mt-1 leading-tight">{district}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TestimonialsSection ───────────────────────────────────────────────────────
// Hardcoded testimonials — never from user input to prevent XSS
const TESTIMONIALS = [
  { name: 'Rahul Das',      location: 'Silchar',  rating: 5, text: 'Sold my old iPhone in 2 days! Got ₹18,000. Process was super smooth.' },
  { name: 'Priya Sharma',   location: 'Guwahati', rating: 5, text: 'Bought a used laptop in excellent condition at a fair price. Great platform!' },
  { name: 'Deep Das',  location: 'Delhi',   rating: 5, text: 'Sold my old bike within 3 days. Amazing service!' },
  { name: 'Ananya Goswami', location: 'Silchar',  rating: 5, text: 'Very professional and trustworthy team. Helped me get the right price.' },
] as const;

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-surface-950" aria-labelledby="testimonials-heading">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 id="testimonials-heading" className="section-heading text-white">What Our Customers Say</h2>
          <p className="text-surface-400 mt-3 text-lg">1,000+ satisfied buyers and sellers trust Easy Deals LMG</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map(({ name, location, rating, text }, i) => (
            <motion.div key={name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} viewport={{ once: true }}
              className="bg-surface-900 rounded-2xl p-6 border border-surface-800">
              <div className="flex mb-3" role="img" aria-label={`${rating} out of 5 stars`}>
                {Array.from({ length: rating }).map((_, j) => (
                  <span key={j} className="text-yellow-400 text-sm" aria-hidden>★</span>
                ))}
              </div>
              {/* Static text — never dangerouslySetInnerHTML */}
              <p className="text-surface-300 text-sm leading-relaxed mb-4">&quot;{text}&quot;</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold" aria-hidden>
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-surface-500">{location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ScamNotice ────────────────────────────────────────────────────────────────
const SCAM_TIPS = [
  'Never pay anyone upfront before seeing the product in person',
  'Always meet in a public, well-lit location for exchanges',
  'Easy Deals LMG will never ask for your bank OTP or password',
  'Report suspicious listings immediately using the Report button',
  'All verified sellers have a blue checkmark on their profile',
] as const;

export function ScamNotice() {
  return (
    <section className="py-12 bg-red-50 border-y border-red-100" aria-label="Scam prevention notice">
      <div className="section-container">
        <div className="flex gap-4 items-start max-w-4xl mx-auto">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={20} className="text-red-600" aria-hidden />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-red-800 mb-2">⚠️ Scam Prevention Notice</h3>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              {SCAM_TIPS.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTASection ────────────────────────────────────────────────────────────────
export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-brand-500 to-brand-700" aria-label="Call to action">
      <div className="section-container text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Ready to Turn Clutter Into Cash?
          </h2>
          <p className="text-brand-100 text-xl mb-10 max-w-2xl mx-auto">
            List your old product in under 2 minutes. Our team will help you sell it fast.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sell"
              className="px-8 py-4 bg-white text-brand-600 font-bold rounded-xl hover:bg-brand-50 transition-colors text-base shadow-lg">
              Start Selling Today
            </Link>
            <Link href="/products"
              className="px-8 py-4 bg-brand-600 text-white font-bold rounded-xl border-2 border-brand-300 hover:bg-brand-700 transition-colors text-base">
              Browse Products
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}