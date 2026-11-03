'use client';

import { FormEvent, useState } from 'react';
import { LuArrowUpRight } from 'react-icons/lu';
import { DynamicIcon } from '@/lib/icons';
import { ContactInfo, Locale, Service, SocialLink } from '@/types';
import ScrollReveal from './ScrollReveal';
import { serviceTitle } from './Services';

interface ContactProps {
  contacts?: ContactInfo[];
  socialLinks?: SocialLink[];
  services?: Service[];
  selectedService?: string;
  locale: Locale;
}

const contactLabels: Record<string, { en: string; ar: string }> = {
  phone: { en: 'Phone', ar: 'الهاتف' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  location: { en: 'Location', ar: 'الموقع' },
  hours: { en: 'Working hours', ar: 'ساعات العمل' },
};

export default function Contact({ contacts = [], socialLinks = [], services = [], selectedService = '', locale }: ContactProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const isAr = locale === 'ar';
  const serviceOptions = services
    .filter((service) => service.featured !== false)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((service) => serviceTitle(service, isAr));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');
    const form = event.currentTarget;
    const fields = new FormData(form);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.get('name'),
          email: fields.get('email'),
          service: fields.get('subject'),
          message: fields.get('message'),
          website: fields.get('website'),
          locale,
        }),
      });
      if (!response.ok) throw new Error('Failed');
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="site-section" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container-x">
        <ScrollReveal>
          <p className="eyebrow">{isAr ? 'تواصل' : 'Contact'}</p>
          <h2 className="display mt-6 max-w-5xl text-[clamp(2.75rem,8vw,7rem)]">
            {isAr ? 'لنصنع شيئاً مميزاً.' : "Let's build something great."}
          </h2>
        </ScrollReveal>

        <div className="mt-20 grid gap-16 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
          <ScrollReveal delay={60}>
            <div className="space-y-1">
              {contacts.map((item) => (
                <a
                  key={item.id}
                  href={item.href && item.href !== '#' ? item.href : undefined}
                  className="group flex items-center gap-4 border-b border-[var(--line)] py-5"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line-strong)] transition group-hover:border-[var(--foreground)]">
                    <DynamicIcon value={item.icon} hints={[item.id, item.title, item.href]} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-[var(--muted)]">{contactLabels[item.id]?.[locale] || item.title}</span>
                    <span className="block truncate text-base" dir={/tel:/.test(item.href) ? 'ltr' : undefined}>{item.content}</span>
                  </span>
                </a>
              ))}
            </div>

            {socialLinks.length > 0 ? (
              <div className="mt-10 flex flex-wrap gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line-strong)] text-[var(--muted)] transition hover:border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]"
                  >
                    <DynamicIcon value={social.icon} hints={[social.id, social.name, social.url]} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <form onSubmit={handleSubmit} className="grid gap-6">
              {/* Honeypot for spam bots — hidden from people and screen readers */}
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <div className="grid gap-6 sm:grid-cols-2">
                <input name="name" required placeholder={isAr ? 'الاسم' : 'Your name'} className="field" />
                <input name="email" type="email" required placeholder={isAr ? 'البريد الإلكتروني' : 'Email'} className="field" />
              </div>
              {serviceOptions.length > 0 ? (
                <select key={selectedService} name="subject" required defaultValue={selectedService} className="field">
                  <option value="" disabled>{isAr ? 'اختر الخدمة' : 'What do you need?'}</option>
                  {serviceOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value={isAr ? 'أخرى' : 'Other'}>{isAr ? 'أخرى' : 'Other'}</option>
                </select>
              ) : (
                <input name="subject" required placeholder={isAr ? 'نوع المشروع' : 'Project type'} className="field" />
              )}
              <textarea name="message" required rows={5} placeholder={isAr ? 'حدثنا عن مشروعك...' : 'Tell us about your project...'} className="field" />
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button type="submit" disabled={status === 'sending'} className="btn btn-primary h-12 px-6 disabled:opacity-50">
                  {status === 'sending' ? (isAr ? 'جاري الإرسال...' : 'Sending...') : isAr ? 'أرسل' : 'Send message'}
                  <LuArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
                </button>
                {status === 'sent' && <p className="text-sm text-[var(--muted)]">{isAr ? 'وصلت رسالتك، سنعود إليك قريباً.' : "Thanks — we'll be in touch soon."}</p>}
                {status === 'error' && <p className="text-sm text-red-300">{isAr ? 'حدث خطأ، حاول مرة أخرى.' : 'Something went wrong. Please try again.'}</p>}
              </div>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
