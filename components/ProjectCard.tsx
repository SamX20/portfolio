'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, Locale, Project } from '@/types';
import usePortableMotion from '@/lib/usePortableMotion';
import { getGoogleDriveThumbnail } from '@/lib/videoUtils';

interface ProjectCardProps {
  project: Project;
  locale: Locale;
  onOpen: (project: Project) => void;
  featuredLayout?: boolean;
  compactLayout?: boolean;
  autoPreview?: boolean;
}

export default function ProjectCard({
  project,
  locale,
  onOpen,
  featuredLayout = false,
  compactLayout = false,
  autoPreview = false,
}: ProjectCardProps) {
  const isPortable = usePortableMotion();
  const hoverVideoRef = useRef<HTMLVideoElement>(null);
  const [desktopHovered, setDesktopHovered] = useState(false);
  const isAr = locale === 'ar';
  const categoryLabels = CATEGORIES
    .filter((item) => project.category.includes(item.value))
    .map((item) => (isAr ? item.labelAr : item.label));
  const title = isAr ? project.title_ar || project.title : project.title;
  const description = isAr ? project.description_ar || project.description : project.description;
  const thumbnailUrl = project.thumbnail || getGoogleDriveThumbnail(project.video_url);
  const mediaAspect = featuredLayout
    ? 'aspect-[16/10] lg:aspect-video'
    : compactLayout
      ? 'aspect-[4/3]'
      : 'aspect-video';
  const shouldPlayPreview = Boolean(project.hover_video_url) && (isPortable ? autoPreview : desktopHovered);

  useEffect(() => {
    const video = hoverVideoRef.current;
    if (!video || !shouldPlayPreview) return;

    video.currentTime = 0;
    void video.play().catch(() => undefined);

    return () => {
      video.pause();
      video.currentTime = 0;
    };
  }, [shouldPlayPreview]);

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(project)}
      onMouseEnter={() => setDesktopHovered(true)}
      onMouseLeave={() => setDesktopHovered(false)}
      onFocus={() => setDesktopHovered(true)}
      onBlur={() => setDesktopHovered(false)}
      data-preview-project-id={project.hover_video_url ? project.id : undefined}
      className="group relative flex h-full w-full flex-col overflow-hidden border border-white/10 bg-[#101114] text-left transition hover:border-[var(--accent-mid)]/70 hover:shadow-[0_22px_60px_rgba(0,0,0,.34)]"
      whileHover={isPortable ? undefined : { y: -5 }}
      transition={isPortable ? undefined : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className={`relative w-full shrink-0 overflow-hidden bg-[#050607] ${mediaAspect}`}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center opacity-90 transition duration-700 group-hover:scale-[1.015] group-hover:opacity-100"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,#17191d,#08090b_52%,#111827)]" />
        )}
        {project.hover_video_url && shouldPlayPreview ? (
          <video
            ref={hoverVideoRef}
            src={project.hover_video_url}
            poster={thumbnailUrl}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            onCanPlay={(event) => void event.currentTarget.play().catch(() => undefined)}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
            aria-hidden="true"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-black/5 transition group-hover:bg-transparent" />
        <motion.div
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-[var(--accent-mid)]/8 blur-2xl"
          animate={isPortable ? { x: '40%' } : { x: ['-120%', '230%'] }}
          transition={isPortable ? { duration: 0 } : { duration: 3.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/10">
          <div className="h-full w-0 bg-[var(--accent-mid)] transition-all duration-500 group-hover:w-full" />
        </div>
      </div>

      <div className={`relative flex grow flex-col ${featuredLayout ? 'p-6 lg:p-7' : compactLayout ? 'p-4' : 'p-5'}`}>
        <div className="flex items-start justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)]">
            {categoryLabels.length > 0 ? categoryLabels.join(' / ') : project.category.join(', ')}
          </span>
          {project.featured ? (
            <span className="shrink-0 border border-[var(--accent-mid)]/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/60">
              {isAr ? 'عمل مختار' : 'Featured'}
            </span>
          ) : null}
        </div>

        <h3 className={`${featuredLayout ? 'mt-4 text-3xl sm:text-4xl' : compactLayout ? 'mt-3 text-lg' : 'mt-3 text-2xl'} font-black leading-tight text-white transition-colors group-hover:text-[var(--accent)]`}>{title}</h3>
        {!compactLayout ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/52">{description}</p> : null}

        <div className={`${compactLayout ? 'mt-4' : 'mt-5'} flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white/38`}>
          {project.client ? <span>{project.client}</span> : null}
          {project.client && (project.duration || project.year) ? <span className="h-1 w-1 rounded-full bg-[var(--accent-mid)]" /> : null}
          {project.duration ? <span>{project.duration}</span> : null}
          {project.duration ? <span className="h-1 w-1 rounded-full bg-white/20" /> : null}
          <span>{project.year}</span>
        </div>

        <div className={`${compactLayout ? 'mt-4' : 'mt-6'} flex items-center justify-between border-t border-white/8 pt-4`}>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45 transition-colors group-hover:text-white">
            {isAr ? 'عرض المشروع' : 'View project'}
          </span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-white transition duration-300 group-hover:border-[var(--accent-mid)] group-hover:bg-[var(--accent-mid)] group-hover:text-[#05070b]">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true">
              <path d="M8 5v14l11-7L8 5Z" />
            </svg>
          </span>
        </div>
      </div>
    </motion.button>
  );
}
