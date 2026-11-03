export interface ServicePreset {
  type: string;
  icon: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
}

export const SERVICE_PRESETS: ServicePreset[] = [
  { type: 'web-development', icon: 'web', title: 'Website Development', title_ar: 'تطوير المواقع', description: 'Fast, responsive websites built to convert — from landing pages to full platforms.', description_ar: 'مواقع سريعة ومتجاوبة مصممة لتحقيق النتائج، من صفحات الهبوط حتى المنصات الكاملة.' },
  { type: 'online-store', icon: 'store', title: 'Online Stores', title_ar: 'المتاجر الإلكترونية', description: 'E-commerce stores with clean product pages, payments, and easy management.', description_ar: 'متاجر إلكترونية بصفحات منتجات أنيقة، دفع إلكتروني، وإدارة سهلة.' },
  { type: 'video-editing', icon: 'video', title: 'Video Editing', title_ar: 'المونتاج وتحرير الفيديو', description: 'Story-driven edits for ads, reels, YouTube, and brand films.', description_ar: 'مونتاج يحكي القصة للإعلانات، الريلز، يوتيوب، وأفلام العلامات التجارية.' },
  { type: 'motion-design', icon: 'motion', title: 'Motion Design', title_ar: 'التصميم الحركي', description: '2D/3D motion graphics, explainers, and animated content that moves people.', description_ar: 'موشن جرافيك ثنائي وثلاثي الأبعاد، فيديوهات توضيحية، ومحتوى متحرك مؤثر.' },
  { type: 'logo-design', icon: 'logo', title: 'Logo Design', title_ar: 'تصميم الشعارات', description: 'Distinctive, timeless logos crafted around your brand’s character.', description_ar: 'شعارات مميزة وخالدة مبنية على شخصية علامتك التجارية.' },
  { type: 'branding', icon: 'branding', title: 'Branding & Identity', title_ar: 'الهوية البصرية', description: 'Complete visual identities: colors, type, guidelines, and brand assets.', description_ar: 'هوية بصرية متكاملة: ألوان، خطوط، دليل استخدام، وأصول العلامة.' },
  { type: 'logo-animation', icon: 'motion', title: 'Logo Animation', title_ar: 'تحريك الشعارات', description: 'Animated logo reveals for intros, ads, and social media.', description_ar: 'تحريك احترافي للشعار للمقدمات والإعلانات والسوشال ميديا.' },
  { type: 'social-media', icon: 'social', title: 'Social Media Content', title_ar: 'محتوى السوشال ميديا', description: 'Scroll-stopping posts, reels, and ad creatives for every platform.', description_ar: 'منشورات وريلز وإعلانات تلفت الانتباه لكل المنصات.' },
  { type: 'ui-ux', icon: 'uiux', title: 'UI / UX Design', title_ar: 'تصميم واجهات المستخدم', description: 'Clear, modern interfaces designed around real users.', description_ar: 'واجهات واضحة وعصرية مصممة حول المستخدم الحقيقي.' },
  { type: '3d', icon: '3d', title: '3D Modelling', title_ar: 'النمذجة ثلاثية الأبعاد', description: '3D models, product renders, and animated scenes.', description_ar: 'نماذج ثلاثية الأبعاد، رندر للمنتجات، ومشاهد متحركة.' },
  { type: 'graphic-design', icon: 'graphic', title: 'Graphic Design', title_ar: 'التصميم الجرافيكي', description: 'Print and digital design: posters, packaging, and marketing material.', description_ar: 'تصاميم مطبوعة ورقمية: بوسترات، تغليف، ومواد تسويقية.' },
  { type: 'custom', icon: 'other', title: 'Custom Service', title_ar: 'خدمة مخصصة', description: '', description_ar: '' },
];

export function getServicePreset(type?: string) {
  return SERVICE_PRESETS.find((preset) => preset.type === type);
}

/**
 * How a service shows its work:
 * - link:    live things you can visit (websites, stores, apps) — a link plus a screenshot.
 * - gallery: visual work (logos, identities, graphics, 3D) — images, with an optional link (e.g. Behance).
 * - onsite:  video work that already lives in the "Work" section — a button jumps there; extra links optional.
 */
export type ServiceWorkKind = 'link' | 'gallery' | 'onsite';

const WORK_KIND: Record<string, ServiceWorkKind> = {
  'web-development': 'link',
  'online-store': 'link',
  'ui-ux': 'link',
  'logo-design': 'gallery',
  branding: 'gallery',
  'graphic-design': 'gallery',
  '3d': 'gallery',
  'video-editing': 'onsite',
  'motion-design': 'onsite',
  'logo-animation': 'onsite',
  'social-media': 'onsite',
};

export function getServiceWorkKind(type?: string): ServiceWorkKind {
  return (type && WORK_KIND[type]) || 'link';
}
