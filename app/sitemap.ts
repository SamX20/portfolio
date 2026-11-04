import type { MetadataRoute } from 'next';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Built on request (refreshed hourly) so new projects appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.xsamer.com';
  const pages: MetadataRoute.Sitemap = [{ url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 }];

  const database = supabaseAdmin || supabase;
  if (!database) return pages;

  const { data, error } = await database.from('projects').select('id, updated_at').order('sort_order');
  if (error || !data) return pages;

  return [
    ...pages,
    ...data.map((project: { id: string; updated_at?: string | null }) => ({
      url: `${baseUrl}/project/${project.id}`,
      lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
