import { ContactInfo, Profile, Project, SectionsData, Skill, SocialLink, Stat, Testimonial } from '@/types';

export const defaultSections: SectionsData = {
  global: {
    site_title: 'Sam Motion',
    logo: 'S',
    language: 'en',
  },
  hero: {
    title: 'Professional Video Designer and Editor',
    subtitle: 'Motion Graphics / Video Editing',
    description:
      'I turn your ideas into stunning visual content that attracts audiences and achieves your marketing goals.',
    title_ar: 'مرحباً، أنا سامر جابر',
    subtitle_ar: 'مصمم ومحرر فيديو احترافي',
    description_ar: 'أحول أفكارك إلى محتوى بصري مذهل يجذب الجمهور ويحقق أهدافك التسويقية.',
    cta_text: 'Watch the reel',
    cta_link: '#projects',
  },
  about: {
    title: 'Who I Am',
    content:
      'A professional in visual content production, editing, and design. Extensive experience in commercial advertising, educational videos, and motion graphics, and I master the use of AI tools and integrating them into my projects.',
    title_ar: 'من أنا',
    content_ar:
      'محترف في إنتاج المحتوى البصري والمونتاج والتصميم. خبرة واسعة في مجال الإعلانات التجارية، الفيديوهات التعليمية، والموشن جرافيك، وأتقن التعامل مع ادوات الذكاء الاصطناعي ودمجها في مشاريعي.',
    experience_years: '4+',
    projects_completed: '100+',
  },
  footer: {
    copyright: '© 2026 Sam. All rights reserved.',
    tagline: 'Motion with taste. Edits with pulse.',
    tagline_ar: 'حركة بذوق. مونتاج بإحساس.',
  },
};

export const defaultProfile: Profile = {
  id: 'main',
  name: 'Samer Jaber',
  title: 'Motion Graphics Designer and Video Editor',
  description:
    'I design animated stories, brand moments, and scroll-stopping video systems for digital campaigns.',
  avatar: '',
  resume: '',
};

export const defaultProjects: Project[] = [
  {
    id: 'sample-identity',
    title: 'Kinetic Brand Opener',
    title_ar: 'افتتاحية هوية متحركة',
    description:
      'A punchy logo reveal and brand opener built around fast typography, timing, and clean transitions.',
    description_ar:
      'ريڤيل شعار وافتتاحية براند بإيقاع سريع، تايبوجرافي متحرك، وانتقالات نظيفة.',
    category: 'motion-design',
    client: 'Concept',
    role: 'Motion direction, animation, edit',
    year: 2026,
    duration: '00:18',
    technologies: ['After Effects', 'Illustrator', 'Premiere Pro'],
    featured: true,
    sort_order: 1,
  },
  {
    id: 'sample-social',
    title: 'Vertical Social Ad Pack',
    title_ar: 'حزمة إعلانات سوشيال عمودية',
    description:
      'A fast-cut campaign system for Reels and TikTok with modular scenes and animated product moments.',
    description_ar:
      'نظام إعلاني سريع لريلز وتيك توك بمشاهد قابلة للتعديل ولقطات منتج متحركة.',
    category: 'social-ads',
    client: 'Concept',
    role: 'Edit, motion graphics',
    year: 2026,
    duration: '00:30',
    technologies: ['Premiere Pro', 'After Effects'],
    featured: true,
    sort_order: 2,
  },
  {
    id: 'sample-explainer',
    title: 'Explainer Motion System',
    title_ar: 'نظام فيديو شرح متحرك',
    description:
      'A clean explainer style with animated icons, transitions, and visual pacing for complex ideas.',
    description_ar:
      'ستايل شرح واضح بأيقونات متحركة، انتقالات، وإيقاع بصري يبسّط الأفكار المعقدة.',
    category: 'explainer',
    client: 'Concept',
    role: 'Storyboard, animation, edit',
    year: 2026,
    duration: '01:10',
    technologies: ['After Effects', 'Photoshop'],
    featured: false,
    sort_order: 3,
  },
];

export const defaultStats: Stat[] = [
  { id: 'clients_count', label: 'Happy clients', value: '50+' },
  { id: 'projects_count', label: 'Completed projects', value: '100+' },
  { id: 'years_exp', label: 'Years experience', value: '4+' },
];

export const defaultContacts: ContactInfo[] = [
  { id: 'email', icon: '@', title: 'Email', content: 'Samer.jaber001@gmail.com', href: 'mailto:Samer.jaber001@gmail.com' },
  { id: 'phone', icon: '📞', title: 'Phone', content: '+962 795137282', href: 'tel:+962795137282' },
  { id: 'location', icon: '📍', title: 'Location', content: 'Jordan — Amman', href: '#' },
  { id: 'hours', icon: '🕒', title: 'Working Hours', content: '9:00 AM – 6:00 PM (Sun–Thu)', href: '#' },
];

export const defaultSocials: SocialLink[] = [
  { id: 'instagram', name: 'Instagram', url: '#', sort_order: 1 },
  { id: 'youtube', name: 'YouTube', url: '#', sort_order: 2 },
  { id: 'behance', name: 'Behance', url: '#', sort_order: 3 },
];

export const defaultSkills: Skill[] = [
  { id: 'skill-after-effects', name: 'Adobe After Effects', level: 96, category: 'Motion' },
  { id: 'skill-premiere', name: 'Adobe Premiere Pro', level: 92, category: 'Editing' },
  { id: 'skill-ai-tools', name: 'AI Tools', level: 88, category: 'AI' },
  { id: 'skill-blender', name: 'Blender 3D', level: 78, category: '3D' },
];

export const defaultTestimonials: Testimonial[] = [];
