'use client';

import { motion } from 'framer-motion';
import { CATEGORIES, Locale, Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  locale: Locale;
  onOpen: (project: Project) => void;
}

export default function ProjectCard({ project, locale, onOpen }: ProjectCardProps) {
  const isAr = locale === 'ar';
  const category = CATEGORIES.find((item) => item.value === project.category);
  const title = isAr ? project.title_ar || project.title : project.title;
  const description = isAr ? project.description_ar || project.description : project.description;

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(project)}
      className="group relative min-h-[430px] overflow-hidden border border-white/10 bg-[#111] text-left transition hover:border-[#f2ff5e]/70"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="absolute inset-0">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={title} className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,#191919,#0b0b0b_45%,#242911)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/42 to-black/12" />
        <motion.div
          className="absolute inset-y-0 w-1/2 bg-[#f2ff5e]/12 blur-xl"
          animate={{ x: ['-120%', '230%'] }}
          transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
        />
      </div>

      {project.featured && (
        <span className="absolute right-4 top-4 bg-[#f2ff5e] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-black">
          {isAr ? 'مختار' : 'Featured'}
        </span>
      )}

      <div className="relative z-10 flex min-h-[430px] flex-col justify-end p-5">
        <span className="mb-3 w-fit border border-white/16 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/70 backdrop-blur">
          {isAr ? category?.labelAr : category?.label}
        </span>
        <h3 className="text-2xl font-black leading-tight text-white">{title}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/62">{description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.client && <span className="bg-white/8 px-2.5 py-1 text-xs text-white/70">{project.client}</span>}
          {project.duration && <span className="bg-white/8 px-2.5 py-1 text-xs text-white/70">{project.duration}</span>}
          <span className="bg-white/8 px-2.5 py-1 text-xs text-white/70">{project.year}</span>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#f2ff5e]">
            {isAr ? 'تشغيل' : 'Play'}
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition group-hover:bg-[#f2ff5e]">
            ▶
          </span>
        </div>
      </div>
    </motion.button>
  );
}
