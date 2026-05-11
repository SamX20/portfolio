'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Locale, Profile, SectionsData, Skill, Stat } from '@/types';
import ScrollReveal from './ScrollReveal';
import usePortableMotion from '@/lib/usePortableMotion';
import VideoPlayer from './VideoPlayer';

interface HeroProps {
  locale: Locale;
  profile: Profile;
  sections: SectionsData;
  stats: Stat[];
  skills: Skill[];
}

const HERO_START_EVENT = 'sam:start-hero-video';

function HeroLoadingOverlay({
  waitingForSound,
  onStartWithSound,
}: {
  waitingForSound: boolean;
  onStartWithSound: () => void;
}) {
  return (
    <motion.div
      className="hero-loader-overlay fixed inset-0 z-[120] grid place-items-center bg-[#080808]/88 px-5 text-white backdrop-blur-xl"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute left-1/2 top-1/2 h-[44vw] max-h-[520px] w-[44vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d98fcb]/18 blur-3xl" />
      </div>

      <div className="relative text-center">
        <p className="hero-loader-name mx-auto w-[11ch] overflow-hidden whitespace-nowrap border-r-2 border-[#d98fcb] font-mono text-[clamp(2.4rem,9vw,7rem)] font-black leading-none tracking-normal text-white">
          SAMER JABER
        </p>
        <p className="mt-7 text-sm font-black uppercase tracking-[0.34em] text-white/58">
          Loading<span className="loading-dots" aria-hidden="true" />
        </p>
        <button
          type="button"
          onClick={onStartWithSound}
          className={`accent-gradient mt-8 rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#090909] transition hover:brightness-110 ${waitingForSound ? '' : 'opacity-[.82]'}`}
        >
          Start with sound
        </button>
      </div>
    </motion.div>
  );
}

export default function Hero({ locale, profile, sections, stats, skills }: HeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isPortable = usePortableMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const isAr = locale === 'ar';
  const hasHeroVideo = Boolean(sections.hero.video_url);
  const manuallyStartedRef = useRef(false);
  const [heroVideoReady, setHeroVideoReady] = useState(!hasHeroVideo);
  const [autoPlayBlocked, setAutoPlayBlocked] = useState(false);

  const title = isAr ? sections.hero.title_ar || sections.hero.title : sections.hero.title;
  const subtitle = isAr ? sections.hero.subtitle_ar || sections.hero.subtitle : sections.hero.subtitle;
  const description = isAr ? sections.hero.description_ar || sections.hero.description : sections.hero.description;
  const aboutTitle = isAr ? sections.about.title_ar || sections.about.title : sections.about.title;
  const about = isAr ? sections.about.content_ar || sections.about.content : sections.about.content;
  const showHeroLoader = hasHeroVideo && (!heroVideoReady || autoPlayBlocked);

  useEffect(() => {
    manuallyStartedRef.current = false;
    setHeroVideoReady(!hasHeroVideo);
    setAutoPlayBlocked(false);
  }, [hasHeroVideo, sections.hero.video_url]);

  useEffect(() => {
    if (!hasHeroVideo || heroVideoReady || autoPlayBlocked) return undefined;

    const fallback = window.setTimeout(() => {
      setAutoPlayBlocked(true);
    }, 6500);

    return () => window.clearTimeout(fallback);
  }, [autoPlayBlocked, hasHeroVideo, heroVideoReady]);

  const startHeroWithSound = () => {
    manuallyStartedRef.current = true;
    window.dispatchEvent(new Event(HERO_START_EVENT));
    setHeroVideoReady(true);
    setAutoPlayBlocked(false);
  };

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden bg-[#080808] pt-16" dir={isAr ? 'rtl' : 'ltr'}>
      {showHeroLoader ? (
        <HeroLoadingOverlay
          waitingForSound={autoPlayBlocked}
          onStartWithSound={startHeroWithSound}
        />
      ) : null}

      {sections.hero.video_url ? (
        <div className="absolute inset-0 z-0">
          <VideoPlayer
            embedCode=""
            videoUrl={sections.hero.video_url}
            thumbnail=""
            title="Hero Video"
            autoPlay
            loop
            muted={false}
            onReady={() => {
              setHeroVideoReady(true);
              setAutoPlayBlocked(false);
            }}
            onAutoPlayBlocked={() => {
              if (!manuallyStartedRef.current) {
                setAutoPlayBlocked(true);
              }
            }}
            startEventName={HERO_START_EVENT}
            className="absolute inset-0 h-full w-full rounded-none opacity-95"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,.86)_0%,rgba(8,8,8,.58)_42%,rgba(8,8,8,.22)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_30%,rgba(185,156,255,.18),transparent_34%),linear-gradient(180deg,rgba(8,8,8,.14)_0%,rgba(8,8,8,.12)_48%,#080808_100%)]" />
        </div>
      ) : null}

      <div className={`absolute inset-0 ${sections.hero.video_url ? 'opacity-22' : 'opacity-35'}`}>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <motion.div
          className="absolute inset-y-0 left-[-20%] w-[42%] bg-[#8f7cff]/16 blur-2xl"
          animate={isPortable ? undefined : { x: ['0%', '210%', '0%'] }}
          transition={isPortable ? undefined : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        className="absolute bottom-12 left-0 right-0 hidden rotate-[-4deg] gap-4 overflow-hidden border-y border-white/10 bg-white/[0.03] py-3 text-xs font-black uppercase tracking-[0.3em] text-white/38 lg:flex"
        style={isPortable ? undefined : { y }}
      >
        {[...Array(8)].map((_, index) => (
          <span key={index} className="shrink-0">
            Motion Design / Edit / Timing / Storyboard /
          </span>
        ))}
      </motion.div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-4 pb-28 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <div className={`max-w-4xl ${isAr ? 'text-right' : 'text-left'}`}>
          <p className="mb-5 text-xs font-black uppercase tracking-[0.34em] text-[#d8c9ff]">
            {subtitle}
          </p>
          <h1 className="max-w-5xl text-[clamp(3rem,8vw,7.4rem)] font-black leading-[1.02] tracking-normal text-white drop-shadow-[0_12px_42px_rgba(0,0,0,.72)]">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/78 drop-shadow-[0_8px_24px_rgba(0,0,0,.68)] sm:text-lg">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className="accent-gradient rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#090909] transition hover:brightness-110">
              {isAr ? 'شاهد الأعمال' : sections.hero.cta_text}
            </a>
            <a href="#contact" className="rounded-full border border-white/20 bg-black/20 px-6 py-3 text-sm font-bold text-white/90 backdrop-blur transition hover:border-white/45">
              {isAr ? 'تواصل معي' : 'Book Sam'}
            </a>
          </div>
        </div>

        <div className="mt-12 max-w-xl">
          {!sections.hero.video_url ? (
            <div className="relative aspect-video overflow-hidden border border-white/14 bg-[radial-gradient(circle_at_32%_18%,rgba(185,156,255,.24),transparent_34%),radial-gradient(circle_at_70%_36%,rgba(115,167,255,.16),transparent_32%),linear-gradient(145deg,#161616,#090909)]">
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_35%,rgba(185,156,255,.92)_36%,rgba(185,156,255,.92)_43%,transparent_44%,transparent_100%)]"
                animate={isPortable ? { x: '18%' } : { x: ['-120%', '120%'] }}
                transition={isPortable ? { duration: 0 } : { duration: 2.4, repeat: Infinity, repeatDelay: 1.1, ease: 'easeInOut' }}
              />
              <div className="absolute inset-0 grid grid-rows-6">
                {[...Array(6)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="border-b border-white/10 bg-white/[0.02]"
                    animate={isPortable ? { opacity: 0.22 } : { opacity: [0.12, 0.48, 0.12] }}
                    transition={isPortable ? { duration: 0 } : { duration: 1.4 + index * 0.18, repeat: Infinity, delay: index * 0.12 }}
                  />
                ))}
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b99cff]">{profile.name}</p>
                <p className="mt-2 text-3xl font-black uppercase leading-none text-white sm:text-5xl">Edit<br />Frame<br />Move</p>
              </div>
            </div>
          ) : null}

          <div className="border border-white/12 bg-[#101010]/82 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">{aboutTitle}</p>
            <p className="mt-2 text-sm leading-6 text-white/72">{about}</p>
          </div>
        </div>
      </div>

      <ScrollReveal className="relative z-10 mx-auto grid max-w-7xl gap-px border-y border-white/10 bg-white/10 sm:grid-cols-3">
        {stats.slice(0, 3).map((stat) => (
          <div key={stat.id} className="bg-[#080808]/92 px-4 py-5 text-center backdrop-blur">
            <p className="text-3xl font-black text-white">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/42">{stat.label}</p>
          </div>
        ))}
      </ScrollReveal>

      <ScrollReveal className="relative z-10 mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-6 sm:px-6 lg:px-8" delay={120}>
        {skills.slice(0, 6).map((skill) => (
          <span key={skill.id} className="border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/62 backdrop-blur">
            {skill.name}
          </span>
        ))}
      </ScrollReveal>
    </section>
  );
}
