'use client';

import { DynamicIcon } from '@/lib/icons';
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
    <footer className="border-t border-[var(--line)]" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container-x flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[15px] font-semibold tracking-tight">{sections.global.site_title}</p>
          {tagline ? <p className="mt-1 text-sm text-[var(--muted)]">{tagline}</p> : null}
        </div>
        <div className="flex items-center gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              <DynamicIcon value={social.icon} hints={[social.id, social.name, social.url]} className="h-4 w-4" />
            </a>
          ))}
        </div>
        <p className="text-sm text-[var(--muted)]">{sections.footer.copyright}</p>
      </div>
    </footer>
  );
}
