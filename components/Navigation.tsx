'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Locale, SectionsData } from '@/types';

interface NavigationProps {
  sections?: SectionsData;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

const labels = {
  en: {
    work: 'Work',
    contact: 'Contact',
    book: 'Start a project',
  },
  ar: {
    work: 'الأعمال',
    contact: 'التواصل',
    book: 'ابدأ مشروعك',
  },
};

function isImageLogo(value?: string) {
  if (!value) return false;
  return /^(\/|https?:\/\/).+\.(svg|png|jpe?g|webp|gif)(\?.*)?$/i.test(value.trim());
}

export default function Navigation({ sections, locale, onLocaleChange }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const t = labels[locale];
  const logo = sections?.global.logo || 'S';
  const siteTitle = sections?.global.site_title || 'Sam Motion';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`site-nav fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/10 bg-[#070809]/92 backdrop-blur-xl' : 'bg-gradient-to-b from-black/55 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <span className="accent-gradient grid h-10 w-10 place-items-center overflow-hidden rounded-md border border-[var(--accent-mid)]/50 text-sm font-black text-[#090909] shadow-[0_0_28px_color-mix(in_srgb,var(--accent)_18%,transparent)]">
            {isImageLogo(logo) ? (
              <img src={logo} alt={`${siteTitle} logo`} className="h-full w-full object-cover" />
            ) : (
              logo
            )}
          </span>
          <span className="hidden text-[13px] font-black uppercase tracking-[0.24em] text-white sm:block">
            {siteTitle}
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-6">
          <a href="#projects" className="hidden text-sm font-semibold text-white/62 transition hover:text-white sm:block">
            {t.work}
          </a>
          <a href="#contact" className="hidden text-sm font-semibold text-white/62 transition hover:text-white sm:block">
            {t.contact}
          </a>
          <button
            type="button"
            onClick={() => onLocaleChange(locale === 'en' ? 'ar' : 'en')}
            className="h-9 rounded-full border border-white/12 px-3 text-xs font-black uppercase tracking-[0.16em] text-white/85 transition hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
            aria-label="Toggle language"
          >
            {locale === 'en' ? 'AR' : 'EN'}
          </button>
          <a
            href="#contact"
            className="whitespace-nowrap rounded-md bg-white px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-black transition hover:bg-[var(--accent)] sm:px-4 sm:text-xs sm:tracking-[0.14em]"
          >
            {t.book}
          </a>
        </div>
      </div>
    </nav>
  );
}
