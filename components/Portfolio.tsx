'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CATEGORIES, Locale, Project, ProjectCategory } from '@/types';
import ProjectCard from './ProjectCard';
import ScrollReveal from './ScrollReveal';
import { getGoogleDriveThumbnail } from '@/lib/videoUtils';

interface PortfolioProps {
  projects?: Project[];
  locale: Locale;
}

function toEmbedUrl(url?: string) {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (parsed.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`;
    }
    if (parsed.hostname.includes('drive.google.com')) {
      const match = url.match(/\/file\/d\/([^/]+)/);
      return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
    }
    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : url;
    }
  } catch {
    return url;
  }

  return url;
}

export default function Portfolio({ projects = [], locale }: PortfolioProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>('all');
  const [selected, setSelected] = useState<Project | null>(null);
  const isAr = locale === 'ar';

  const filtered = useMemo(
    () => (activeCategory === 'all' ? projects : projects.filter((project) => project.category.includes(activeCategory))),
    [activeCategory, projects],
  );

  const modalTitle = selected ? (isAr ? selected.title_ar || selected.title : selected.title) : '';
  const modalDescription = selected ? (isAr ? selected.description_ar || selected.description : selected.description) : '';
  const embedUrl = toEmbedUrl(selected?.video_url);
  const selectedThumbnail = selected?.thumbnail || getGoogleDriveThumbnail(selected?.video_url);

  return (
    <section id="projects" className="bg-[#080808] px-4 py-24 sm:px-6 lg:px-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <ScrollReveal variant={isAr ? 'right' : 'left'} className={isAr ? 'text-right' : 'text-left'}>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.34em] text-[#b99cff]">
              {isAr ? 'أعمال مختارة' : 'Selected Work'}
            </p>
            <h2 className="max-w-3xl text-4xl font-black leading-none text-white sm:text-6xl">
              {isAr ? 'معرض حاد الإيقاع، مصمم للحركة.' : 'A sharp gallery built for motion.'}
            </h2>
          </ScrollReveal>
          <ScrollReveal variant={isAr ? 'left' : 'right'} delay={120}>
            <p className="max-w-sm text-sm leading-7 text-white/52">
              {isAr
                ? 'أضف روابط Google Drive أو ملفات الفيديو من لوحة التحكم، وسيظهر كل عمل هنا بشكل أنيق وقابل للتشغيل.'
                : 'Add Google Drive links or uploaded videos from the admin, and each project becomes playable here.'}
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal className="mb-10 flex flex-wrap gap-2" delay={180}>
          {[{ value: 'all', label: 'All', labelAr: 'الكل' }, ...CATEGORIES].map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => setActiveCategory(category.value as ProjectCategory)}
              className={`border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                activeCategory === category.value
                  ? 'accent-gradient border-[#d98fcb] text-[#090909]'
                  : 'border-white/10 text-white/55 hover:border-white/35 hover:text-white'
              }`}
            >
              {isAr ? category.labelAr : category.label}
            </button>
          ))}
        </ScrollReveal>

        <div key={activeCategory} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project, index) => (
              <div key={project.id}>
                <ScrollReveal delay={index * 90} variant="scale">
                  <ProjectCard project={project} locale={locale} onOpen={setSelected} />
                </ScrollReveal>
              </div>
            ))}
        </div>

        {filtered.length === 0 && (
          <div className="border border-white/10 py-16 text-center text-white/45">
            {isAr ? 'لا توجد أعمال ضمن هذا التصنيف حالياً.' : 'No projects in this category yet.'}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center bg-black/82 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-6xl overflow-hidden border border-white/12 bg-[#0d0d0d]"
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#b99cff]">
                    {selected.client || selected.category.join(' / ')}
                  </p>
                  <h3 className="mt-1 text-xl font-black text-white">{modalTitle}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="grid h-10 w-10 place-items-center border border-white/12 text-white/70 transition hover:border-white/40 hover:text-white"
                  aria-label="Close video"
                >
                  ×
                </button>
              </div>

              <div className="aspect-video bg-black">
                {selected.embed_code ? (
                  <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: selected.embed_code }} />
                ) : embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={modalTitle}
                    className="h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : selectedThumbnail ? (
                  <img src={selectedThumbnail} alt={modalTitle} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-white/45">
                    {isAr ? 'أضف رابط الفيديو من لوحة التحكم لعرضه هنا.' : 'Add a video link from the admin.'}
                  </div>
                )}
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-start">
                <p className="max-w-3xl text-sm leading-7 text-white/64">{modalDescription}</p>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {selected.technologies?.map((tech) => (
                    <span key={tech} className="border border-white/10 px-3 py-1.5 text-xs text-white/56">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
