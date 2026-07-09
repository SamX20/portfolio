'use client';

import { FormEvent, useEffect, useState } from 'react';

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
    title: 'Share your experience working with Sam.',
    description: 'A few honest lines help future clients understand the process, the communication, and the final result.',
    traits: ['Fast', 'Clear', 'Polished'],
    sentLabel: 'Sent',
    sentTitle: 'Thank you.',
    sentText: "Your testimonial is now saved and will appear on Sam's portfolio.",
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
    experiencePlaceholder: 'What was it like to work together? What improved in the final video?',
    sending: 'Sending...',
    submit: 'Send testimonial',
    fallbackError: 'Could not send your testimonial.',
  },
  ar: {
    back: 'Xsamer',
    toggle: 'EN',
    title: 'شارك تجربتك في العمل مع سام.',
    description: 'كلمات بسيطة وصادقة تساعد العملاء القادمين على فهم أسلوب العمل، التواصل، وجودة النتيجة النهائية.',
    traits: ['سريع', 'واضح', 'احترافي'],
    sentLabel: 'تم الإرسال',
    sentTitle: 'شكرا لك.',
    sentText: 'تم حفظ رأيك وسيظهر في بورتفوليو سام.',
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
    experiencePlaceholder: 'كيف كانت تجربة العمل؟ وما الذي تحسن في الفيديو النهائي؟',
    sending: 'جار الإرسال...',
    submit: 'إرسال الرأي',
    fallbackError: 'تعذر إرسال الرأي.',
  },
};

export default function ShareTestimonialPage() {
  const [locale, setLocale] = useState<TestimonialLocale>('en');
  const [clients, setClients] = useState<ShareClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<'idle' | 'saving' | 'sent'>('idle');
  const [error, setError] = useState('');
  const t = copy[locale];
  const isAr = locale === 'ar';

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
      setStatus('sent');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.fallbackError);
      setStatus('idle');
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-10 text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_1.05fr]">
        <section>
          <div className="mb-7 flex items-center justify-between gap-4">
            <a href="/" className="inline-flex text-xs font-black uppercase tracking-[0.18em] text-[#8ed8ff]">
              {t.back}
            </a>
            <button
              type="button"
              onClick={() => setLocale(isAr ? 'en' : 'ar')}
              className="rounded-full border border-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/80 transition hover:border-[#8ed8ff]/60 hover:text-[#8ed8ff]"
            >
              {t.toggle}
            </button>
          </div>

          <div className={`flex flex-col items-start gap-6 ${isAr ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
            <div className="shrink-0">
              <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-black/40 sm:h-40 sm:w-40 lg:h-52 lg:w-52">
                <img src={logoUrl} alt="Xsamer logo" className="h-full w-full rounded-[1.5rem] object-cover" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">{t.title}</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/56">{t.description}</p>
              <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] text-center">
                {t.traits.map((item) => (
                  <div key={item} className="border-r border-white/10 px-4 py-4 last:border-r-0 rtl:border-l rtl:border-r-0 rtl:last:border-l-0">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-white/58">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/35 sm:p-7">
          {status === 'sent' ? (
            <div className="grid min-h-[440px] place-items-center text-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8ed8ff]">{t.sentLabel}</p>
                <h2 className="mt-3 text-3xl font-black">{t.sentTitle}</h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-white/55">{t.sentText}</p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-7 rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white/70 transition hover:border-[#8ed8ff]/50 hover:text-white"
                >
                  {t.addAnother}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">{t.name}</span>
                  <input name="name" required className="h-12 w-full border border-white/10 bg-black/25 px-4 text-sm outline-none transition focus:border-[#8ed8ff]/70" />
                </label>
                <div className="grid gap-3">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">{t.company}</span>
                    <select
                      value={selectedClientId}
                      onChange={(event) => setSelectedClientId(event.target.value)}
                      required
                      className="h-12 w-full border border-white/10 bg-black/25 px-4 text-sm outline-none transition focus:border-[#8ed8ff]/70"
                    >
                      <option value="">{t.chooseCompany}</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                      <option value="other">{t.otherCompany}</option>
                    </select>
                  </label>
                  {selectedClientId === 'other' && (
                    <input
                      name="company"
                      required
                      placeholder={t.writeCompany}
                      className="h-12 w-full border border-white/10 bg-black/25 px-4 text-sm outline-none transition placeholder:text-white/24 focus:border-[#8ed8ff]/70"
                    />
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">{t.role}</span>
                  <input name="role" placeholder={t.rolePlaceholder} className="h-12 w-full border border-white/10 bg-black/25 px-4 text-sm outline-none transition placeholder:text-white/24 focus:border-[#8ed8ff]/70" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">{t.email}</span>
                  <input name="email" type="email" placeholder={t.optional} className="h-12 w-full border border-white/10 bg-black/25 px-4 text-sm outline-none transition placeholder:text-white/24 focus:border-[#8ed8ff]/70" />
                </label>
              </div>
              <div>
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">{t.rating}</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`grid h-11 w-11 place-items-center rounded-full border text-sm font-black transition ${
                        value <= rating ? 'border-[#8ed8ff] bg-[#8ed8ff] text-[#05070b]' : 'border-white/10 bg-black/25 text-white/45'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                        <path d="m12 2 2.9 6.2 6.7.8-4.9 4.6 1.3 6.6-6-3.3-6 3.3 1.3-6.6L2.4 9l6.7-.8L12 2Z" />
                      </svg>
                      <span className="sr-only">{value}</span>
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">{t.experience}</span>
                <textarea
                  name="content"
                  required
                  minLength={12}
                  rows={7}
                  placeholder={t.experiencePlaceholder}
                  className="w-full resize-none border border-white/10 bg-black/25 px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-white/24 focus:border-[#8ed8ff]/70"
                />
              </label>
              {error && <p className="rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
              <button disabled={status === 'saving'} className="accent-gradient rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#05070b] disabled:opacity-50">
                {status === 'saving' ? t.sending : t.submit}
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
