export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'video-editing' | 'motion-design' | 'promotional' | 'commercial';
  year: number;
  duration?: string;
  technologies: string[];
  video_url?: string; // رابط مباشر أو embed URL
  embed_code?: string; // كود الـ embed الكامل
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
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    cta_text: string;
    cta_link: string;
  };
  about: {
    title: string;
    content: string;
    experience_years: string;
    projects_completed: string;
  };
  footer: {
    copyright: string;
    tagline: string;
  };
}

export const CATEGORIES = [
  { value: 'video-editing',  label: 'تحرير فيديو' },
  { value: 'motion-design',  label: 'موشن ديزاين' },
  { value: 'promotional',    label: 'ترويجي' },
  { value: 'commercial',     label: 'تجاري' },
] as const;
