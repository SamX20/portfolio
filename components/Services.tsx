'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { LuArrowDown, LuArrowUpRight, LuCheck, LuPlus } from 'react-icons/lu';
import { DynamicIcon } from '@/lib/icons';
import { getServicePreset, getServiceWorkKind } from '@/lib/services';
import { Locale, Project, Service } from '@/types';
import ScrollReveal from './ScrollReveal';

interface ServicesProps {
  services: Service[];
  projects?: Project[];
  locale: Locale;
  onSelect?: (service: string) => void;
}

export function serviceTitle(service: Service, isAr: boolean) {
  const preset = getServicePreset(service.type);
  return isAr
    ? service.title_ar || preset?.title_ar || service.title
    : service.title || preset?.title || '';
}

export default function Services({ services, projects = [], locale, onSelect }: ServicesProps) {
  const isAr = locale === 'ar';
  const [openId, setOpenId] = useState<string | null>(null);
  const visible = services.filter((service) => service.featured !== false).sort((a, b) => a.sort_order - b.sort_order);

  if (!visible.length) return null;

  return (
    <section id="services" className="site-section" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container-x">
        <div className="mb-16 grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <ScrollReveal>
            <p className="eyebrow">{isAr ? 'الخدمات' : 'Services'}</p>
            <h2 className="display mt-5 text-[clamp(2.25rem,5vw,4.5rem)]">{isAr ? 'ما نقدمه' : 'What we do'}</h2>
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
            const items = (service.items || []).filter((item) => item.title || item.title_ar);
            const work = (service.work || []).filter((item) => item.title || item.title_ar || item.url || item.image);
            const kind = getServiceWorkKind(service.type);
            const open = openId === service.id;

            return (
              <ScrollReveal key={service.id} delay={index * 40}>
                <div className="border-b border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : service.id)}
                    aria-expanded={open}
                    className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-5 py-7 text-start sm:gap-8 sm:py-9 md:grid-cols-[4rem_auto_1fr_1.2fr_auto]"
                  >
                    <span className="hidden font-mono text-xs text-[var(--muted)] md:block">{String(index + 1).padStart(2, '0')}</span>
                    <span className={`grid h-11 w-11 place-items-center rounded-full border transition ${open ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]' : 'border-[var(--line-strong)] group-hover:border-[var(--foreground)]'}`}>
                      <DynamicIcon value={service.icon || preset?.icon} className="h-[18px] w-[18px]" />
                    </span>
                    <h3 className="text-xl font-medium tracking-tight sm:text-3xl">{title}</h3>
                    <p className="hidden text-sm leading-6 text-[var(--muted)] md:block">{description}</p>
                    <LuPlus className={`h-5 w-5 text-[var(--muted)] transition duration-300 group-hover:text-[var(--foreground)] ${open ? 'rotate-45 text-[var(--foreground)]' : ''}`} aria-hidden="true" />
                  </button>

                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-10 pb-10 md:grid-cols-[4rem_1fr] md:gap-8">
                          <span className="hidden md:block" />
                          <div>
                            {description ? <p className="mb-8 max-w-2xl text-base leading-7 text-[var(--muted)] md:hidden">{description}</p> : null}

                            {items.length > 0 ? (
                              <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                                {items.map((item, itemIndex) => (
                                  <li key={itemIndex} className="flex items-center gap-3 border-t border-[var(--line)] py-4 text-base">
                                    <LuCheck className="h-4 w-4 shrink-0 text-[var(--muted)]" aria-hidden="true" />
                                    {isAr ? item.title_ar || item.title : item.title || item.title_ar}
                                  </li>
                                ))}
                              </ul>
                            ) : null}

                            {work.length > 0 ? (
                              <div className="mt-10">
                                <p className="mb-5 text-sm text-[var(--muted)]">{isAr ? 'من أعمالنا' : 'Selected work'}</p>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                  {work.map((item, workIndex) => {
                                    const itemTitle = isAr ? item.title_ar || item.title : item.title || item.title_ar;
                                    const note = isAr ? item.description_ar || item.description : item.description || item.description_ar;
                                    const host = item.url ? item.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';
                                    const body = (
                                      <>
                                        <span className={`relative block overflow-hidden rounded-[12px] bg-[var(--surface)] ${kind === 'gallery' ? 'aspect-square' : 'aspect-[16/10]'}`}>
                                          {item.image ? (
                                            <img src={item.image} alt={itemTitle || ''} loading="lazy" className={`h-full w-full transition duration-700 group-hover/work:scale-[1.04] ${kind === 'gallery' ? 'object-contain p-6' : 'object-cover object-top'}`} />
                                          ) : (
                                            <span className="grid h-full w-full place-items-center px-6 text-center text-lg font-medium tracking-tight text-[var(--muted)]">{itemTitle || host}</span>
                                          )}
                                          {item.url ? (
                                            <span className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-black opacity-0 transition group-hover/work:opacity-100">
                                              <LuArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
                                            </span>
                                          ) : null}
                                        </span>
                                        <span className="mt-3 flex items-baseline justify-between gap-3">
                                          <span className="min-w-0 truncate text-sm font-medium">{itemTitle}</span>
                                          {host ? <span className="shrink-0 truncate font-mono text-xs text-[var(--muted)]" dir="ltr">{host.split('/')[0]}</span> : null}
                                        </span>
                                        {note ? <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{note}</span> : null}
                                      </>
                                    );
                                    return item.url ? (
                                      <a key={workIndex} href={item.url} target="_blank" rel="noopener noreferrer" className="group/work block">
                                        {body}
                                      </a>
                                    ) : (
                                      <div key={workIndex} className="group/work">{body}</div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}

                            <div className="mt-10 flex flex-wrap gap-3">
                            {kind === 'onsite' ? (
                              <a href="#work" className="btn btn-ghost">
                                {isAr ? 'شاهد أعمال الفيديو' : 'See the video work'}
                                <LuArrowDown className="h-4 w-4" aria-hidden="true" />
                              </a>
                            ) : null}
                            <a href="#contact" onClick={() => onSelect?.(title)} className="btn btn-primary">
                              {isAr ? `اطلب ${title}` : `Start a ${title.toLowerCase()} project`}
                              <LuArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
                            </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
