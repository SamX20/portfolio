'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Portfolio from '@/components/Portfolio';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Skills from '@/components/Skills';
import Testimonials from '@/components/Testimonials';
import { supabase } from '@/lib/supabase';
import { Project, Stat, ContactInfo, SocialLink } from '@/types';

export default function Home() {
  const [profile, setProfile] = useState({
    name: 'محمد علي',
    title: 'مصمم ومحرر فيديو احترافي',
    description: 'محترف في إنتاج المحتوى البصري والمونتاج والتصميم. شاهد أعمالي في مجال الإعلانات التجارية، الفيديوهات التعليمية، والموشن جرافيك بأحدث التقنيات.',
    avatar: '',
    resume: ''
  });

  const [sections, setSections] = useState({
    hero: {
      title: 'مرحباً، أنا محمد علي',
      subtitle: 'مصمم ومحرر فيديو احترافي',
      description: 'أحول أفكارك إلى محتوى بصري مذهل يجذب الجمهور ويحقق أهدافك التسويقية.',
      cta_text: 'شاهد أعمالي',
      cta_link: '#portfolio'
    },
    about: {
      title: 'من أنا',
      content: 'محترف في إنتاج المحتوى البصري والمونتاج والتصميم. خبرة واسعة في مجال الإعلانات التجارية، الفيديوهات التعليمية، والموشن جرافيك.',
      experience_years: '5+',
      projects_completed: '100+'
    },
    footer: {
      copyright: '© 2024 محمد علي. جميع الحقوق محفوظة.',
      tagline: 'نصنع المحتوى الذي يتحدث عن نفسه'
    }
  });

  const [skills, setSkills] = useState([
    { id: '1', name: 'Adobe After Effects', level: 95, category: 'motion-design' },
    { id: '2', name: 'Adobe Premiere Pro', level: 90, category: 'video-editing' },
    { id: '3', name: 'Adobe Photoshop', level: 85, category: 'design' },
    { id: '4', name: 'Cinema 4D', level: 80, category: '3d-modeling' },
  ]);

  const [testimonials, setTestimonials] = useState([
    { id: '1', name: 'أحمد محمد', company: 'شركة الإعلانات المتحدة', content: 'عمل رائع جداً في تصميم الفيديو الترويجي لمنتجاتنا. الجودة عالية والإبداع واضح.', rating: 5 },
    { id: '2', name: 'فاطمة علي', company: 'مدرسة الرياض', content: 'ساعدنا في إنتاج فيديوهات تعليمية ممتازة للطلاب. المونتاج احترافي والمحتوى جذاب.', rating: 5 },
  ]);

  // New state for database data
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) {
        // Fallback to localStorage if Supabase is not available
        loadFromLocalStorage();
        setLoading(false);
        return;
      }

      try {
        // Load all data from Supabase
        const [projectsRes, statsRes, contactsRes, socialsRes] = await Promise.all([
          supabase.from('projects').select('*').order('sort_order'),
          supabase.from('stats').select('*'),
          supabase.from('contact_info').select('*'),
          supabase.from('social_links').select('*').order('sort_order'),
        ]);

        // Update state with database data
        if (projectsRes.data) {
          setProjects(projectsRes.data);
          localStorage.setItem('projects_data', JSON.stringify(projectsRes.data));
        }
        if (statsRes.data) {
          setStats(statsRes.data);
          localStorage.setItem('stats_data', JSON.stringify(statsRes.data));
        }
        if (contactsRes.data) {
          setContacts(contactsRes.data);
          localStorage.setItem('contacts_data', JSON.stringify(contactsRes.data));
        }
        if (socialsRes.data) {
          setSocials(socialsRes.data);
          localStorage.setItem('socials_data', JSON.stringify(socialsRes.data));
        }

        // Load local data (profile, sections, skills, testimonials)
        loadFromLocalStorage();
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // Fallback to localStorage
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    const loadFromLocalStorage = () => {
      const profileData = localStorage.getItem('profile_data');
      if (profileData) {
        try {
          setProfile(JSON.parse(profileData));
        } catch (e) {
          console.error('Error parsing profile data:', e);
        }
      }

      const sectionsData = localStorage.getItem('sections_data');
      if (sectionsData) {
        try {
          setSections(JSON.parse(sectionsData));
        } catch (e) {
          console.error('Error parsing sections data:', e);
        }
      }

      const skillsData = localStorage.getItem('skills_data');
      if (skillsData) {
        try {
          setSkills(JSON.parse(skillsData));
        } catch (e) {
          console.error('Error parsing skills data:', e);
        }
      }

      const testimonialsData = localStorage.getItem('testimonials_data');
      if (testimonialsData) {
        try {
          setTestimonials(JSON.parse(testimonialsData));
        } catch (e) {
          console.error('Error parsing testimonials data:', e);
        }
      }
    };

    loadData();
  }, []);

  return (
    <main>
      <Navigation />
      <Hero profile={profile} sections={sections} />
      <Skills skills={skills} />
      <Testimonials testimonials={testimonials} />
      <Portfolio />
      <Contact />
      <Footer sections={sections} />
    </main>
  );
}
