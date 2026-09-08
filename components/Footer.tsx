'use client';

import { Locale, SectionsData, SocialLink } from '@/types';

interface FooterProps {
  sections: SectionsData;
  socialLinks?: SocialLink[];
  locale: Locale;
}

export default function Footer({ sections, socialLinks = [], locale }: FooterProps) {
  const isAr = locale === 'ar';
  const tagline = isAr ? sections.footer.tagline_ar || sections.footer.tagline : sections.footer.tagline;

  return (
    <footer className="border-t border-white/10 bg-[#070809] px-4 py-12 sm:px-6 lg:px-10" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xl font-black uppercase tracking-[0.24em] text-white">{sections.global.site_title}</p>
          <p className="mt-2 text-sm text-white/45">{tagline}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black uppercase tracking-[0.15em] text-white/42 transition hover:text-[var(--accent)]"
            >
              {social.name}
            </a>
          ))}
        </div>
        <p className="text-xs text-white/34">{sections.footer.copyright}</p>
      </div>
    </footer>
  );
}
