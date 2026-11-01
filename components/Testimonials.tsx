'use client';

import { Locale, Testimonial } from '@/types';
import ScrollReveal from './ScrollReveal';

interface TestimonialsProps {
  testimonials?: Testimonial[];
  locale: Locale;
}

export default function Testimonials({ testimonials = [], locale }: TestimonialsProps) {
  const isAr = locale === 'ar';
  const visible = testimonials
    .filter((testimonial) => testimonial.approved !== false)
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  if (!visible.length) return null;

  return (
    <section id="testimonials" className="site-section" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container-x">
        <ScrollReveal className="mb-14">
          <p className="eyebrow">{isAr ? 'آراء العملاء' : 'Kind words'}</p>
        </ScrollReveal>
        <div className="grid gap-px overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
          {visible.map((testimonial, index) => (
            <ScrollReveal key={testimonial.id} delay={index * 60} className="h-full">
              <figure className="flex h-full flex-col justify-between gap-10 bg-[var(--background)] p-8 sm:p-10">
                <blockquote className="text-xl font-medium leading-relaxed tracking-tight sm:text-2xl">
                  “{testimonial.content}”
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface-raised)] text-sm font-medium">
                    {testimonial.name?.[0]?.toUpperCase()}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{testimonial.name}</span>
                    <span className="block text-sm text-[var(--muted)]">
                      {[testimonial.role, testimonial.company].filter(Boolean).join(', ')}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
