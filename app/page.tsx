'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Portfolio from '@/components/Portfolio';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

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

  useEffect(() => {
    // Load data from localStorage
    const profileData = localStorage.getItem('profile_data');
    if (profileData) {
      setProfile(JSON.parse(profileData));
    }

    const sectionsData = localStorage.getItem('sections_data');
    if (sectionsData) {
      setSections(JSON.parse(sectionsData));
    }

    const skillsData = localStorage.getItem('skills_data');
    if (skillsData) {
      setSkills(JSON.parse(skillsData));
    }

    const testimonialsData = localStorage.getItem('testimonials_data');
    if (testimonialsData) {
      setTestimonials(JSON.parse(testimonialsData));
    }
  }, []);

  return (
    <main>
      <Navigation />
      <Hero profile={profile} sections={sections} />
      <Portfolio />
      <Contact />
      <Footer sections={sections} />
    </main>
  );
}
