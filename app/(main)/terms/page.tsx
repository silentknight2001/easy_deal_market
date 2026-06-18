// app/(main)/terms/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms & Conditions | Easy Deals LMG' };

const SECTIONS = [
  { title: '1. Acceptance of Terms', content: 'By accessing or using Easy Deals LMG, you agree to be bound by these Terms. If you do not agree, do not use our platform.' },
  { title: '2. Eligibility', content: 'You must be at least 18 years old to create an account. By registering, you confirm all information provided is accurate and truthful.' },
  { title: '3. Seller Responsibilities', content: '• Provide accurate and honest product descriptions\n• Upload genuine photographs of your actual product\n• Disclose all defects and issues\n• Not list stolen, counterfeit, prohibited, or illegal items\n• Comply with all applicable Indian laws' },
  { title: '4. Buyer Responsibilities', content: '• Inspect products in person before completing payment\n• Never pay in advance without seeing the product\n• Conduct transactions in public, safe locations\n• Report suspicious listings immediately' },
  { title: '5. Prohibited Items', content: 'Strictly prohibited: stolen goods, counterfeit products, weapons, drugs, adult content, government IDs, financial instruments, or any item whose sale is prohibited under Indian law. Violations result in immediate account termination.' },
  { title: '6. Commission & Fees', content: 'Easy Deals LMG charges a commission on successful transactions from both buyers and sellers. Listing your product is free. Commission rates vary by category and will be disclosed before any transaction.' },
  { title: '7. Limitation of Liability', content: 'Easy Deals LMG acts as an intermediary platform and is not a party to transactions between buyers and sellers. We are not responsible for the quality, safety, or legality of listed products.' },
  { title: '8. Intellectual Property', content: 'All content on Easy Deals LMG including logos, design, and software is owned by Easy Deals LMG. By uploading product photos, you grant us a license to display them on the platform.' },
  { title: '9. Account Termination', content: 'We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or harm our community.' },
  { title: '10. Governing Law', content: 'These terms are governed by the laws of India, including the Information Technology Act 2000 and Consumer Protection Act 2019. Disputes shall be subject to courts in Silchar, Assam, India.' },
  { title: '11. Contact', content: 'Email: legal@easydealslmg.com\nWhatsApp: +91 98765 43210\nAddress: Easy Deals LMG, Silchar, Cachar, Assam – 788001' },
];

export default function TermsPage() {
  return (
    <div className="py-16">
      <div className="section-container max-w-3xl">
        <div className="mb-10">
          <h1 className="section-heading mb-3">Terms & Conditions</h1>
          <p className="text-surface-500">Last updated: January 1, 2024</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-8 space-y-8">
          <p className="text-surface-600 leading-relaxed border-l-4 border-brand-500 pl-4">
            Please read these Terms carefully before using Easy Deals LMG. By using our platform, you agree to these terms in full.
          </p>
          {SECTIONS.map(({ title, content }) => (
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