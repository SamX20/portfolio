'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LuArrowUpRight, LuMenu, LuX } from 'react-icons/lu';
import { Locale, SectionsData } from '@/types';

interface NavigationProps {
  sections?: SectionsData;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  hasServices?: boolean;
}

const labels = {
  en: { work: 'Work', services: 'Services', about: 'Studio', contact: 'Contact', cta: "Let's talk" },
  ar: { work: 'الأعمال', services: 'الخدمات', about: 'الاستوديو', contact: 'التواصل', cta: 'لنتحدث' },
};

function isImageLogo(value?: string) {
  if (!value) return false;
  return /^(\/|https?:\/\/).+\.(svg|png|jpe?g|webp|gif)(\?.*)?$/i.test(value.trim());
}

export default function Navigation({ sections, locale, onLocaleChange, hasServices = true }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const t = labels[locale];
  const logo = sections?.global.logo || '';
  const siteTitle = sections?.global.site_title || 'Xsamer';

  const links = [
    { href: '#work', label: t.work },
    ...(hasServices ? [{ href: '#services', label: t.services }] : []),
    { href: '#about', label: t.about },
    { href: '#contact', label: t.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? 'border-b border-[var(--line)] bg-[#0a0a0a]/85 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          {isImageLogo(logo) ? (
            <img src={logo} alt={`${siteTitle} logo`} className="h-8 w-8 rounded-full object-cover" />
          ) : null}
          <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">{siteTitle}</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLocaleChange(locale === 'en' ? 'ar' : 'en')}
            className="h-9 rounded-full px-3 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
            aria-label="Toggle language"
          >
            {locale === 'en' ? 'عربي' : 'EN'}
          </button>
          <a href="#contact" className="btn btn-primary hidden h-9 px-4 sm:inline-flex">
            {t.cta}
            <LuArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line-strong)] md:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <LuX className="h-4 w-4" /> : <LuMenu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="container-x pb-6 md:hidden">
          <div className="flex flex-col border-t border-[var(--line)] pt-4">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="py-3 text-2xl font-medium tracking-tight">
                {link.label}
              </a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)} className="btn btn-primary mt-4 w-full">
              {t.cta}
            </a>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
