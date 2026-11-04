import type { Metadata } from 'next';
import { cache } from 'react';
import ProjectView from '@/components/ProjectView';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { getGoogleDriveThumbnail } from '@/lib/videoUtils';
import { CATEGORIES, Project } from '@/types';

export const revalidate = 300;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.xsamer.com';

const getProject = cache(async (id: string): Promise<Project | null> => {
  const database = supabaseAdmin || supabase;
  if (!database) return null;
  const { data } = await database.from('projects').select('*').eq('id', id).maybeSingle();
  return (data as Project) || null;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: 'Project not found — XSam Studio', robots: { index: false } };

  const title = `${project.title || project.title_ar} — XSam Studio`;
  const categories = CATEGORIES.filter((item) => project.category?.includes(item.value)).map((item) => item.label);
  const description = (project.description || project.description_ar || `${categories.join(', ')} by XSam Studio.`).slice(0, 160);
  const image = project.thumbnail || getGoogleDriveThumbnail(project.video_url);
  const url = `${SITE}/project/${project.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'video.other', siteName: 'XSam Studio', images: image ? [{ url: image }] : undefined },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, images: image ? [image] : undefined },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  const jsonLd = project
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: project.title || project.title_ar,
        description: project.description || project.description_ar || project.title,
        thumbnailUrl: project.thumbnail || getGoogleDriveThumbnail(project.video_url) || undefined,
        uploadDate: project.created_at || `${project.year}-01-01`,
        contentUrl: project.video_url || undefined,
        creator: { '@type': 'Organization', name: 'XSam Studio', url: SITE },
      }
    : null;

  return (
    <>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} /> : null}
      <ProjectView project={project} />
    </>
  );
}
