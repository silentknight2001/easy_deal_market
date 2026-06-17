// app/(main)/contact/ContactForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { contactSchema } from '@/lib/validations/schemas';
import axios from 'axios';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import type { z } from 'zod';

type FormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await axios.post('/api/contact', data);
      toast.success("Message sent! We'll reply within 24 hours.");
      setSent(true);
      reset();
    } catch {
      toast.error('Failed to send. Please try WhatsApp instead.');
    }
  };

  if (sent) {
    return (
      <div className="text-center py-8">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-surface-900 mb-2">Message Received!</h3>
        <p className="text-surface-500">We&apos;ll get back to you within 24 hours.</p>
        <button onClick={() => setSent(false)} className="btn-ghost mt-4 text-sm text-brand-600">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-surface-700 mb-1.5" htmlFor="contact-name">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input id="contact-name" {...register('name')} placeholder="Your name"
            className={cn('input-base', errors.name && 'input-error')} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-surface-700 mb-1.5" htmlFor="contact-phone">Phone</label>
          <input id="contact-phone" type="tel" {...register('phone')} placeholder="+91 98765 43210" className="input-base" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-surface-700 mb-1.5" htmlFor="contact-email">
          Email <span className="text-red-500">*</span>
        </label>
        <input id="contact-email" type="email" {...register('email')} placeholder="you@example.com"
          className={cn('input-base', errors.email && 'input-error')} />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-surface-700 mb-1.5" htmlFor="contact-subject">
          Subject <span className="text-red-500">*</span>
        </label>
        <select id="contact-subject" {...register('subject')} className={cn('input-base', errors.subject && 'input-error')}>
          <option value="">Select a topic</option>
          <option value="I want to sell a product">I want to sell a product</option>
          <option value="I want to buy a product">I want to buy a product</option>
          <option value="Account issue">Account issue</option>
          <option value="Report a scam">Report a scam</option>
          <option value="Commission/payment query">Commission/payment query</option>
          <option value="General enquiry">General enquiry</option>
        </select>
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-surface-700 mb-1.5" htmlFor="contact-message">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea id="contact-message" {...register('message')} rows={5}
          placeholder="Describe your query in detail…"
          className={cn('input-base resize-none', errors.message && 'input-error')} maxLength={2000} />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5">
        {isSubmitting
          ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
          : <><Send size={16} /> Send Message</>}
      </button>
    </form>
  );
}