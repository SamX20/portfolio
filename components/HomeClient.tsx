'use client';

import { useState, useEffect } from 'react';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Navigation from '@/components/Navigation';
import Portfolio from '@/components/Portfolio';
import { ContactInfo, Locale, Profile, Project, SectionsData, Skill, SocialLink, Stat, Testimonial } from '@/types';

export interface HomeData {
  projects: Project[];
  stats: Stat[];
  contacts: ContactInfo[];
  socials: SocialLink[];
  sections: SectionsData;
  profile: Profile;
  skills: Skill[];
  testimonials: Testimonial[];
}

export default function HomeClient({ data }: { data: HomeData }) {
  const [locale, setLocale] = useState<Locale>('en'); // Default to English

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.lang = locale;
    htmlElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  return (
    <main className="relative isolate overflow-hidden bg-[#080808] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-28 left-[-10%] right-[-10%] z-[1] hidden -rotate-3 overflow-hidden border-y border-white/[0.075] bg-white/[0.018] py-3 text-xs font-black uppercase tracking-[0.32em] text-white/[0.24] backdrop-blur-[1px] lg:flex"
      >
        <div className="flex min-w-max gap-7 whitespace-nowrap">
          {[...Array(10)].map((_, index) => (
            <span key={index} className="shrink-0">
              Motion Graphics / Video Editing / Design / Timing / Storyboard /
            </span>
          ))}
        </div>
      </div>
      <Navigation locale={locale} onLocaleChange={setLocale} sections={data.sections} />
      <Hero locale={locale} profile={data.profile} sections={data.sections} stats={data.stats} skills={data.skills} />
      <Portfolio locale={locale} projects={data.projects} />
      <Contact locale={locale} contacts={data.contacts} socialLinks={data.socials} />
      <Footer locale={locale} sections={data.sections} socialLinks={data.socials} />
    </main>
  );
}
