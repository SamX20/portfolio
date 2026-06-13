'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CATEGORIES, Client, Locale, Project, ProjectCategory } from '@/types';
import ProjectCard from './ProjectCard';
import ScrollReveal from './ScrollReveal';
import VideoPlayer from './VideoPlayer';
import { getGoogleDriveThumbnail } from '@/lib/videoUtils';

const HERO_MUTE_EVENT = 'sam:set-hero-muted';
const INITIAL_PROJECT_COUNT = 9;

interface PortfolioProps {
  projects?: Project[];
  clients?: Client[];
  locale: Locale;
  selectedClientId?: string | null;
  onClearClient?: () => void;
}

function getProjectClientKey(project: Project) {
  return project.client_id || (project.client ? `legacy:${project.client}` : null);
}

export default function Portfolio({ projects = [], clients = [], locale, selectedClientId = null, onClearClient }: PortfolioProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>('all');
  const [selected, setSelected] = useState<Project | null>(null);
  const [showModalDescriptionExpanded, setShowModalDescriptionExpanded] = useState(false);
  const [visibleProjectCount, setVisibleProjectCount] = useState(INITIAL_PROJECT_COUNT);
  const isAr = locale === 'ar';

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => b.year - a.year || a.sort_order - b.sort_order),
    [projects],
  );

  const clientFilteredProjects = useMemo(
    () => (selectedClientId ? sortedProjects.filter((project) => getProjectClientKey(project) === selectedClientId) : sortedProjects),
    [selectedClientId, sortedProjects],
  );

  const selectedClientName = useMemo(() => {
    if (!selectedClientId) return '';
    const linkedClient = clients.find((client) => client.id === selectedClientId);
    if (linkedClient) return linkedClient.name;
    return selectedClientId.startsWith('legacy:') ? selectedClientId.replace('legacy:', '') : '';
  }, [clients, selectedClientId]);

  const availableCategories = useMemo(
    () => CATEGORIES.filter((category) => clientFilteredProjects.some((project) => project.category.includes(category.value))),
    [clientFilteredProjects],
  );

  const filtered = useMemo(
    () => (activeCategory === 'all' ? clientFilteredProjects : clientFilteredProjects.filter((project) => project.category.includes(activeCategory))),
    [activeCategory, clientFilteredProjects],
  );

  const featuredProjects = useMemo(
    () => filtered.filter((project) => project.featured),
    [filtered],
  );

  const regularProjects = useMemo(
    () => filtered.filter((project) => !project.featured),
    [filtered],
  );

  const visibleRegularProjects = useMemo(
    () => regularProjects.slice(0, visibleProjectCount),
    [regularProjects, visibleProjectCount],
  );

  const canShowMoreProjects = visibleProjectCount < regularProjects.length;

  useEffect(() => {
    if (activeCategory !== 'all' && !availableCategories.some((category) => category.value === activeCategory)) {
      setActiveCategory('all');
    }
  }, [activeCategory, availableCategories]);

  useEffect(() => {
    setVisibleProjectCount(INITIAL_PROJECT_COUNT);
  }, [activeCategory, selectedClientId]);

  const modalTitle = selected ? (isAr ? selected.title_ar || selected.title : selected.title) : '';
  const modalDescription = selected ? (isAr ? selected.description_ar || selected.description : selected.description) : '';
  const selectedThumbnail = selected?.thumbnail || getGoogleDriveThumbnail(selected?.video_url);
  const descriptionIsLong = modalDescription.length > 150;
  const displayedModalDescription = descriptionIsLong && !showModalDescriptionExpanded ? `${modalDescription.slice(0, 150).trim()}...` : modalDescription;
  const descriptionToggleText = showModalDescriptionExpanded ? (isAr ? 'عرض أقل' : 'See less') : (isAr ? 'عرض المزيد..' : 'See more..');

  const openProject = (project: Project) => {
    setShowModalDescriptionExpanded(false);
    window.dispatchEvent(new CustomEvent(HERO_MUTE_EVENT, { detail: { muted: true } }));
    setSelected(project);
    setShowModalDescriptionExpanded(false);
  };

  const closeProject = () => {
    setSelected(null);
  };

  return (
    <section id="projects" className="relative bg-[#080808] px-4 py-24 sm:px-6 lg:px-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <ScrollReveal variant={isAr ? 'right' : 'left'} className={isAr ? 'text-right' : 'text-left'}>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.34em] text-[#8ed8ff]">
              {isAr ? 'أعمال مختارة' : 'Selected Work'}
            </p>
            <h2 className="max-w-3xl text-4xl font-black leading-none text-white sm:text-6xl">
              {isAr ? 'معرض حد الإيقاع، مصمم للحركة.' : 'A sharp gallery built for motion.'}
            </h2>
          </ScrollReveal>
        </div>

        {featuredProjects.length > 0 && (
          <ScrollReveal className="mb-14" delay={120}>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[#8ed8ff]">
                  {isAr ? 'في الواجهة' : 'Featured Projects'}
                </p>
                <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  {isAr ? 'الأعمال التي تستحق أن تبدأ بها.' : 'Start with the work that should lead.'}
                </h3>
              </div>
              <p className="hidden max-w-xs text-sm leading-6 text-white/42 md:block">
                {isAr ? 'المشاريع المختارة تظهر هنا أولاً حسب التصنيف الحالي.' : 'Pinned work appears first for the current category.'}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {featuredProjects.map((project, index) => (
                <ScrollReveal key={project.id} delay={index * 90} variant="scale">
                  <ProjectCard project={project} locale={locale} onOpen={openProject} featuredLayout />
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        )}

        {selectedClientId && selectedClientName && (
          <ScrollReveal className="mb-5 flex flex-wrap items-center gap-3" delay={160}>
            <span className="border border-[#8ed8ff]/35 bg-[#8ed8ff]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#8ed8ff]">
              {isAr ? `مشاريع ${selectedClientName}` : `${selectedClientName} projects`}
            </span>
            <button
              type="button"
              onClick={onClearClient}
              className="rounded-full border border-white/12 px-4 py-2 text-xs font-bold text-white/52 transition hover:border-white/35 hover:text-white"
            >
              {isAr ? 'إزالة الفلتر' : 'Clear filter'}
            </button>
          </ScrollReveal>
        )}

        <ScrollReveal className="mb-10 flex flex-wrap gap-2" delay={180}>
          {[{ value: 'all', label: 'All', labelAr: 'الكل' }, ...availableCategories].map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => setActiveCategory(category.value as ProjectCategory)}
              className={`border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                activeCategory === category.value
                  ? 'accent-gradient border-[#4aa3ff] text-[#090909]'
                  : 'border-white/10 text-white/55 hover:border-white/35 hover:text-white'
              }`}
            >
              {isAr ? category.labelAr : category.label}
            </button>
          ))}
        </ScrollReveal>

        <div key={activeCategory} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleRegularProjects.map((project, index) => (
              <div key={project.id}>
                <ScrollReveal delay={index * 90} variant="scale">
                  <ProjectCard project={project} locale={locale} onOpen={openProject} />
                </ScrollReveal>
              </div>
            ))}
        </div>

        {canShowMoreProjects && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleProjectCount((current) => current + INITIAL_PROJECT_COUNT)}
              className="rounded-full border border-white/14 bg-white/[0.035] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/72 transition hover:border-[#8ed8ff]/55 hover:text-white"
            >
              {isAr ? 'عرض المزيد' : 'View more'}
            </button>
          </div>
        )}

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
            onClick={closeProject}
          >
            <motion.div
              className="relative w-full max-w-6xl overflow-hidden border border-white/12 bg-[#0d0d0d]"
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeProject}
                className="absolute right-3 top-3 z-[5] grid h-11 w-11 place-items-center rounded-full border border-white/18 bg-black/70 text-2xl leading-none text-white shadow-2xl shadow-black/40 backdrop-blur transition hover:border-[#8ed8ff]/70 hover:text-[#8ed8ff]"
                aria-label="Close project"
                title="Close"
              >
                ×
              </button>
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#8ed8ff]">
                    {selected.client || selected.category.join(' / ')}
                  </p>
                  <h3 className="mt-1 text-xl font-black text-white">{modalTitle}</h3>
                </div>
              </div>

              <div className="bg-black">
                <VideoPlayer
                  embedCode={selected.embed_code || undefined}
                  videoUrl={selected.video_url || undefined}
                  thumbnail={selectedThumbnail}
                  title={modalTitle}
                  className="inline-block w-auto rounded-none"
                  objectFit="contain"
                />
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-start">
                <div className="max-w-3xl">
                  <p className="text-sm leading-7 text-white/64">{displayedModalDescription}</p>
                  {descriptionIsLong && (
                    <button
                      type="button"
                      onClick={() => setShowModalDescriptionExpanded((current) => !current)}
                      className="mt-3 text-sm font-semibold text-sky-300 hover:text-sky-200"
                    >
                      {descriptionToggleText}
                    </button>
                  )}
                  {selected.video_url && (
                    <a
                      href={selected.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex rounded-full border border-[#8ed8ff]/45 bg-[#8ed8ff]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8ed8ff] transition hover:border-[#8ed8ff] hover:bg-[#8ed8ff]/16 hover:text-white"
                    >
                      {isAr ? 'فتح الرابط المباشر' : 'Open direct link'}
                    </a>
                  )}
                </div>
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

