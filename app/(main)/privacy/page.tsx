// app/(main)/privacy/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy | Easy Deals LMG' };

export default function PrivacyPage() {
  const sections = [
    { title: '1. Information We Collect', content: `We collect the following types of information:\n\n• Account Information: Name, email address, phone number, and profile photo when you create an account.\n• Listing Information: Product details, photos, location, and price when you create a listing.\n• Usage Data: Pages visited, features used, search queries, and time spent on the platform.\n• Device Information: IP address, browser type, operating system, and device identifiers.\n• Communications: Messages sent through our contact forms and support channels.` },
    { title: '2. How We Use Your Information', content: `We use collected information to:\n\n• Create and manage your account\n• Display your listings to potential buyers\n• Facilitate communication between buyers and sellers\n• Verify seller identity and prevent fraud\n• Send notifications about your listings and bookings\n• Improve our platform and user experience\n• Comply with legal obligations` },
    { title: '3. Data Sharing', content: `We do not sell your personal data. We share information only:\n\n• With other users as needed (e.g., your name and city are shown on listings)\n• With Firebase/Google (our cloud infrastructure provider)\n• With Razorpay (payment processing)\n• With law enforcement when required by law` },
    { title: '4. Data Security', content: `We implement industry-standard security measures including:\n\n• HTTPS encryption for all data in transit\n• Firebase security rules protecting your data at rest\n• HTTP-only secure session cookies\n• Role-based access controls\n• Input validation and sanitization to prevent XSS and injection attacks` },
    { title: '5. Your Rights', content: `You have the right to:\n\n• Access your personal data\n• Correct inaccurate data\n• Delete your account and associated data\n• Opt out of marketing communications\n\nTo exercise these rights, contact us at privacy@easydealslmg.com` },
    { title: '6. Cookies', content: `We use:\n\n• Essential cookies: For authentication sessions (HTTP-only)\n• Analytics cookies: To understand how the platform is used (anonymized)\n• Preference cookies: To remember your settings` },
    { title: '7. Data Retention', content: `We retain your data for as long as your account is active. Upon deletion, account data is deleted within 7 business days. Transaction logs are retained for 7 years as required by Indian law.` },
    { title: '8. Contact Us', content: `For privacy-related queries:\n\nEmail: privacy@easydealslmg.com\nWhatsApp: +91 98765 43210\nAddress: Easy Deals LMG, Silchar, Cachar, Assam – 788001` },
  ];

  return (
    <div className="py-16">
      <div className="section-container max-w-3xl">
        <div className="mb-10">
          <h1 className="section-heading mb-3">Privacy Policy</h1>
          <p className="text-surface-500">Last updated: January 1, 2024</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-8 space-y-8">
          <p className="text-surface-600 leading-relaxed border-l-4 border-brand-500 pl-4">
            Easy Deals LMG is committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information when you use our marketplace platform.
          </p>
          {sections.map(({ title, content }) => (
            <div key={title}>
              <h2 className="font-display text-lg font-bold text-surface-900 mb-3">{title}</h2>
              <p className="text-surface-600 text-sm leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}