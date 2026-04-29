'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Portfolio from '@/components/Portfolio';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Skills from '@/components/Skills';
import Testimonials from '@/components/Testimonials';
import LoadingScreen from '@/components/LoadingScreen';
import { supabase } from '@/lib/supabase';
import { Project, ContactInfo, SocialLink, SectionsData, Profile, Skill, Testimonial } from '@/types';

interface HomeData {
  projects: Project[];
  contacts: ContactInfo[];
  socials: SocialLink[];
  sections: SectionsData;
  profile: Profile;
  skills: Skill[];
  testimonials: Testimonial[];
}

async function loadHomeData() {
  if (!supabase) {
    return {
      projects: [] as Project[],
      contacts: [] as ContactInfo[],
      socials: [] as SocialLink[],
      sections: {
        hero: {
          title: 'مرحباً، أنا محمد علي',
          subtitle: 'مصمم ومحرر فيديو احترافي',
          description: 'أحول أفكارك إلى محتوى بصري مذهل يجذب الجمهور ويحقق أهدافك التسويقية.',
          cta_text: 'شاهد أعمالي',
          cta_link: '#portfolio'
        },
        about: {
          title: 'من أنا',
          content: 'محترف في إنتاج المحتوى البصري والمونتاج والتصميم.',
          experience_years: '5+',
          projects_completed: '100+'
        },
        footer: {
          copyright: '© 2024 محمد علي. جميع الحقوق محفوظة.',
          tagline: 'نصنع المحتوى الذي يتحدث عن نفسه'
        }
      } as SectionsData,
      profile: {
        id: 'main',
        name: 'محمد علي',
        title: 'مصمم ومحرر فيديو احترافي',
        description: 'محترف في إنتاج المحتوى البصري والمونتاج والتصميم.',
        avatar: '',
        resume: ''
      } as Profile,
      skills: [] as Skill[],
      testimonials: [] as Testimonial[]
    };
  }

  const [
    projectsRes,
    statsRes,
    contactsRes,
    socialsRes,
    sectionsRes,
    profileRes,
    skillsRes,
    testimonialsRes
  ] = await Promise.all([
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('stats').select('*'),
    supabase.from('contact_info').select('*'),
    supabase.from('social_links').select('*').order('sort_order'),
    supabase.from('sections').select('*'),
    supabase.from('profile').select('*').eq('id', 'main').single(),
    supabase.from('skills').select('*'),
    supabase.from('testimonials').select('*'),
  ]);

  // Process sections data
  const sectionsRaw = sectionsRes.data || [];
  const sectionsMap = sectionsRaw.reduce((acc: any, item: any) => {
    if (!acc[item.section]) acc[item.section] = {};
    acc[item.section][item.key] = item.value;
    return acc;
  }, {});

  const sections: SectionsData = {
    hero: {
      title: sectionsMap.hero?.title || 'مرحباً، أنا محمد علي',
      subtitle: sectionsMap.hero?.subtitle || 'مصمم ومحرر فيديو احترافي',
      description: sectionsMap.hero?.description || 'أحول أفكارك إلى محتوى بصري مذهل يجذب الجمهور ويحقق أهدافك التسويقية.',
      cta_text: sectionsMap.hero?.cta_text || 'شاهد أعمالي',
      cta_link: sectionsMap.hero?.cta_link || '#portfolio'
    },
    about: {
      title: sectionsMap.about?.title || 'من أنا',
      content: sectionsMap.about?.content || 'محترف في إنتاج المحتوى البصري والمونتاج والتصميم.',
      experience_years: sectionsMap.about?.experience_years || '5+',
      projects_completed: sectionsMap.about?.projects_completed || '100+'
    },
    footer: {
      copyright: sectionsMap.footer?.copyright || '© 2024 محمد علي. جميع الحقوق محفوظة.',
      tagline: sectionsMap.footer?.tagline || 'نصنع المحتوى الذي يتحدث عن نفسه'
    }
  };

  const profile: Profile = profileRes.data ? {
    id: profileRes.data.id,
    name: profileRes.data.name || 'محمد علي',
    title: profileRes.data.title || 'مصمم ومحرر فيديو احترافي',
    description: profileRes.data.description || 'محترف في إنتاج المحتوى البصري والمونتاج والتصميم.',
    avatar: profileRes.data.avatar || '',
    resume: profileRes.data.resume || ''
  } : {
    id: 'main',
    name: 'محمد علي',
    title: 'مصمم ومحرر فيديو احترافي',
    description: 'محترف في إنتاج المحتوى البصري والمونتاج والتصميم.',
    avatar: '',
    resume: ''
  };

  return {
    projects: projectsRes.data || [],
    stats: statsRes.data || [],
    contacts: contactsRes.data || [],
    socials: socialsRes.data || [],
    sections,
    profile,
    skills: skillsRes.data || [],
    testimonials: testimonialsRes.data || []
  };
}

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Add mobile delay
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        await new Promise(resolve => setTimeout(resolve, 6000));
      }
      const result = await loadHomeData();
      setData(result);
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !data) return <LoadingScreen />;

  const { projects, contacts, socials, sections, profile, skills, testimonials } = data;

  return (
    <main>
      <Navigation />
      <Hero profile={profile} sections={sections} />
      <Skills skills={skills} />
      <Testimonials testimonials={testimonials} />
      <Portfolio projects={projects} />
      <Contact contacts={contacts} socialLinks={socials} />
      <Footer sections={sections} socialLinks={socials} />
    </main>
  );
}
