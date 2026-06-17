// app/(main)/contact/page.tsx
import type { Metadata } from 'next';
import { ContactForm } from './ContactForm';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Easy Deals LMG',
  description: "Get in touch with Easy Deals LMG. We're here to help with buying, selling, or any questions about our second-hand marketplace.",
};

const CONTACT_DETAILS = [
  { icon: MapPin,        label: 'Address',  value: 'Silchar, Cachar District, Assam – 788001' },
  { icon: Phone,         label: 'Phone',    value: '+91 98765 43210'                          },
  { icon: Mail,          label: 'Email',    value: 'hello@easydealslmg.com'                   },
  { icon: Clock,         label: 'Hours',    value: 'Mon–Sat: 9AM – 8PM IST'                  },
  { icon: MessageCircle, label: 'WhatsApp', value: '+91 98765 43210'                          },
];

export default function ContactPage() {
  return (
    <div className="py-16">
      <div className="section-container">
        <div className="text-center mb-14">
          <h1 className="section-heading">Get in Touch</h1>
          <p className="section-subheading mx-auto">
            Have a question, want to sell, or need help? We&apos;re here for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-12">
          <div>
            <h2 className="font-display text-2xl font-bold text-surface-900 mb-8">Contact Information</h2>
            <div className="space-y-6">
              {CONTACT_DETAILS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-surface-900 font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/10 rounded-2xl border border-[#25D366]/20">
              <h3 className="font-display text-xl font-bold text-surface-900 mb-2">
                💬 Fastest Response on WhatsApp
              </h3>
              <p className="text-sm text-surface-500 mb-4">
                Chat with us directly on WhatsApp for immediate assistance.
              </p>
              <a
                href="https://wa.me/919876543210?text=Hi!%20I%20need%20help%20with%20Easy%20Deals%20LMG"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#20b558] transition-colors"
              >
                <MessageCircle size={18} />
                Open WhatsApp Chat
              </a>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-surface-900 mb-4">We Serve</h3>
              <div className="flex flex-wrap gap-2">
                {['Silchar','Guwahati','Cachar','Dibrugarh','Jorhat','Tezpur','Nagaon','Karimganj'].map((city) => (
                  <span key={city} className="badge badge-surface">📍 {city}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-surface-100 p-8 shadow-card h-fit">
            <h2 className="font-display text-xl font-bold text-surface-900 mb-6">Send a Message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}