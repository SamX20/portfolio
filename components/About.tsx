'use client';

import { Locale, SectionsData, Skill, Stat } from '@/types';
import ScrollReveal from './ScrollReveal';

interface AboutProps {
  locale: Locale;
  sections: SectionsData;
  stats: Stat[];
  skills: Skill[];
}

const statLabels: Record<string, { en: string; ar: string }> = {
  clients_count: { en: 'Happy clients', ar: 'عميل راضٍ' },
  projects_count: { en: 'Projects delivered', ar: 'مشروع منجز' },
  years_exp: { en: 'Years of experience', ar: 'سنوات خبرة' },
};

function getProgramIcon(program: string) {
  if (/after effects/i.test(program)) return '/Software-icons/adobe-after-effects-icon.svg';
  if (/premiere|premier/i.test(program)) return '/Software-icons/Adobe_Premiere_Pro_CC_icon.svg';
  if (/blender/i.test(program)) return '/Software-icons/blender-icon.svg';
  if (/illustrator/i.test(program)) return '/Software-icons/adobe-illustrator-icon.svg';
  if (/photoshop/i.test(program)) return '/Software-icons/adobe-photoshop-icon.svg';
  if (/davinci|resolve/i.test(program)) return '/Software-icons/DaVinci_Resolve_Studio.png';
  if (/ai tools|generative/i.test(program)) return '/Software-icons/Ai%20Tools.avif';
  return null;
}

export default function About({ locale, sections, stats, skills }: AboutProps) {
  const isAr = locale === 'ar';
  const title = isAr ? sections.about.title_ar || sections.about.title : sections.about.title;
  const content = isAr ? sections.about.content_ar || sections.about.content : sections.about.content;
  const programs = Array.from(new Set(
    [...skills]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((skill) => skill.program || skill.name)
      .filter(Boolean),
  ));

  return (
    <section id="about" className="site-section" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <ScrollReveal>
            <p className="eyebrow">{isAr ? 'الاستوديو' : 'The studio'}</p>
          </ScrollReveal>
          <ScrollReveal delay={60}>
            <h2 className="display text-[clamp(1.9rem,4vw,3.5rem)] !leading-[1.1]">{title}</h2>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--muted)]">{content}</p>
          </ScrollReveal>
        </div>

        {stats.length > 0 ? (
          <div className="mt-20 grid grid-cols-1 border-t border-[var(--line)] sm:grid-cols-3">
            {stats.slice(0, 3).map((stat, index) => (
              <ScrollReveal key={stat.id} delay={index * 60}>
                <div className="border-b border-[var(--line)] py-8 sm:border-b-0 sm:pe-8 sm:pt-10">
                  <p className="display text-6xl sm:text-7xl">{stat.value}</p>
                  <p className="mt-3 text-sm text-[var(--muted)]">{statLabels[stat.id]?.[locale] || stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : null}

        {programs.length > 0 ? (
          <div className="mt-20 flex flex-col gap-6 border-t border-[var(--line)] pt-10 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-[var(--muted)]">{isAr ? 'الأدوات التي نعمل بها' : 'Tools we work with'}</p>
            <div className="flex flex-wrap gap-2">
              {programs.map((program) => {
                const icon = getProgramIcon(program);
                return (
                  <span key={program} className="chip gap-2 text-[var(--foreground)]">
                    {icon ? <img src={icon} alt="" loading="lazy" className="h-4 w-4 object-contain" /> : null}
                    {program}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
