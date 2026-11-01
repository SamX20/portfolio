'use client';

import { useEffect, useRef, useState } from 'react';
import { LuPlay } from 'react-icons/lu';
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

export default function ProjectCard({ project, locale, onOpen, featuredLayout = false, autoPreview = false }: ProjectCardProps) {
  const isPortable = usePortableMotion();
  const hoverVideoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const isAr = locale === 'ar';
  const categoryLabels = CATEGORIES
    .filter((item) => project.category.includes(item.value))
    .map((item) => (isAr ? item.labelAr : item.label));
  const title = isAr ? project.title_ar || project.title : project.title;
  const thumbnailUrl = project.thumbnail || getGoogleDriveThumbnail(project.video_url);
  const shouldPlayPreview = Boolean(project.hover_video_url) && (isPortable ? autoPreview : hovered);

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
    <button
      type="button"
      onClick={() => onOpen(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      data-preview-project-id={project.hover_video_url ? project.id : undefined}
      className="project-card group block w-full text-start"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className={`relative w-full overflow-hidden rounded-[14px] bg-[var(--surface)] ${featuredLayout ? 'aspect-[16/9] md:aspect-[21/9]' : 'aspect-[4/3]'}`}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
          />
        ) : null}
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
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : null}
        <span className="absolute bottom-4 end-4 grid h-11 w-11 scale-90 place-items-center rounded-full bg-white text-black opacity-0 transition duration-300 group-hover:scale-100 group-hover:opacity-100">
          <LuPlay className="ms-0.5 h-4 w-4 fill-current" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className={`${featuredLayout ? 'text-2xl sm:text-3xl' : 'text-lg'} truncate font-medium tracking-tight`}>{title}</h3>
          <p className="mt-1 truncate text-sm text-[var(--muted)]">
            {[project.client, categoryLabels[0]].filter(Boolean).join(' — ')}
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-[var(--muted)]">{project.year}</span>
      </div>
    </button>
  );
}
