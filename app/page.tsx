import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Portfolio from '@/components/Portfolio';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Skills from '@/components/Skills';
import Testimonials from '@/components/Testimonials';
import { supabase } from '@/lib/supabase';
import { Project, ContactInfo, SocialLink } from '@/types';

const profile = {
  name: 'محمد علي',
  title: 'مصمم ومحرر فيديو احترافي',
  description: 'محترف في إنتاج المحتوى البصري والمونتاج والتصميم. شاهد أعمالي في مجال الإعلانات التجارية، الفيديوهات التعليمية، والموشن جرافيك بأحدث التقنيات.',
  avatar: '',
  resume: ''
};

const sections = {
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
};

const skills = [
  { id: '1', name: 'Adobe After Effects', level: 95, category: 'motion-design' },
  { id: '2', name: 'Adobe Premiere Pro', level: 90, category: 'video-editing' },
  { id: '3', name: 'Adobe Photoshop', level: 85, category: 'design' },
  { id: '4', name: 'Cinema 4D', level: 80, category: '3d-modeling' },
];

const testimonials = [
  { id: '1', name: 'أحمد محمد', company: 'شركة الإعلانات المتحدة', content: 'عمل رائع جداً في تصميم الفيديو الترويجي لمنتجاتنا. الجودة عالية والإبداع واضح.', rating: 5 },
  { id: '2', name: 'فاطمة علي', company: 'مدرسة الرياض', content: 'ساعدنا في إنتاج فيديوهات تعليمية ممتازة للطلاب. المونتاج احترافي والمحتوى جذاب.', rating: 5 },
];

async function loadHomeData() {
  if (!supabase) {
    return {
      projects: [] as Project[],
      contacts: [] as ContactInfo[],
      socials: [] as SocialLink[],
    };
  }

  const [projectsRes, contactsRes, socialsRes] = await Promise.all([
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('contact_info').select('*'),
    supabase.from('social_links').select('*').order('sort_order'),
  ]);

  return {
    projects: projectsRes.data ?? [],
    contacts: contactsRes.data ?? [],
    socials: socialsRes.data ?? [],
  };
}

export default async function Home() {
  const { projects, contacts, socials } = await loadHomeData();

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
