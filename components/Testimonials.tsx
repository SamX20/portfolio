'use client';

import { motion } from 'framer-motion';
import useDisableMotion from '@/lib/useDisableMotion';
import { Locale, Testimonial } from '@/types';

interface TestimonialsProps {
  testimonials?: Testimonial[];
  locale: Locale;
}

export default function Testimonials({ testimonials = [], locale }: TestimonialsProps) {
  const disableMotion = useDisableMotion();
  const isAr = locale === 'ar';
  const visibleTestimonials = testimonials
    .filter((testimonial) => testimonial.approved !== false)
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  if (!visibleTestimonials.length) return null;

  return (
    <section className="bg-[#080808] px-4 pb-24 sm:px-6 lg:px-8" id="testimonials" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-10 max-w-3xl"
          initial={!disableMotion ? { opacity: 0, y: 22 } : undefined}
          whileInView={!disableMotion ? { opacity: 1, y: 0 } : undefined}
          viewport={!disableMotion ? { once: true, amount: 0.18, margin: '-120px' } : undefined}
          transition={!disableMotion ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } : undefined}
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">{isAr ? 'آراء العملاء' : 'Client feedback'}</p>
          <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
            {isAr ? 'تجارب حقيقية من عملاء اشتغلوا معي.' : 'What clients say after the final cut.'}
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleTestimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.id}
              className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 shadow-2xl shadow-black/10"
              initial={!disableMotion ? { opacity: 0, y: 24 } : undefined}
              whileInView={!disableMotion ? { opacity: 1, y: 0 } : undefined}
              viewport={!disableMotion ? { once: true, amount: 0.16, margin: '-100px' } : undefined}
              transition={!disableMotion ? { duration: 0.5, delay: index * 0.05 } : undefined}
            >
              <div className="mb-5 flex gap-1" aria-label={`${testimonial.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <svg
                    key={starIndex}
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 ${starIndex < testimonial.rating ? 'fill-[var(--accent)]' : 'fill-white/14'}`}
                    aria-hidden="true"
                  >
                    <path d="m12 2 2.9 6.2 6.7.8-4.9 4.6 1.3 6.6-6-3.3-6 3.3 1.3-6.6L2.4 9l6.7-.8L12 2Z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm leading-7 text-white/66">"{testimonial.content}"</p>
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="font-black text-white">{testimonial.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/38">
                  {[testimonial.role, testimonial.company].filter(Boolean).join(' / ')}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
