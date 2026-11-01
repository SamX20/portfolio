'use client';

import { LuArrowUpRight } from 'react-icons/lu';
import { DynamicIcon } from '@/lib/icons';
import { getServicePreset } from '@/lib/services';
import { Locale, Service } from '@/types';
import ScrollReveal from './ScrollReveal';

interface ServicesProps {
  services: Service[];
  locale: Locale;
  onSelect?: (service: string) => void;
}

export function serviceTitle(service: Service, isAr: boolean) {
  const preset = getServicePreset(service.type);
  return isAr
    ? service.title_ar || preset?.title_ar || service.title
    : service.title || preset?.title || '';
}

export default function Services({ services, locale, onSelect }: ServicesProps) {
  const isAr = locale === 'ar';
  const visible = services.filter((service) => service.featured !== false).sort((a, b) => a.sort_order - b.sort_order);

  if (!visible.length) return null;

  return (
    <section id="services" className="site-section" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container-x">
        <div className="mb-16 grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <ScrollReveal>
            <p className="eyebrow">{isAr ? 'الخدمات' : 'Services'}</p>
            <h2 className="display mt-5 text-[clamp(2.25rem,5vw,4.5rem)]">
              {isAr ? 'ما نقدمه' : 'What we do'}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <p className="max-w-xl text-base leading-7 text-[var(--muted)] lg:ms-auto">
              {isAr
                ? 'من الفكرة حتى الإطلاق: مواقع، متاجر، فيديو، وهوية بصرية — كل شيء تحت سقف واحد.'
                : 'From idea to launch — websites, stores, video, and identity, all under one roof.'}
            </p>
          </ScrollReveal>
        </div>

        <div className="border-t border-[var(--line)]">
          {visible.map((service, index) => {
            const preset = getServicePreset(service.type);
            const title = serviceTitle(service, isAr);
            const description = isAr
              ? service.description_ar || preset?.description_ar || service.description
              : service.description || preset?.description;

            return (
              <ScrollReveal key={service.id} delay={index * 40}>
                <a
                  href="#contact"
                  onClick={() => onSelect?.(title)}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-[var(--line)] py-7 transition-colors hover:bg-white/[0.02] sm:gap-8 sm:py-9 md:grid-cols-[4rem_auto_1fr_1.2fr_auto]"
                >
                  <span className="hidden font-mono text-xs text-[var(--muted)] md:block">{String(index + 1).padStart(2, '0')}</span>
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line-strong)] text-[var(--foreground)] transition group-hover:border-[var(--foreground)] group-hover:bg-[var(--foreground)] group-hover:text-[var(--background)]">
                    <DynamicIcon value={service.icon || preset?.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <h3 className="text-xl font-medium tracking-tight sm:text-3xl md:col-span-1">{title}</h3>
                  <p className="col-span-3 hidden text-sm leading-6 text-[var(--muted)] md:col-span-1 md:block">{description}</p>
                  <LuArrowUpRight className="h-5 w-5 text-[var(--muted)] transition group-hover:-translate-y-0.5 group-hover:text-[var(--foreground)] rtl:-scale-x-100" aria-hidden="true" />
                </a>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
