import HomeClient, { HomeData } from '@/components/HomeClient';
import {
  defaultContacts,
  defaultProfile,
  defaultProjects,
  defaultSections,
  defaultSkills,
  defaultSocials,
  defaultStats,
  defaultTestimonials,
} from '@/lib/portfolioDefaults';
import { supabase } from '@/lib/supabase';
import { SectionsData } from '@/types';

function fallbackData(): HomeData {
  return {
    projects: defaultProjects,
    stats: defaultStats,
    contacts: defaultContacts,
    socials: defaultSocials,
    sections: defaultSections,
    profile: defaultProfile,
    skills: defaultSkills,
    testimonials: defaultTestimonials,
  };
}

function mapSections(rows: { section: string; key: string; value: string }[]): SectionsData {
  const map = rows.reduce<Record<string, Record<string, string>>>((acc, item) => {
    acc[item.section] = acc[item.section] || {};
    acc[item.section][item.key] = item.value;
    return acc;
  }, {});

  return {
    global: { ...defaultSections.global, ...map.global },
    hero: { ...defaultSections.hero, ...map.hero },
    about: { ...defaultSections.about, ...map.about },
    footer: { ...defaultSections.footer, ...map.footer },
  };
}

async function loadHomeData(): Promise<HomeData> {
  const fallback = fallbackData();

  if (!supabase) return fallback;

  try {
    const query = Promise.all([
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('stats').select('*'),
      supabase.from('contact_info').select('*'),
      supabase.from('social_links').select('*').order('sort_order'),
      supabase.from('sections').select('*'),
      supabase.from('profile').select('*').eq('id', 'main').single(),
      supabase.from('skills').select('*'),
      supabase.from('testimonials').select('*'),
    ]);

    const timeout = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 2500);
    });

    const result = await Promise.race([query, timeout]);
    if (!result) return fallback;

    const [projectsRes, statsRes, contactsRes, socialsRes, sectionsRes, profileRes, skillsRes, testimonialsRes] = result;

    return {
      projects: projectsRes.data?.length ? projectsRes.data : defaultProjects,
      stats: statsRes.data?.length ? statsRes.data : defaultStats,
      contacts: contactsRes.data?.length ? contactsRes.data : defaultContacts,
      socials: socialsRes.data?.length ? socialsRes.data : defaultSocials,
      sections: sectionsRes.data?.length ? mapSections(sectionsRes.data) : defaultSections,
      profile: profileRes.data || defaultProfile,
      skills: skillsRes.data?.length ? skillsRes.data : defaultSkills,
      testimonials: testimonialsRes.data?.length ? testimonialsRes.data : defaultTestimonials,
    };
  } catch {
    return fallback;
  }
}

export default async function Home() {
  const data = await loadHomeData();
  return <HomeClient data={data} />;
}
