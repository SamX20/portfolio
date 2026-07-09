'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const logoUrl = '/WhatsApp Image 2026-07-04 at 12.41.26 AM.jpeg';

const thankYouCopy = {
  en: {
    badge: 'Testimonial received',
    title: 'Thank you for trusting Sam.',
    text: 'Your words were saved successfully. They help future clients understand the care, clarity, and finish behind the work.',
    primary: 'Back to portfolio',
    secondary: 'Send another testimonial',
    points: ['Saved securely', 'Ready for review', 'Appreciated deeply'],
  },
  ar: {
    badge: 'تم استلام الرأي',
    title: 'شكرا لثقتك بسام.',
    text: 'تم حفظ رأيك بنجاح. كلماتك تساعد العملاء القادمين على فهم جودة العمل، وضوح التواصل، والاهتمام بالتفاصيل.',
    primary: 'العودة إلى البورتفوليو',
    secondary: 'إرسال رأي آخر',
    points: ['تم الحفظ', 'جاهز للمراجعة', 'نقدّر وقتك'],
  },
};

export default function TestimonialThankYouPage() {
  const searchParams = useSearchParams();
  const locale = searchParams.get('lang') === 'ar' ? 'ar' : 'en';
  const isAr = locale === 'ar';
  const t = thankYouCopy[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  }, [isAr, locale]);

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#080808] px-4 py-10 text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(142,216,255,.18),transparent_32%),radial-gradient(circle_at_80%_60%,rgba(47,125,255,.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#8ed8ff]/25 to-transparent" />

      <section className="relative z-10 mx-auto grid w-full max-w-5xl place-items-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div className={`flex justify-center ${isAr ? 'lg:order-2' : ''}`}>
              <div className="relative">
                <div className="absolute -inset-5 rounded-[2.5rem] border border-[#8ed8ff]/20" />
                <div className="relative grid h-44 w-44 place-items-center overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-2 sm:h-56 sm:w-56">
                  <img src={logoUrl} alt="Xsamer logo" className="h-full w-full rounded-[1.5rem] object-cover" />
                </div>
                <div className="absolute -bottom-4 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-[#8ed8ff] text-[#05070b] shadow-xl shadow-[#8ed8ff]/20">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                    <path d="M9.2 16.2 4.9 12l-1.4 1.4 5.7 5.7L21 7.3 19.6 6 9.2 16.2Z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={isAr ? 'text-right' : 'text-left'}>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8ed8ff]">{t.badge}</p>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">{t.title}</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">{t.text}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {t.points.map((point) => (
                  <div key={point} className="rounded-2xl border border-white/10 bg-black/22 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-white/58">{point}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="/" className="accent-gradient rounded-full px-6 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-[#05070b]">
                  {t.primary}
                </a>
                <a
                  href={`/share-testimonial?lang=${locale}`}
                  className="rounded-full border border-white/10 px-6 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-white/70 transition hover:border-[#8ed8ff]/50 hover:text-white"
                >
                  {t.secondary}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
