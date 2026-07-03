// components/layout/Footer.tsx
import Link from 'next/link';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

// Static data — no user input
const LINKS = {
  Platform: [
    { href: '/products',   label: 'Browse Products'  },
    { href: '/sell',       label: 'Sell Your Product' },
    { href: '/categories', label: 'Categories'        },
  ],
  Company: [
    { href: '/about',   label: 'About Us'  },
    { href: '/contact', label: 'Contact Us'},
    { href: '/faq',     label: 'FAQ'       },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy'    },
    { href: '/terms',   label: 'Terms & Conditions'},
  ],
} as const;

const CITIES  = ['Silchar','Guwahati','Cachar','Dibrugarh','Jorhat','Tezpur','Nagaon','Karimganj'] as const;
const WA_NUM  = '+919876543210';
const WA_URL  = `https://wa.me/${WA_NUM.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi! I need help with Easy Deals LMG')}`;

export function Footer() {
  return (
    <footer className="bg-surface-950 text-surface-300" role="contentinfo">
      <div className="section-container pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm" aria-hidden>ED</span>
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white leading-none block">Easy Deals</span>
                <span className="text-[10px] text-brand-400 font-semibold tracking-widest uppercase">LMG</span>
              </div>
            </div>
            <p className="text-sm text-surface-400 leading-relaxed mb-5">
              Trusted second-hand marketplace connecting buyers and sellers across Assam.
            </p>
            <address className="not-italic space-y-2.5">
              {[
                { icon: MapPin,  text: 'Silchar, Cachar, Assam'      },
                { icon: Phone,   text: '+91 98765 43210',             href: 'tel:+919876543210'             },
                { icon: Mail,    text: 'hello@easydealslmg.com',      href: 'mailto:hello@easydealslmg.com' },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-surface-400">
                  <Icon size={14} className="text-brand-400 flex-shrink-0" aria-hidden />
                  {href
                    ? <a href={href} className="hover:text-white transition-colors">{text}</a>
                    : <span>{text}</span>}
                </div>
              ))}
            </address>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{section}</h3>
              <ul className="space-y-2.5" role="list">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-surface-400 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Service areas */}
        <div className="border-t border-surface-800 pt-8 mb-8">
          <p className="text-xs text-surface-500 mb-3 font-medium uppercase tracking-wider">Service Areas</p>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => (
              <Link key={city} href={`/products?city=${encodeURIComponent(city)}`}
                className="px-3 py-1 bg-surface-800 rounded-full text-xs text-surface-400 hover:bg-surface-700 hover:text-surface-200 transition-colors">
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-surface-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} Easy Deals LMG. All rights reserved.
          </p>
          <a href={WA_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-xl text-xs font-semibold hover:bg-[#20b558] transition-colors"
            aria-label="Contact us on WhatsApp">
            <MessageCircle size={14} aria-hidden /> WhatsApp Us
          </a>
        </div>
      </div>
    </footer>
  );
}