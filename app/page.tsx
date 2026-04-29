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
        setLoading(false);
        return;
      }

      try {
        const [projectsRes, statsRes, contactsRes, socialsRes] = await Promise.all([
          supabase.from('projects').select('*').order('sort_order'),
          supabase.from('stats').select('*'),
          supabase.from('contact_info').select('*'),
          supabase.from('social_links').select('*').order('sort_order'),
        ]);

        if (projectsRes.data) {
          setProjects(projectsRes.data);
        }
        if (statsRes.data) {
          setStats(statsRes.data);
        }
        if (contactsRes.data) {
          setContacts(contactsRes.data);
        }
        if (socialsRes.data) {
          setSocials(socialsRes.data);
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      } finally {
        setLoading(false);
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
      <Contact contacts={contacts} socialLinks={socials} />
      <Footer sections={sections} socialLinks={socials} />
    </main>
  );
}
