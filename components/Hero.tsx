'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LuArrowDown, LuArrowUpRight, LuVolume2, LuVolumeX } from 'react-icons/lu';
import { Locale, Profile, SectionsData } from '@/types';
import VideoPlayer from './VideoPlayer';

interface HeroProps {
  locale: Locale;
  profile: Profile;
  sections: SectionsData;
}

const HERO_MUTE_EVENT = 'sam:set-hero-muted';
const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function Hero({ locale, sections }: HeroProps) {
  const isAr = locale === 'ar';
  const reels = [sections.hero.video_url, sections.hero.video_url_alt].filter(Boolean) as string[];
  const [activeReel, setActiveReel] = useState(0);
  const [muted, setMuted] = useState(true);
  const activeVideoUrl = reels[activeReel];

  const title = isAr ? sections.hero.title_ar || sections.hero.title : sections.hero.title;
  const subtitle = isAr ? sections.hero.subtitle_ar || sections.hero.subtitle : sections.hero.subtitle;
  const description = isAr ? sections.hero.description_ar || sections.hero.description : sections.hero.description;

  useEffect(() => {
    const handleHeroMute = (event: Event) => {
      const nextMuted = (event as CustomEvent<{ muted?: boolean }>).detail?.muted;
      setMuted(nextMuted ?? true);
    };
    window.addEventListener(HERO_MUTE_EVENT, handleHeroMute);
    return () => window.removeEventListener(HERO_MUTE_EVENT, handleHeroMute);
  }, []);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {activeVideoUrl ? (
        <div className="absolute inset-0 -z-10">
          <VideoPlayer
            key={activeVideoUrl}
            embedCode=""
            videoUrl={activeVideoUrl}
            thumbnail=""
            title="Showreel"
            autoPlay
            loop
            muted={muted}
            volume={0.4}
            fadeInAudio
            fill
            preload="metadata"
            showLoadingIndicator={false}
            className="absolute inset-0 h-full w-full rounded-none"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-[#0a0a0a]/40" />
        </div>
      ) : null}

      <div className="container-x flex min-h-[100svh] flex-col justify-end pb-10 pt-28 sm:pb-14">
        <motion.p
          className="eyebrow mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          {subtitle}
        </motion.p>

        <motion.h1
          className="display max-w-6xl text-[clamp(2.75rem,8vw,7.5rem)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease }}
        >
          {title}
        </motion.h1>

        <motion.div
          className="mt-10 flex flex-col gap-8 border-t border-white/15 pt-6 md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <p className="max-w-md text-base leading-7 text-white/70">{description}</p>

          <div className="flex flex-wrap items-center gap-3">
            <a href="#work" className="btn btn-primary">
              {isAr ? 'شاهد الأعمال' : sections.hero.cta_text || 'View work'}
              <LuArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#contact" className="btn btn-ghost">
              {isAr ? 'ابدأ مشروعك' : 'Start a project'}
              <LuArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            </a>
            {activeVideoUrl ? (
              <div className="flex items-center gap-1 ps-2">
                {reels.length > 1
                  ? reels.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveReel(index)}
                        data-active={activeReel === index}
                        className="chip h-9 px-3 font-mono text-xs"
                        aria-label={`Showreel ${index + 1}`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </button>
                    ))
                  : null}
                <button
                  type="button"
                  onClick={() => setMuted((value) => !value)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white/80 transition hover:border-white hover:text-white"
                  aria-label={muted ? 'Unmute showreel' : 'Mute showreel'}
                >
                  {muted ? <LuVolumeX className="h-4 w-4" /> : <LuVolume2 className="h-4 w-4" />}
                </button>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
