'use client';

import { useState } from 'react';
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
  const [locale, setLocale] = useState<Locale>((data.sections.global.language as Locale) || 'en');

  return (
    <main className="bg-[#080808] text-white">
      <Navigation locale={locale} onLocaleChange={setLocale} sections={data.sections} />
      <Hero locale={locale} profile={data.profile} sections={data.sections} stats={data.stats} skills={data.skills} />
      <Portfolio locale={locale} projects={data.projects} />
      <Contact locale={locale} contacts={data.contacts} socialLinks={data.socials} />
      <Footer locale={locale} sections={data.sections} socialLinks={data.socials} />
    </main>
  );
}
