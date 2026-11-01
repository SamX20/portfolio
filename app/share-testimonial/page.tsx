'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ShareClient {
  id: string;
  name: string;
}

type TestimonialLocale = 'en' | 'ar';

const logoUrl = '/WhatsApp Image 2026-07-04 at 12.41.26 AM.jpeg';

const copy = {
  en: {
    back: 'Xsamer',
    toggle: 'AR',
    title: 'How was working with us?',
    description: 'A few honest lines help future clients understand the process, the communication, and the final result.',
    traits: ['Fast', 'Clear', 'Polished'],
    sentLabel: 'Sent',
    sentTitle: 'Thank you.',
    sentText: 'Your testimonial is saved and will appear on our site.',
    addAnother: 'Add another',
    name: 'Name',
    company: 'Company / Brand',
    chooseCompany: 'Choose company',
    otherCompany: 'Other / not listed',
    writeCompany: 'Write company name',
    role: 'Role',
    rolePlaceholder: 'Founder, Marketing Manager...',
    email: 'Email',
    optional: 'Optional',
    rating: 'Rating',
    experience: 'Your experience',
    experiencePlaceholder: 'What was it like to work together? What did the result change for you?',
    sending: 'Sending...',
    submit: 'Send testimonial',
    fallbackError: 'Could not send your testimonial.',
  },
  ar: {
    back: 'Xsamer',
    toggle: 'EN',
    title: 'كيف كانت تجربتك معنا؟',
    description: 'كلمات بسيطة وصادقة تساعد العملاء القادمين على فهم أسلوب العمل، التواصل، وجودة النتيجة النهائية.',
    traits: ['سريع', 'واضح', 'احترافي'],
    sentLabel: 'تم الإرسال',
    sentTitle: 'شكرا لك.',
    sentText: 'تم حفظ رأيك وسيظهر على موقعنا.',
    addAnother: 'إضافة رأي آخر',
    name: 'الاسم',
    company: 'الشركة / العلامة',
    chooseCompany: 'اختر الشركة',
    otherCompany: 'شركة غير موجودة',
    writeCompany: 'اكتب اسم الشركة',
    role: 'الدور',
    rolePlaceholder: 'مؤسس، مدير تسويق...',
    email: 'البريد الإلكتروني',
    optional: 'اختياري',
    rating: 'التقييم',
    experience: 'تجربتك',
    experiencePlaceholder: 'كيف كانت تجربة العمل؟ وما الذي غيّرته النتيجة بالنسبة لك؟',
    sending: 'جار الإرسال...',
    submit: 'إرسال الرأي',
    fallbackError: 'تعذر إرسال الرأي.',
  },
};

export default function ShareTestimonialPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<TestimonialLocale>('en');
  const [clients, setClients] = useState<ShareClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<'idle' | 'saving'>('idle');
  const [error, setError] = useState('');
  const t = copy[locale];
  const isAr = locale === 'ar';

  useEffect(() => {
    const requestedLocale = new URLSearchParams(window.location.search).get('lang');
    if (requestedLocale === 'ar' || requestedLocale === 'en') {
      setLocale(requestedLocale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  }, [isAr, locale]);

  useEffect(() => {
    fetch('/api/clients')
      .then((response) => response.json())
      .then((data) => setClients(Array.isArray(data.clients) ? data.clients.filter((client: ShareClient) => client.name) : []))
      .catch(() => setClients([]));
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('saving');
    setError('');

    const form = new FormData(event.currentTarget);
    const selectedClient = clients.find((client) => client.id === selectedClientId);
    const company = selectedClient?.name || String(form.get('company') || '').trim();
    const payload = {
      name: form.get('name'),
      company,
      client_id: selectedClient?.id || null,
      role: form.get('role'),
      email: form.get('email'),
      content: form.get('content'),
      rating,
    };

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || t.fallbackError);

      event.currentTarget.reset();
      setSelectedClientId('');
      setRating(5);
      router.push(`/share-testimonial/thank-you?lang=${locale}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.fallbackError);
      setStatus('idle');
    }
  };

  const label = 'mb-1 block text-xs text-[var(--muted)]';

  return (
    <main className="min-h-screen" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="container-x flex h-16 items-center justify-between">
        <a href="/" className="text-[15px] font-semibold tracking-tight">{t.back}</a>
        <button type="button" onClick={() => setLocale(isAr ? 'en' : 'ar')} className="text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]">
          {isAr ? 'EN' : 'عربي'}
        </button>
      </header>

      <div className="container-x grid gap-16 py-16 lg:grid-cols-[1fr_1.15fr] lg:gap-24 lg:py-24">
        <section>
          <img src={logoUrl} alt="Xsamer logo" className="h-14 w-14 rounded-full object-cover" />
          <p className="eyebrow mt-10">{isAr ? 'آراء العملاء' : 'Testimonial'}</p>
          <h1 className="display mt-5 text-[clamp(2.5rem,6vw,4.75rem)]">{t.title}</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[var(--muted)]">{t.description}</p>
          <div className="mt-10 flex flex-wrap gap-2">
            {t.traits.map((item) => (
              <span key={item} className="chip">{item}</span>
            ))}
          </div>
        </section>

        <form onSubmit={submit} className="grid gap-7">
          <div className="grid gap-7 sm:grid-cols-2">
            <label className="block">
              <span className={label}>{t.name}</span>
              <input name="name" required className="field" />
            </label>
            <div className="grid gap-3">
              <label className="block">
                <span className={label}>{t.company}</span>
                <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)} required className="field">
                  <option value="">{t.chooseCompany}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                  <option value="other">{t.otherCompany}</option>
                </select>
              </label>
              {selectedClientId === 'other' && <input name="company" required placeholder={t.writeCompany} className="field" />}
            </div>
          </div>
          <div className="grid gap-7 sm:grid-cols-2">
            <label className="block">
              <span className={label}>{t.role}</span>
              <input name="role" placeholder={t.rolePlaceholder} className="field" />
            </label>
            <label className="block">
              <span className={label}>{t.email}</span>
              <input name="email" type="email" placeholder={t.optional} className="field" />
            </label>
          </div>
          <div>
            <span className={label}>{t.rating}</span>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`grid h-11 w-11 place-items-center rounded-full border transition ${
                    value <= rating ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]' : 'border-[var(--line-strong)] text-[var(--muted)]'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="m12 2 2.9 6.2 6.7.8-4.9 4.6 1.3 6.6-6-3.3-6 3.3 1.3-6.6L2.4 9l6.7-.8L12 2Z" />
                  </svg>
                  <span className="sr-only">{value}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className={label}>{t.experience}</span>
            <textarea name="content" required minLength={12} rows={6} placeholder={t.experiencePlaceholder} className="field" />
          </label>
          {error && <p className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <div>
            <button disabled={status === 'saving'} className="btn btn-primary h-12 px-6 disabled:opacity-50">
              {status === 'saving' ? t.sending : t.submit}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
