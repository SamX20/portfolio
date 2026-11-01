'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LuArrowLeft, LuArrowUpRight } from 'react-icons/lu';
import VideoPlayer from '@/components/VideoPlayer';
import { supabase } from '@/lib/supabase';
import { CATEGORIES, Locale, Project } from '@/types';

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<Locale>('en');
  const isAr = locale === 'ar';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  }, [isAr, locale]);

  useEffect(() => {
    if (!supabase || !id) {
      setLoading(false);
      return;
    }
    supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error) setProject(data);
        setLoading(false);
      });
  }, [id]);

  const header = (
    <header className="container-x flex h-16 items-center justify-between">
      <Link href="/#work" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]">
        <LuArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        {isAr ? 'كل الأعمال' : 'All work'}
      </Link>
      <Link href="/" className="text-[15px] font-semibold tracking-tight">Xsamer</Link>
      <button type="button" onClick={() => setLocale(isAr ? 'en' : 'ar')} className="text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]">
        {isAr ? 'EN' : 'عربي'}
      </button>
    </header>
  );

  if (loading || !project) {
    return (
      <main className="min-h-screen" dir={isAr ? 'rtl' : 'ltr'}>
        {header}
        <div className="grid min-h-[60vh] place-items-center text-sm text-[var(--muted)]">
          {loading ? (isAr ? 'جاري التحميل...' : 'Loading...') : isAr ? 'المشروع غير موجود.' : 'Project not found.'}
        </div>
      </main>
    );
  }

  const title = isAr ? project.title_ar || project.title : project.title;
  const description = isAr ? project.description_ar || project.description : project.description;
  const categories = CATEGORIES.filter((item) => project.category?.includes(item.value)).map((item) => (isAr ? item.labelAr : item.label));
  const meta = [
    { label: isAr ? 'العميل' : 'Client', value: project.client },
    { label: isAr ? 'الخدمة' : 'Service', value: categories.join(', ') },
    { label: isAr ? 'السنة' : 'Year', value: String(project.year) },
    { label: isAr ? 'المدة' : 'Duration', value: project.duration },
  ].filter((item) => item.value);

  return (
    <main className="min-h-screen pb-24" dir={isAr ? 'rtl' : 'ltr'}>
      {header}
      <div className="container-x pt-12 sm:pt-20">
        <p className="eyebrow">{categories[0] || (isAr ? 'مشروع' : 'Project')}</p>
        <h1 className="display mt-5 max-w-5xl text-[clamp(2.5rem,7vw,6rem)]">{title}</h1>

        <div className="mt-14 overflow-hidden rounded-[20px] bg-black">
          <VideoPlayer
            embedCode={project.embed_code}
            videoUrl={project.video_url}
            thumbnail={project.thumbnail}
            title={title}
            objectFit="contain"
            className="w-full rounded-none"
          />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <dl className="grid grid-cols-2 gap-x-6 border-t border-[var(--line)] lg:grid-cols-1">
            {meta.map((item) => (
              <div key={item.label} className="border-b border-[var(--line)] py-4">
                <dt className="text-xs text-[var(--muted)]">{item.label}</dt>
                <dd className="mt-1 text-base">{item.value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="whitespace-pre-line text-lg leading-8 text-[var(--muted)]">{description}</p>
            {project.technologies?.length ? (
              <div className="mt-10 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="chip">{tech}</span>
                ))}
              </div>
            ) : null}
            <div className="mt-10 flex flex-wrap gap-3">
              {project.video_url ? (
                <a href={project.video_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  {isAr ? 'فتح الرابط المباشر' : 'Open original'}
                  <LuArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
                </a>
              ) : null}
              <Link href="/#contact" className="btn btn-primary">
                {isAr ? 'ابدأ مشروعاً مشابهاً' : 'Start a similar project'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
