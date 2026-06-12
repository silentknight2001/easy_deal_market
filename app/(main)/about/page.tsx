// app/(main)/about/page.tsx
import type { Metadata } from 'next';
import { ShieldCheck, Zap, Users, Heart, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title:       'About Us | Easy Deals LMG',
  description: "Learn about Easy Deals LMG — Assam's trusted second-hand marketplace connecting buyers and sellers in Silchar, Guwahati, and across Assam.",
};

export default function AboutPage() {
  const team = [
    { name: 'Rahul Ahmed',   role: 'Founder & CEO',      img: '👨‍💼', location: 'Silchar'  },
    { name: 'Priya Das',     role: 'Operations Head',    img: '👩‍💼', location: 'Guwahati' },
    { name: 'Imran Hussain', role: 'Tech Lead',          img: '👨‍💻', location: 'Silchar'  },
    { name: 'Ananya Sharma', role: 'Customer Relations', img: '👩‍💻', location: 'Cachar'   },
  ];

  const values = [
    { icon: ShieldCheck, title: 'Trust & Safety', desc: 'Every seller is verified. Every listing reviewed. We prioritize your safety above all.' },
    { icon: Zap,         title: 'Speed',          desc: 'List in 2 minutes. Connect with buyers same day. Get paid fast.' },
    { icon: Users,       title: 'Community',      desc: 'Built for Assam, by Assam. Serving our local community first.' },
    { icon: Heart,       title: 'Fairness',       desc: 'Transparent commissions. Fair prices. No hidden charges ever.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-surface-950 via-surface-900 to-brand-900 text-white py-24">
        <div className="section-container text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/20 border border-brand-500/30 rounded-full text-brand-300 text-sm font-semibold mb-6">
            🏠 Founded in Silchar, Assam
          </div>
          <h1 className="font-display text-5xl font-bold mb-6">
            Assam&apos;s Most Trusted<br />
            <span className="text-brand-400">Second-Hand Marketplace</span>
          </h1>
          <p className="text-surface-300 text-xl leading-relaxed">
            Easy Deals LMG was born from a simple idea: make buying and selling second-hand
            products in Assam safe, fast, and fair.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-16">
        <div className="section-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '1,000+', label: 'Happy Customers', icon: '😊' },
              { value: '500+',   label: 'Products Sold',   icon: '📦' },
              { value: '8+',     label: 'Cities Covered',  icon: '📍' },
              { value: '4.9★',   label: 'Average Rating',  icon: '⭐' },
            ].map(({ value, label, icon }) => (
              <div key={label} className="text-center p-6 bg-surface-50 rounded-2xl border border-surface-100">
                <span className="text-4xl block mb-3">{icon}</span>
                <p className="font-display text-4xl font-bold text-surface-900 mb-1">{value}</p>
                <p className="text-sm text-surface-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-surface-50">
        <div className="section-container max-w-3xl mx-auto text-center">
          <h2 className="section-heading mb-6">Our Story</h2>
          <div className="space-y-5 text-surface-600 text-lg leading-relaxed text-left">
            <p>
              Easy Deals LMG started in 2022 in Silchar when our founder realized how
              difficult it was to safely buy and sell second-hand products locally.
              People were losing money to scammers and struggling to find genuine buyers.
            </p>
            <p>
              We built Easy Deals LMG to fix this. By acting as a trusted middleman,
              verifying sellers, reviewing every listing, and ensuring safe transactions
              — we&apos;ve created a marketplace that Assam can trust.
            </p>
            <p>
              Today, we&apos;re proud to serve thousands of families across Silchar,
              Guwahati, Cachar, and beyond — helping them turn old products into cash.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <h2 className="section-heading text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 bg-surface-50 rounded-2xl border border-surface-100 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-brand-500" />
                </div>
                <h3 className="font-display font-bold text-surface-900 mb-2">{title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-surface-50">
        <div className="section-container">
          <h2 className="section-heading text-center mb-12">Meet the Team</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {team.map(({ name, role, img, location }) => (
              <div key={name} className="text-center p-6 bg-white rounded-2xl border border-surface-100 shadow-card">
                <div className="text-5xl mb-3">{img}</div>
                <h3 className="font-semibold text-surface-900 text-sm">{name}</h3>
                <p className="text-xs text-brand-600 font-medium mt-0.5">{role}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <MapPin size={10} className="text-surface-400" />
                  <p className="text-xs text-surface-400">{location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}