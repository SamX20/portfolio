'use client';

import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { ContactInfo, Locale, SocialLink } from '@/types';
import ScrollReveal from './ScrollReveal';

interface ContactProps {
  contacts?: ContactInfo[];
  socialLinks?: SocialLink[];
  locale: Locale;
}

export default function Contact({ contacts = [], socialLinks = [], locale }: ContactProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const isAr = locale === 'ar';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xqewrlbl', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed');
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="border-t border-white/10 bg-[#0b0b0b] px-4 py-24 sm:px-6 lg:px-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <ScrollReveal variant={isAr ? 'right' : 'left'}>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.34em] text-[#8ed8ff]">
            {isAr ? 'ابدأ مشروعك' : 'Contact'}
          </p>
          <h2 className="text-4xl font-black leading-none text-white sm:text-6xl">
            {isAr ? 'لديك فكرة تحتاج إلى حركة؟' : 'Have a frame that needs a pulse?'}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/60">
            {isAr
              ? 'أرسل تفاصيل المشروع، نوع الفيديو، المدة المتوقعة، وأي مراجع بصرية تحبها. سأعود إليك برد واضح وخطوة عملية.'
              : 'Send the project idea, references, or video type. The new admin lets you keep this entire page updated without touching code.'}
          </p>

          <div className="mt-10 space-y-3">
            {contacts.map((item) => (
              <a
                key={item.id}
                href={item.href || '#'}
                className="flex items-center justify-between border border-white/10 px-4 py-4 text-white/68 transition hover:border-[#8ed8ff]/55 hover:text-white"
              >
                <span className="text-sm font-bold">{item.title}</span>
                <span className="text-sm" dir={item.id === 'phone' ? 'ltr' : undefined}>{item.content}</span>
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/54 transition hover:border-white/35 hover:text-white"
              >
                {social.name}
              </a>
            ))}
          </div>
        </ScrollReveal>

        <motion.form
          onSubmit={handleSubmit}
          className="scroll-reveal scroll-reveal-scale grid gap-4 border border-white/10 bg-white/[0.025] p-5 sm:p-7"
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.25 }}
          initial={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="name" required placeholder={isAr ? 'الاسم الكامل' : 'Name'} className="h-12 border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#8ed8ff]/70" />
            <input name="email" type="email" required placeholder={isAr ? 'البريد الإلكتروني' : 'Email'} className="h-12 border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#8ed8ff]/70" />
          </div>
          <input name="subject" required placeholder={isAr ? 'نوع العمل المطلوب' : 'Project type'} className="h-12 border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#8ed8ff]/70" />
          <textarea name="message" required rows={7} placeholder={isAr ? 'اكتب نبذة عن الفكرة، المنصة، المدة، الموعد النهائي، والاتجاه البصري المطلوب...' : 'Tell me about the video, length, deadline, and style...'} className="resize-none border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#8ed8ff]/70" />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="accent-gradient h-13 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#090909] transition hover:brightness-110 disabled:opacity-50"
          >
            {status === 'sending' ? (isAr ? 'جاري الإرسال...' : 'Sending...') : isAr ? 'إرسال الطلب' : 'Send brief'}
          </button>
          {status === 'sent' && <p className="text-sm text-[#8ed8ff]">{isAr ? 'وصلت الرسالة. سأعود إليك قريباً.' : 'Message sent. Sam will get back to you soon.'}</p>}
          {status === 'error' && <p className="text-sm text-red-300">{isAr ? 'حدث خطأ أثناء الإرسال. حاول مرة أخرى.' : 'Something went wrong. Please try again.'}</p>}
        </motion.form>
      </div>
    </section>
  );
}
