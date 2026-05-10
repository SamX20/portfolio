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

export default function Navigation({ sections, locale, onLocaleChange }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const t = labels[locale];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/10 bg-[#080808]/88 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="accent-gradient grid h-9 w-9 place-items-center rounded-full border border-[#d98fcb]/50 text-sm font-black text-[#090909]">
            {sections?.global.logo || 'S'}
          </span>
          <span className="text-sm font-black uppercase tracking-[0.22em] text-white">
            {sections?.global.site_title || 'Sam Motion'}
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-5">
          <a href="#projects" className="hidden text-sm font-semibold text-white/62 transition hover:text-white sm:block">
            {t.work}
          </a>
          <a href="#contact" className="hidden text-sm font-semibold text-white/62 transition hover:text-white sm:block">
            {t.contact}
          </a>
          <button
            type="button"
            onClick={() => onLocaleChange(locale === 'en' ? 'ar' : 'en')}
            className="h-9 rounded-full border border-white/12 px-3 text-xs font-black uppercase tracking-[0.16em] text-white/85 transition hover:border-[#b99cff]/60 hover:text-[#b99cff]"
            aria-label="Toggle language"
          >
            {locale === 'en' ? 'AR' : 'EN'}
          </button>
          <a
            href="#contact"
            className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-[#d98fcb]"
          >
            {t.book}
          </a>
        </div>
      </div>
    </nav>
  );
}
