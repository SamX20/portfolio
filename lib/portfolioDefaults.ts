import { Client, ContactInfo, Profile, Project, SectionsData, Skill, SocialLink, Stat, Testimonial } from '@/types';

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
    title_ar: 'مصمم فيديو ومحرر احترافي',
    subtitle_ar: 'موشن جرافيك / مونتاج فيديو',
    description_ar:
      'أحوّل الأفكار إلى محتوى بصري متقن يجذب الجمهور، يحكي القصة بوضوح، ويترك أثراً احترافياً يليق بعلامتك.',
    cta_text: 'Watch the reel',
    cta_link: '#projects',
    video_url: '',
  },
  about: {
    title: 'Samer Jaber',
    content:
      'I am Samer Jaber, a motion graphics designer and video editor focused on polished visual content, commercial ads, educational videos, and motion-led brand stories.',
    title_ar: 'سامر جابر',
    content_ar:
      'أنا سامر جابر، مصمم موشن جرافيك ومحرر فيديو. أعمل على إنتاج محتوى بصري احترافي للإعلانات التجارية، الفيديوهات التعليمية، والهويات المتحركة، مع توظيف أدوات الذكاء الاصطناعي لخدمة الفكرة والإخراج.',
    experience_years: '4+',
    projects_completed: '100+',
  },
  footer: {
    copyright: '© 2026 Sam. All rights reserved.',
    tagline: 'Motion with taste. Edits with pulse.',
    tagline_ar: 'تصميم يتحرك بإحساس. مونتاج يترك أثراً.',
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
    title_ar: 'افتتاحية هوية حركية',
    description:
      'A punchy logo reveal and brand opener built around fast typography, timing, and clean transitions.',
    description_ar:
      'افتتاحية بصرية قصيرة تكشف الهوية بإيقاع سريع، تايبوجرافي حركي، وانتقالات مصممة بعناية.',
    category: ['motion-design'],
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
    title_ar: 'حزمة إعلانات عمودية',
    description:
      'A fast-cut campaign system for Reels and TikTok with modular scenes and animated product moments.',
    description_ar:
      'نظام إعلاني سريع مخصص للريلز وتيك توك، بمشاهد مرنة وحركة منتج واضحة تناسب المشاهدة السريعة.',
    category: ['social-ads'],
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
    title_ar: 'نظام فيديو توضيحي متحرك',
    description:
      'A clean explainer style with animated icons, transitions, and visual pacing for complex ideas.',
    description_ar:
      'أسلوب شرح بصري يعتمد على أيقونات متحركة، انتقالات دقيقة، وتسلسل واضح يبسط الأفكار المعقدة.',
    category: ['explainer'],
    client: 'Concept',
    role: 'Storyboard, animation, edit',
    year: 2026,
    duration: '01:10',
    technologies: ['After Effects', 'Photoshop'],
    featured: false,
    sort_order: 3,
  },
];

export const defaultClients: Client[] = [
  {
    id: 'client-concept',
    name: 'Concept',
    slug: 'concept',
    logo_url: '',
    website_url: '',
    featured: true,
    sort_order: 1,
  },
];

export const defaultStats: Stat[] = [
  { id: 'clients_count', label: 'Happy clients', value: '50+' },
  { id: 'projects_count', label: 'Completed projects', value: '100+' },
  { id: 'years_exp', label: 'Years experience', value: '4+' },
];

export const defaultContacts: ContactInfo[] = [
  { id: 'email', icon: '@', title: 'Email', content: 'Samer.jaber001@gmail.com', href: 'mailto:Samer.jaber001@gmail.com' },
  { id: 'phone', icon: 'phone', title: 'Phone', content: '+962 795137282', href: 'tel:+962795137282' },
  { id: 'location', icon: 'pin', title: 'Location', content: 'Jordan - Amman', href: '#' },
  { id: 'hours', icon: 'clock', title: 'Working Hours', content: '9:00 AM - 6:00 PM (Sun-Thu)', href: '#' },
];

export const defaultSocials: SocialLink[] = [
  { id: 'instagram', name: 'Instagram', url: '#', sort_order: 1 },
  { id: 'youtube', name: 'YouTube', url: '#', sort_order: 2 },
  { id: 'behance', name: 'Behance', url: '#', sort_order: 3 },
];

export const defaultSkills: Skill[] = [
  { id: 'skill-after-effects', name: 'Adobe After Effects', level: 96, category: 'motion-design', program: 'Adobe After Effects', program_skill: 'Motion Graphics', editing_field: 'Product Promo', sort_order: 1 },
  { id: 'skill-premiere', name: 'Adobe Premiere Pro', level: 92, category: 'video-editing', program: 'Adobe Premiere Pro', program_skill: 'Color and Rhythm Edit', editing_field: 'Launch Video', sort_order: 2 },
  { id: 'skill-ai-tools', name: 'AI Tools', level: 88, category: 'design', program: 'AI Tools', program_skill: 'Generative Visuals', editing_field: 'SaaS', sort_order: 3 },
  { id: 'skill-blender', name: 'Blender 3D', level: 78, category: '3d-modeling', program: 'Blender 3D', program_skill: '3D Motion', editing_field: 'Product Promo', sort_order: 4 },
];

export const defaultTestimonials: Testimonial[] = [];
