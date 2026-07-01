'use client';

import { useState, useEffect } from 'react';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import ClientsShowcase from '@/components/ClientsShowcase';
import Navigation from '@/components/Navigation';
import Portfolio from '@/components/Portfolio';
import Skills from '@/components/Skills';
import Testimonials from '@/components/Testimonials';
import { Client, ContactInfo, Locale, Profile, Project, SectionsData, Skill, SocialLink, Stat, Testimonial } from '@/types';

export interface HomeData {
  projects: Project[];
  stats: Stat[];
  contacts: ContactInfo[];
  clients: Client[];
  socials: SocialLink[];
  sections: SectionsData;
  profile: Profile;
  skills: Skill[];
  testimonials: Testimonial[];
}

export default function HomeClient({ data }: { data: HomeData }) {
  const [locale, setLocale] = useState<Locale>('en'); // Default to English
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
      window.setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }), 80);
    }
  }, []);

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.lang = locale;
    htmlElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  return (
    <main className="relative isolate overflow-hidden bg-[#080808] text-white">
      <Navigation locale={locale} onLocaleChange={setLocale} sections={data.sections} />
      <Hero locale={locale} profile={data.profile} sections={data.sections} stats={data.stats} />
      <Skills locale={locale} skills={data.skills} />
      <Testimonials locale={locale} testimonials={data.testimonials} />
      <ClientsShowcase
        clients={data.clients}
        projects={data.projects}
        locale={locale}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
      />
      <Portfolio
        locale={locale}
        projects={data.projects}
        clients={data.clients}
        selectedClientId={selectedClientId}
        onClearClient={() => setSelectedClientId(null)}
      />
      <Contact locale={locale} contacts={data.contacts} socialLinks={data.socials} />
      <Footer locale={locale} sections={data.sections} socialLinks={data.socials} />
    </main>
  );
}
