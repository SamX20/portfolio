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
        className="pointer-events-none fixed left-[-18%] right-[-18%] top-[52%] z-[1] hidden -rotate-6 overflow-hidden py-5 text-6xl font-black uppercase leading-none text-white/[0.055] mix-blend-screen sm:text-7xl lg:flex lg:text-8xl"
      >
        <div className="flex min-w-max gap-10 whitespace-nowrap">
          {[...Array(6)].map((_, index) => (
            <span key={index} className="shrink-0">
              Motion Graphics / Video Editing / Design / Storyboard /
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
