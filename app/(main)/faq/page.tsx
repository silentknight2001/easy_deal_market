// app/(main)/faq/page.tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const FAQS = [
  {
    category: 'Selling',
    items: [
      { q: 'How do I sell my product on Easy Deals LMG?', a: 'Click "Sell Your Product", fill in the product details and upload clear photos. Our team reviews and approves your listing within a few hours. Once approved, buyers can contact you directly.' },
      { q: 'Is it free to list a product?', a: 'Yes! Listing your product is completely free. We only charge a small commission after your product is successfully sold.' },
      { q: 'How much commission do you charge?', a: 'We charge a small commission from both the buyer and seller upon successful completion of a deal. Contact us for exact rates by category.' },
      { q: 'How long does approval take?', a: 'Most listings are reviewed and approved within 2–6 hours. During peak times it may take up to 24 hours.' },
      { q: "Can I edit my listing after it's posted?", a: 'Yes. However, edited listings will be re-submitted for approval to maintain quality standards.' },
    ],
  },
  {
    category: 'Buying',
    items: [
      { q: 'How do I contact a seller?', a: 'Each product listing has a "Chat on WhatsApp" button that connects you directly with the verified seller. You can also use our inquiry form.' },
      { q: 'Are the products genuine and as described?', a: 'We verify sellers and review all listings for accuracy. However, we strongly recommend inspecting the product in person before completing any payment.' },
      { q: 'What if the product is not as described?', a: 'You can report the listing using the Report button. Our team investigates all reports seriously.' },
    ],
  },
  {
    category: 'Safety',
    items: [
      { q: 'How do I stay safe when buying or selling?', a: 'Always meet in a public, well-lit place. Never pay before inspecting the product in person. Never share your bank OTP with anyone. Report any suspicious activity immediately.' },
      { q: 'What is a Verified Seller?', a: 'Verified Sellers have gone through our enhanced verification process including ID verification. Look for the blue shield badge.' },
      { q: 'What should I do if I get scammed?', a: 'Report the seller immediately using our Report button. Contact us via WhatsApp for urgent issues. Also file a complaint with your local police cybercrime unit.' },
    ],
  },
  {
    category: 'Account',
    items: [
      { q: 'Do I need an account to browse products?', a: 'No! You can browse all listings without an account. An account is required to sell, save to wishlist, or contact sellers.' },
      { q: 'How do I change my password?', a: 'Go to your Profile page and click "Change Password". You can also use "Forgot Password" on the login page to reset via email.' },
      { q: 'Can I delete my account?', a: "Yes. Contact us via WhatsApp or email and we'll delete your account and all associated data within 7 business days." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-surface-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-50 transition-colors"
        aria-expanded={open}>
        <span className="font-semibold text-surface-900 pr-4 text-sm">{q}</span>
        <ChevronDown size={18} className={cn('text-surface-400 flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <div className={cn('overflow-hidden transition-all duration-300', open ? 'max-h-96' : 'max-h-0')}>
        <p className="px-5 pb-5 text-sm text-surface-600 leading-relaxed border-t border-surface-100 pt-4">{a}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="py-16">
      <div className="section-container max-w-3xl">
        <div className="text-center mb-14">
          <h1 className="section-heading">Frequently Asked Questions</h1>
          <p className="section-subheading mx-auto">Everything you need to know about Easy Deals LMG</p>
        </div>

        <div className="space-y-10">
          {FAQS.map(({ category, items }) => (
            <div key={category}>
              <h2 className="font-display text-xl font-bold text-surface-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-brand-500 rounded-full" />{category}
              </h2>
              <div className="space-y-3">
                {items.map((item) => <FAQItem key={item.q} {...item} />)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 p-8 bg-brand-50 rounded-2xl border border-brand-100 text-center">
          <p className="font-display text-xl font-bold text-surface-900 mb-2">Still have questions?</p>
          <p className="text-surface-500 mb-5">We&apos;re happy to help. Reach out to us anytime.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact" className="btn-primary">Contact Us</Link>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#20b558] transition-colors">
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}