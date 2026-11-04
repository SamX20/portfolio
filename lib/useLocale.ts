'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Locale } from '@/types';

const STORAGE_KEY = 'xsam-locale';

function detectLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    // Storage can be blocked (private mode); fall back to the browser language.
  }
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return languages.some((language) => language?.toLowerCase().startsWith('ar')) ? 'ar' : 'en';
}

/**
 * The visitor's language: their last choice if they made one, otherwise Arabic when the
 * browser prefers Arabic. Also keeps <html lang/dir> in sync.
 */
export default function useLocale(): [Locale, (locale: Locale) => void] {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not critical: the choice just won't be remembered.
    }
  }, []);

  return [locale, setLocale];
}
