'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { CATEGORIES, Client, Locale, Project, ProjectCategory } from '@/types';
import ProjectCard from './ProjectCard';
import ScrollReveal from './ScrollReveal';
import VideoPlayer from './VideoPlayer';
import { getGoogleDriveThumbnail } from '@/lib/videoUtils';
import usePortableMotion from '@/lib/usePortableMotion';

const HERO_MUTE_EVENT = 'sam:set-hero-muted';
const INITIAL_PROJECT_COUNT = 6;

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
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isPortable = usePortableMotion();
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
    () => filtered.filter((project) => project.featured).slice(0, 5),
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

  useEffect(() => {
    if (!isPortable || selected) {
      setActivePreviewId(null);
      return;
    }

    let animationFrame = 0;
    let scrollSettleTimer = 0;
    const updateActivePreview = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const cards = Array.from(
          sectionRef.current?.querySelectorAll<HTMLElement>('[data-preview-project-id]') || [],
        );
        const viewportCenter = window.innerHeight / 2;
        let closest: { id: string; distance: number } | null = null;

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
          if (visibleHeight < Math.min(120, rect.height * 0.3)) return;

          const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
          const id = card.dataset.previewProjectId;
          if (id && (!closest || distance < closest.distance)) {
            closest = { id, distance };
          }
        });

        setActivePreviewId((current) => current === closest?.id ? current : closest?.id || null);
      });
    };
    const handleScroll = () => {
      setActivePreviewId(null);
      window.clearTimeout(scrollSettleTimer);
      scrollSettleTimer = window.setTimeout(updateActivePreview, 140);
    };

    updateActivePreview();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateActivePreview);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(scrollSettleTimer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateActivePreview);
    };
  }, [activeCategory, isPortable, selected, selectedClientId, visibleProjectCount]);

  useEffect(() => {
    if (!selected) return;

    const previousBodyOverflow = document.body.style.overflow;
    const resetFrame = window.requestAnimationFrame(() => {
      modalRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(resetFrame);
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selected]);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      const project = projects.find((item) => item.id === id);
      if (project) {
        window.dispatchEvent(new CustomEvent(HERO_MUTE_EVENT, { detail: { muted: true } }));
        setShowModalDescriptionExpanded(false);
        setSelected(project);
      }
    };
    window.addEventListener('sam:open-project', handleOpen);
    return () => window.removeEventListener('sam:open-project', handleOpen);
  }, [projects]);

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
    <section ref={sectionRef} id="work" className="site-section" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container-x">
        <div className="mb-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <ScrollReveal>
            <p className="eyebrow">{isAr ? 'أعمال مختارة' : 'Selected work'}</p>
            <h2 className="display mt-5 text-[clamp(2.25rem,5vw,4.5rem)]">
              {isAr ? 'أعمالنا' : 'Our work'}
              <sup className="ms-2 align-super font-mono text-base text-[var(--muted)]">{filtered.length}</sup>
            </h2>
          </ScrollReveal>
          <ScrollReveal className="flex flex-wrap gap-2" delay={80}>
            {[{ value: 'all', label: 'All', labelAr: 'الكل' }, ...availableCategories].map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setActiveCategory(category.value as ProjectCategory)}
                data-active={activeCategory === category.value}
                className="chip"
              >
                {isAr ? category.labelAr : category.label}
              </button>
            ))}
          </ScrollReveal>
        </div>

        {selectedClientId && selectedClientName && (
          <div className="mb-10 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-[var(--muted)]">{isAr ? 'أعمال' : 'Showing work for'}</span>
            <span className="chip" data-active="true">{selectedClientName}</span>
            <button type="button" onClick={onClearClient} className="text-[var(--muted)] underline-offset-4 hover:text-[var(--foreground)] hover:underline">
              {isAr ? 'إزالة' : 'Clear'}
            </button>
          </div>
        )}

        {featuredProjects.length > 0 && (
          <div className="mb-16 grid gap-x-6 gap-y-14 md:grid-cols-2">
            {featuredProjects.map((project, index) => (
              <ScrollReveal key={project.id} delay={index * 70} className={index === 0 ? 'md:col-span-2' : ''}>
                <ProjectCard project={project} locale={locale} onOpen={openProject} featuredLayout={index === 0} autoPreview={activePreviewId === project.id} />
              </ScrollReveal>
            ))}
          </div>
        )}

        <div key={activeCategory} className="grid gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {visibleRegularProjects.map((project, index) => (
            <ScrollReveal key={project.id} delay={(index % 3) * 70}>
              <ProjectCard project={project} locale={locale} onOpen={openProject} autoPreview={activePreviewId === project.id} />
            </ScrollReveal>
          ))}
        </div>

        {canShowMoreProjects && (
          <div className="mt-16 flex justify-center">
            <button type="button" onClick={() => setVisibleProjectCount((current) => current + INITIAL_PROJECT_COUNT)} className="btn btn-ghost">
              {isAr ? 'عرض المزيد' : 'Load more'}
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="border-y border-[var(--line)] py-16 text-center text-[var(--muted)]">
            {isAr ? 'لا توجد أعمال ضمن هذا التصنيف حالياً.' : 'No projects in this category yet.'}
          </div>
        )}
      </div>

      {typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
          {selected && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/82 p-3 backdrop-blur-xl sm:p-5"
            dir={isAr ? 'rtl' : 'ltr'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProject}
          >
            <motion.div
              ref={modalRef}
              className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl overflow-y-auto overscroll-contain rounded-[20px] border border-[var(--line)] bg-[#111] sm:max-h-[calc(100dvh-2.5rem)]"
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeProject}
                className="absolute end-3 top-3 z-[5] grid h-11 w-11 place-items-center rounded-full border border-white/18 bg-black/70 text-2xl leading-none text-white shadow-2xl shadow-black/40 backdrop-blur transition hover:border-white"
                aria-label="Close project"
                title="Close"
              >
                ×
              </button>
              <div className="flex items-center justify-between border-b border-white/10 py-3 pe-16 ps-5">
                <div>
                  <p className="text-xs text-[var(--muted)]">
                    {selected.client || CATEGORIES.filter((item) => selected.category.includes(item.value)).map((item) => (isAr ? item.labelAr : item.label)).join(' / ')}
                  </p>
                  <h3 className="mt-1 text-xl font-medium tracking-tight">{modalTitle}</h3>
                </div>
              </div>

              <div className="flex min-h-[220px] w-full items-center justify-center overflow-hidden bg-black sm:min-h-[320px]">
                <VideoPlayer
                  embedCode={selected.embed_code || undefined}
                  videoUrl={selected.video_url || undefined}
                  thumbnail={selectedThumbnail}
                  title={modalTitle}
                  className="mx-auto block w-full rounded-none"
                  objectFit="contain"
                />
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-start">
                {selected.video_url && (
                  <div className="flex justify-center md:col-span-2">
                    <a
                      href={selected.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                    >
                      {isAr ? 'فتح الرابط المباشر' : 'Open direct link'}
                    </a>
                  </div>
                )}
                <div className="max-w-3xl">
                  <p className="text-sm leading-7 text-white/64">{displayedModalDescription}</p>
                  {descriptionIsLong && (
                    <button
                      type="button"
                      onClick={() => setShowModalDescriptionExpanded((current) => !current)}
                      className="mt-3 text-sm font-medium underline underline-offset-4"
                    >
                      {descriptionToggleText}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {selected.technologies?.map((tech) => (
                    <span key={tech} className="chip h-8 text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      ) : null}
    </section>
  );
}

