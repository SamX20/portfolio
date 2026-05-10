'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Locale, Profile, SectionsData, Skill, Stat } from '@/types';
import ScrollReveal from './ScrollReveal';

interface HeroProps {
  locale: Locale;
  profile: Profile;
  sections: SectionsData;
  stats: Stat[];
  skills: Skill[];
}

export default function Hero({ locale, profile, sections, stats, skills }: HeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const isAr = locale === 'ar';

  const title = isAr ? sections.hero.title_ar || sections.hero.title : sections.hero.title;
  const subtitle = isAr ? sections.hero.subtitle_ar || sections.hero.subtitle : sections.hero.subtitle;
  const description = isAr ? sections.hero.description_ar || sections.hero.description : sections.hero.description;
  const aboutTitle = isAr ? sections.about.title_ar || sections.about.title : sections.about.title;
  const about = isAr ? sections.about.content_ar || sections.about.content : sections.about.content;

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden bg-[#080808] pt-16" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 opacity-35">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <motion.div
          className="absolute inset-y-0 left-[-20%] w-[42%] bg-[#f2ff5e]/12 blur-2xl"
          animate={{ x: ['0%', '210%', '0%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        className="absolute bottom-12 left-0 right-0 flex rotate-[-4deg] gap-4 overflow-hidden border-y border-white/10 bg-white/[0.03] py-3 text-xs font-black uppercase tracking-[0.3em] text-white/38"
        style={{ y }}
      >
        {[...Array(8)].map((_, index) => (
          <span key={index} className="shrink-0">
            Motion Design / Edit / Timing / Storyboard /
          </span>
        ))}
      </motion.div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-start gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pt-12 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pt-16">
        <div className={isAr ? 'text-right' : 'text-left'}>
          <p
            className="mb-5 text-xs font-black uppercase tracking-[0.34em] text-[#f2ff5e]"
          >
            {subtitle}
          </p>
          <h1
            className="max-w-5xl text-[clamp(3rem,10vw,8.5rem)] font-black leading-[1.05] tracking-normal text-white"
          >
            {title}
          </h1>
          <p
            className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg"
          >
            {description}
          </p>

          <div
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a href="#projects" className="rounded-full bg-[#f2ff5e] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-white">
              {isAr ? 'شاهد الأعمال' : sections.hero.cta_text}
            </a>
            <a href="#contact" className="rounded-full border border-white/16 px-6 py-3 text-sm font-bold text-white/88 transition hover:border-white/40">
              {isAr ? 'تواصل معي' : 'Book Sam'}
            </a>
          </div>
        </div>

        <div
          className="relative mx-auto aspect-[4/5] w-full max-w-[520px]"
        >
          <div className="absolute inset-0 border border-white/14 bg-[radial-gradient(circle_at_50%_20%,rgba(242,255,94,.18),transparent_34%),linear-gradient(145deg,#161616,#090909)]" />
          <div className="absolute inset-5 overflow-hidden border border-white/10 bg-black">
            <motion.div
              className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_35%,rgba(242,255,94,.92)_36%,rgba(242,255,94,.92)_43%,transparent_44%,transparent_100%)]"
              animate={{ x: ['-120%', '120%'] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.1, ease: 'easeInOut' }}
            />
            <div className="absolute inset-0 grid grid-rows-6">
              {[...Array(6)].map((_, index) => (
                <motion.div
                  key={index}
                  className="border-b border-white/10 bg-white/[0.02]"
                  animate={{ opacity: [0.12, 0.48, 0.12] }}
                  transition={{ duration: 1.4 + index * 0.18, repeat: Infinity, delay: index * 0.12 }}
                />
              ))}
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#f2ff5e]">{profile.name}</p>
              <p className="mt-2 text-3xl font-black uppercase leading-none text-white sm:text-5xl">Edit<br />Frame<br />Move</p>
            </div>
          </div>
          <div className="absolute -bottom-5 left-6 right-6 border border-white/12 bg-[#101010]/95 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">{aboutTitle}</p>
            <p className="mt-2 text-sm leading-6 text-white/72">{about}</p>
          </div>
        </div>
      </div>

      <ScrollReveal className="relative z-10 mx-auto grid max-w-7xl gap-px border-y border-white/10 bg-white/10 sm:grid-cols-3">
        {stats.slice(0, 3).map((stat) => (
          <div key={stat.id} className="bg-[#080808] px-4 py-5 text-center">
            <p className="text-3xl font-black text-white">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/42">{stat.label}</p>
          </div>
        ))}
      </ScrollReveal>

      <ScrollReveal className="relative z-10 mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-6 sm:px-6 lg:px-8" delay={120}>
        {skills.slice(0, 6).map((skill) => (
          <span key={skill.id} className="border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/56">
            {skill.name}
          </span>
        ))}
      </ScrollReveal>
    </section>
  );
}
