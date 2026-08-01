import HomeClient, { HomeData } from '@/components/HomeClient';
import {
  defaultContacts,
  defaultClients,
  defaultProfile,
  defaultProjects,
  defaultSections,
  defaultSkills,
  defaultSocials,
  defaultStats,
  defaultTestimonials,
} from '@/lib/portfolioDefaults';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { Locale, SectionsData } from '@/types';

export const revalidate = 300;

function fallbackData(): HomeData {
  return {
    projects: defaultProjects,
    stats: defaultStats,
    contacts: defaultContacts,
    clients: defaultClients,
    socials: defaultSocials,
    sections: defaultSections,
    profile: defaultProfile,
    skills: defaultSkills,
    testimonials: defaultTestimonials,
  };
}

function isArabicText(text?: string) {
  return typeof text === 'string' && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

function resolveText(primary: string | undefined, fallback: string) {
  return primary && !isArabicText(primary) ? primary : fallback;
}

function mapSections(rows: { section: string; key: string; value: string }[]): SectionsData {
  const map = rows.reduce<Record<string, Record<string, string>>>((acc, item) => {
    acc[item.section] = acc[item.section] || {};
    acc[item.section][item.key] = item.value;
    return acc;
  }, {});

  const isValidLocale = (value: string | undefined): value is Locale => {
    return value === 'en' || value === 'ar';
  };

  const heroMap = map.hero || {};
  const aboutMap = map.about || {};
  const footerMap = map.footer || {};

  return {
    global: {
      ...defaultSections.global,
      site_title: resolveText(map.global?.site_title, defaultSections.global.site_title),
      logo: map.global?.logo || defaultSections.global.logo,
      language: isValidLocale(map.global?.language) ? map.global.language : defaultSections.global.language,
    },
    hero: {
      ...defaultSections.hero,
      title: resolveText(heroMap.title, defaultSections.hero.title),
      subtitle: resolveText(heroMap.subtitle, defaultSections.hero.subtitle),
      description: resolveText(heroMap.description, defaultSections.hero.description),
      title_ar: heroMap.title_ar || defaultSections.hero.title_ar,
      subtitle_ar: heroMap.subtitle_ar || defaultSections.hero.subtitle_ar,
      description_ar: heroMap.description_ar || defaultSections.hero.description_ar,
      cta_text: resolveText(heroMap.cta_text, defaultSections.hero.cta_text),
      cta_link: heroMap.cta_link || defaultSections.hero.cta_link,
      video_url: heroMap.video_url || defaultSections.hero.video_url,
      video_url_alt: heroMap.video_url_alt || defaultSections.hero.video_url_alt,
      theme_accent: heroMap.theme_accent || defaultSections.hero.theme_accent,
      theme_accent_mid: heroMap.theme_accent_mid || defaultSections.hero.theme_accent_mid,
      theme_accent_deep: heroMap.theme_accent_deep || defaultSections.hero.theme_accent_deep,
      theme_alt_accent: heroMap.theme_alt_accent || defaultSections.hero.theme_alt_accent,
      theme_alt_accent_mid: heroMap.theme_alt_accent_mid || defaultSections.hero.theme_alt_accent_mid,
      theme_alt_accent_deep: heroMap.theme_alt_accent_deep || defaultSections.hero.theme_alt_accent_deep,
    },
    about: {
      ...defaultSections.about,
      title: resolveText(aboutMap.title, defaultSections.about.title),
      content: resolveText(aboutMap.content, defaultSections.about.content),
      title_ar: aboutMap.title_ar || defaultSections.about.title_ar,
      content_ar: aboutMap.content_ar || defaultSections.about.content_ar,
      experience_years: aboutMap.experience_years || defaultSections.about.experience_years,
      projects_completed: aboutMap.projects_completed || defaultSections.about.projects_completed,
    },
    footer: {
      ...defaultSections.footer,
      copyright: footerMap.copyright || defaultSections.footer.copyright,
      tagline: resolveText(footerMap.tagline, defaultSections.footer.tagline),
      tagline_ar: footerMap.tagline_ar || defaultSections.footer.tagline_ar,
    },
  };
}

async function loadHomeData(): Promise<HomeData> {
  const fallback = fallbackData();
  const database = supabaseAdmin || supabase;

  if (!database) return fallback;

  const result = await Promise.all([
    database.from('projects').select('*').order('sort_order'),
    database.from('stats').select('*'),
    database.from('contact_info').select('*'),
    database.from('clients').select('*').order('sort_order'),
    database.from('social_links').select('*').order('sort_order'),
    database.from('sections').select('*'),
    database.from('profile').select('*').eq('id', 'main').single(),
    database.from('skills').select('*'),
    database.from('testimonials').select('*'),
  ]);

  const failedQuery = result.find((response) => response.error);
  if (failedQuery?.error) {
    throw new Error(`Could not load portfolio data: ${failedQuery.error.message}`);
  }

  const [projectsRes, statsRes, contactsRes, clientsRes, socialsRes, sectionsRes, profileRes, skillsRes, testimonialsRes] = result;

  return {
    projects: projectsRes.data ?? defaultProjects,
    stats: statsRes.data ?? defaultStats,
    contacts: contactsRes.data ?? defaultContacts,
    clients: clientsRes.data ?? [],
    socials: socialsRes.data ?? defaultSocials,
    sections: sectionsRes.data?.length ? mapSections(sectionsRes.data) : defaultSections,
    profile: profileRes.data || defaultProfile,
    skills: skillsRes.data ?? defaultSkills,
    testimonials: testimonialsRes.data ?? defaultTestimonials,
  };
}

export default async function Home() {
  const data = await loadHomeData();
  return <HomeClient data={data} />;
}
