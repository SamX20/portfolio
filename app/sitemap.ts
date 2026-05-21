import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { defaultProjects } from '@/lib/portfolioDefaults';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xsamer.com';

  // الصفحات الثابتة (بدون روابط #)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // يمكن إضافة صفحات أخرى حقيقية هنا إذا لزم الأمر
  ];

  // جلب المشاريع من قاعدة البيانات
  let projects = defaultProjects;
  try {
    if (supabase) {
      const { data } = await supabase.from('projects').select('id, updated_at').order('sort_order');
      if (data && data.length > 0) {
        projects = data as any[];
      }
    }
  } catch {
    // استخدام المشاريع الافتراضية عند حدوث خطأ
  }

  // إضافة صفحات المشاريع الديناميكية
  const projectPages: MetadataRoute.Sitemap = projects.map((project: any) => ({
    url: `${baseUrl}/project/${project.id}`,
    lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...projectPages];
}
