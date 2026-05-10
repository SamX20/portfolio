export type Locale = 'en' | 'ar';

export type ProjectCategory =
  | 'motion-design'
  | 'social-ads'
  | 'brand-films'
  | 'explainer'
  | 'video-editing'
  | 'logo-animation';

export interface Project {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  category: ProjectCategory;
  client?: string;
  role?: string;
  year: number;
  duration?: string;
  technologies: string[];
  video_url?: string;
  embed_code?: string;
  thumbnail?: string;
  featured: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
}

export interface ContactInfo {
  id: string;
  icon: string;
  title: string;
  content: string;
  href: string;
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
  sort_order: number;
}

export interface Section {
  id: string;
  section: string;
  key: string;
  value: string;
}

export interface Profile {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar: string;
  resume: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  content: string;
  rating: number;
}

export interface SectionsData {
  global: {
    site_title: string;
    logo: string;
    language?: Locale;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    cta_text: string;
    cta_link: string;
    title_ar?: string;
    subtitle_ar?: string;
    description_ar?: string;
  };
  about: {
    title: string;
    content: string;
    experience_years: string;
    projects_completed: string;
    title_ar?: string;
    content_ar?: string;
  };
  footer: {
    copyright: string;
    tagline: string;
    tagline_ar?: string;
  };
}

export const CATEGORIES = [
  { value: 'motion-design', label: 'Motion Design', labelAr: 'تصميم حركي' },
  { value: 'social-ads', label: 'Social Ads', labelAr: 'إعلانات رقمية' },
  { value: 'brand-films', label: 'Brand Films', labelAr: 'أفلام للعلامات التجارية' },
  { value: 'explainer', label: 'Explainers', labelAr: 'فيديوهات توضيحية' },
  { value: 'video-editing', label: 'Video Editing', labelAr: 'تحرير ومونتاج' },
  { value: 'logo-animation', label: 'Logo Animation', labelAr: 'شعار متحرك' },
] as const;
