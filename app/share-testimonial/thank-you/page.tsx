'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const logoUrl = '/WhatsApp Image 2026-07-04 at 12.41.26 AM.jpeg';

const thankYouCopy = {
  en: {
    badge: 'Testimonial received',
    title: 'Thank you.',
    text: 'Your words were saved successfully. They help future clients understand the care, clarity, and finish behind the work.',
    primary: 'Back to portfolio',
    secondary: 'Send another testimonial',
    points: ['Saved securely', 'Ready for review', 'Appreciated deeply'],
  },
  ar: {
    badge: 'تم استلام الرأي',
    title: 'شكراً لك.',
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
    <main className="grid min-h-screen place-items-center" dir={isAr ? 'rtl' : 'ltr'}>
      <section className="container-x max-w-3xl py-20 text-center">
        <div className="relative mx-auto w-fit">
          <img src={logoUrl} alt="Xsamer logo" className="h-20 w-20 rounded-full object-cover" />
          <span className="absolute -bottom-1 -end-1 grid h-8 w-8 place-items-center rounded-full bg-[var(--foreground)] text-[var(--background)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M9.2 16.2 4.9 12l-1.4 1.4 5.7 5.7L21 7.3 19.6 6 9.2 16.2Z" />
            </svg>
          </span>
        </div>
        <p className="eyebrow mt-10 justify-center">{t.badge}</p>
        <h1 className="display mt-5 text-[clamp(3rem,9vw,6rem)]">{t.title}</h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[var(--muted)]">{t.text}</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/" className="btn btn-primary">{t.primary}</a>
          <a href={`/share-testimonial?lang=${locale}`} className="btn btn-ghost">{t.secondary}</a>
        </div>
      </section>
    </main>
  );
}
