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
  const cardHeight = featuredLayout
    ? 'min-h-[520px] lg:min-h-[560px]'
    : compactLayout
      ? 'min-h-[250px]'
      : 'min-h-[350px] lg:min-h-[390px]';
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
      className={`group relative w-full overflow-hidden border border-white/10 bg-[#111] text-left transition hover:border-[var(--accent-mid)]/70 ${cardHeight}`}
      whileHover={isPortable ? undefined : { y: -5 }}
      transition={isPortable ? undefined : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="absolute inset-0">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_24%_28%,rgba(142,216,255,.28),transparent_34%),radial-gradient(circle_at_76%_64%,rgba(37,99,235,.18),transparent_30%),linear-gradient(135deg,#191919,#0b0b0b_52%,#171225)]" />
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
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/42 to-black/12" />
        <motion.div
          className="absolute inset-y-0 w-1/2 bg-[var(--accent-mid)]/14 blur-xl"
          animate={isPortable ? { x: '40%' } : { x: ['-120%', '230%'] }}
          transition={isPortable ? { duration: 0 } : { duration: 3.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
        />
      </div>

      {project.featured && (
        <span className="accent-gradient absolute right-4 top-4 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#090909]">
          {isAr ? 'عمل مختار' : 'Featured'}
        </span>
      )}

      <div className={`relative z-10 flex flex-col justify-end p-5 ${cardHeight} ${featuredLayout ? 'lg:p-7' : ''}`}>
        <span className="mb-3 w-fit border border-white/16 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/70 backdrop-blur">
          {categoryLabels.length > 0 ? categoryLabels.join(' / ') : project.category.join(', ')}
        </span>
        <h3 className={`${featuredLayout ? 'text-3xl sm:text-4xl' : compactLayout ? 'text-xl' : 'text-2xl'} font-black leading-tight text-white`}>{title}</h3>
        {!compactLayout ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/62">{description}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {project.client && <span className="bg-white/8 px-2.5 py-1 text-xs text-white/70">{project.client}</span>}
          {project.duration && <span className="bg-white/8 px-2.5 py-1 text-xs text-white/70">{project.duration}</span>}
          <span className="bg-white/8 px-2.5 py-1 text-xs text-white/70">{project.year}</span>
        </div>
        <div className={`${compactLayout ? 'mt-4' : 'mt-6'} flex items-center justify-between border-t border-white/10 pt-4`}>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">
            {isAr ? 'مشاهدة العمل' : 'Play'}
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition group-hover:bg-[var(--accent-mid)]">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true">
              <path d="M8 5v14l11-7L8 5Z" />
            </svg>
          </span>
        </div>
      </div>
    </motion.button>
  );
}
