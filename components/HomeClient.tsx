'use client';

import { useEffect, useState } from 'react';
import About from '@/components/About';
import ClientsShowcase from '@/components/ClientsShowcase';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Navigation from '@/components/Navigation';
import Portfolio from '@/components/Portfolio';
import Services from '@/components/Services';
import Splash from '@/components/Splash';
import useLocale from '@/lib/useLocale';
import Testimonials from '@/components/Testimonials';
import { Client, ContactInfo, Locale, Profile, Project, SectionsData, Service, Skill, SocialLink, Stat, Testimonial } from '@/types';

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
  services: Service[];
}

export default function HomeClient({ data }: { data: HomeData }) {
  const [locale, setLocale] = useLocale();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState('');
  const hasServices = data.services.some((service) => service.featured !== false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <main className="relative">
      <Splash />
      <Navigation locale={locale} onLocaleChange={setLocale} sections={data.sections} hasServices={hasServices} />
      <Hero locale={locale} profile={data.profile} sections={data.sections} projects={data.projects} />
      <ClientsShowcase
        clients={data.clients}
        projects={data.projects}
        locale={locale}
        selectedClientId={selectedClientId}
        onSelectClient={(clientId) => {
          setSelectedClientId(clientId);
          if (clientId) {
            window.requestAnimationFrame(() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
          }
        }}
      />
      <Portfolio
        locale={locale}
        projects={data.projects}
        clients={data.clients}
        selectedClientId={selectedClientId}
        onClearClient={() => setSelectedClientId(null)}
      />
      <Services locale={locale} services={data.services} projects={data.projects} onSelect={setSelectedService} />
      <About locale={locale} sections={data.sections} stats={data.stats} skills={data.skills} />
      <Testimonials locale={locale} testimonials={data.testimonials} />
      <Contact
        locale={locale}
        contacts={data.contacts}
        socialLinks={data.socials}
        services={data.services}
        selectedService={selectedService}
      />
      <Footer locale={locale} sections={data.sections} socialLinks={data.socials} />
    </main>
  );
}
