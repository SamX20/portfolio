export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'video-editing' | 'motion-design' | 'promotional' | 'commercial';
  year: number;
  duration?: string;
  technologies: string[];
  video_url?: string;
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
  sort_order: number;
}

export const CATEGORIES = [
  { value: 'video-editing',  label: 'تحرير فيديو' },
  { value: 'motion-design',  label: 'موشن ديزاين' },
  { value: 'promotional',    label: 'ترويجي' },
  { value: 'commercial',     label: 'تجاري' },
] as const;
