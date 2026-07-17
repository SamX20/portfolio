'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Locale, Profile, SectionsData, Stat } from '@/types';
import ScrollReveal from './ScrollReveal';
import usePortableMotion from '@/lib/usePortableMotion';
import VideoPlayer from './VideoPlayer';

interface HeroProps {
  locale: Locale;
  profile: Profile;
  sections: SectionsData;
  stats: Stat[];
}

const HERO_START_EVENT = 'sam:start-hero-video';
const HERO_MUTE_EVENT = 'sam:set-hero-muted';

const statLabels: Record<string, { en: string; ar: string }> = {
  clients_count: { en: 'Happy clients', ar: 'عميل راضٍ' },
  projects_count: { en: 'Completed projects', ar: 'مشروع منجز' },
  years_exp: { en: 'Years experience', ar: 'سنوات خبرة' },
};

function HeroLoadingOverlay({
  started,
  onStartWithSound,
  onStartWithoutSound,
  fading,
  isAr,
}: {
  started: boolean;
  onStartWithSound: () => void;
  onStartWithoutSound: () => void;
  fading: boolean;
  isAr: boolean;
}) {
  return (
    <div
      className={`hero-loader-overlay fixed inset-0 z-[120] grid place-items-center bg-[#080808]/88 px-5 text-white backdrop-blur-xl ${started ? 'hero-loader-started' : ''} ${fading ? 'hero-loader-fading' : ''}`}
    >
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute left-1/2 top-1/2 h-[44vw] max-h-[520px] w-[44vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-mid)]/18 blur-3xl" />
      </div>

      <div className="relative text-center">
        <p className="hero-loader-name mx-auto w-[11ch] overflow-hidden whitespace-nowrap border-r-2 border-[var(--accent)] font-mono text-[clamp(2.4rem,9vw,7rem)] font-black leading-none tracking-normal text-white">
          SAMER JABER
        </p>
        <p className="mt-7 text-sm font-black uppercase tracking-[0.34em] text-white/58">
          {started ? (
            <span className="loading-dots">{isAr ? '\u062C\u0627\u0631 \u0627\u0644\u062A\u062D\u0645\u064A\u0644' : 'Loading'}</span>
          ) : isAr ? (
            '\u0627\u062E\u062A\u0631 \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629'
          ) : (
            'Choose how to continue'
          )}
        </p>
        <p className="mx-auto mt-4 max-w-[18rem] text-xs font-semibold leading-5 text-white/45 sm:hidden">
          {isAr
            ? '\u0644\u062A\u062C\u0631\u0628\u0629 \u0623\u0641\u0636\u0644\u060C \u0627\u0641\u062A\u062D \u0627\u0644\u0645\u0648\u0642\u0639 \u0639\u0644\u0649 \u0643\u0645\u0628\u064A\u0648\u062A\u0631 \u0623\u0648 \u0644\u0627\u0628\u062A\u0648\u0628.'
            : 'For the best experience, open this site on a PC or laptop.'}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onStartWithSound}
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#06111f] transition hover:brightness-110"
          >
            {isAr ? '\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0645\u0639 \u0627\u0644\u0645\u0648\u0633\u064A\u0642\u0649' : 'Continue with music'}
          </button>
          <button
            type="button"
            onClick={onStartWithoutSound}
            className="rounded-full border border-white/15 bg-black/60 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-white/30 hover:bg-white/5"
          >
            {isAr ? '\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0628\u062F\u0648\u0646 \u0645\u0648\u0633\u064A\u0642\u0649' : 'Continue without music'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ locale, profile, sections, stats }: HeroProps) {
  const isPortable = usePortableMotion();
  const isAr = locale === 'ar';
  const hasHeroVideo = Boolean(sections.hero.video_url);
  const hasAlternateHero = Boolean(sections.hero.video_url_alt);
  const manuallyStartedRef = useRef(false);
  const revealTimerRef = useRef<number | null>(null);
  const switchTimerRef = useRef<number | null>(null);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [heroLoaderFading, setHeroLoaderFading] = useState(false);
  const [introStarted, setIntroStarted] = useState(!hasHeroVideo);
  const [heroMuted, setHeroMuted] = useState(false);
  const [activeHero, setActiveHero] = useState<0 | 1>(0);
  const [heroSwitching, setHeroSwitching] = useState(false);

  const activeVideoUrl = activeHero === 1 && sections.hero.video_url_alt
    ? sections.hero.video_url_alt
    : sections.hero.video_url;
  const activeTheme = activeHero === 1
    ? {
        accent: sections.hero.theme_alt_accent || '#ff9a57',
        mid: sections.hero.theme_alt_accent_mid || '#e5682f',
        deep: sections.hero.theme_alt_accent_deep || '#405044',
      }
    : {
        accent: sections.hero.theme_accent || '#8ed8ff',
        mid: sections.hero.theme_accent_mid || '#4aa3ff',
        deep: sections.hero.theme_accent_deep || '#2563eb',
      };

  const title = isAr ? sections.hero.title_ar || sections.hero.title : sections.hero.title;
  const subtitle = isAr ? sections.hero.subtitle_ar || sections.hero.subtitle : sections.hero.subtitle;
  const description = isAr ? sections.hero.description_ar || sections.hero.description : sections.hero.description;
  const aboutTitle = isAr ? sections.about.title_ar || sections.about.title : sections.about.title;
  const about = isAr ? sections.about.content_ar || sections.about.content : sections.about.content;
  const showHeroLoader = hasHeroVideo && !heroVideoReady;
  const getStatLabel = (stat: Stat) => statLabels[stat.id]?.[locale] || stat.label;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', activeTheme.accent);
    root.style.setProperty('--accent-mid', activeTheme.mid);
    root.style.setProperty('--accent-deep', activeTheme.deep);
  }, [activeTheme.accent, activeTheme.deep, activeTheme.mid]);

  useEffect(() => {
    manuallyStartedRef.current = false;
    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setIntroStarted(!hasHeroVideo);
    setHeroVideoReady(!hasHeroVideo);
    setHeroMuted(false);
    setActiveHero(0);
  }, [hasHeroVideo, sections.hero.video_url]);

  useEffect(() => () => {
    if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
  }, []);

  useEffect(() => {
    if (!introStarted || !hasHeroVideo) return undefined;

    const fadeTimer = window.setTimeout(() => {
      setHeroLoaderFading(true);
      // After 2 seconds of fading, hide completely
      window.setTimeout(() => {
        setHeroVideoReady(true);
      }, 2000);
    }, 3000);

    return () => {
      window.clearTimeout(fadeTimer);
    };
  }, [hasHeroVideo, introStarted]);

  useEffect(() => {
    const handleHeroMute = (event: Event) => {
      const nextMuted = (event as CustomEvent<{ muted?: boolean }>).detail?.muted;
      setHeroMuted(nextMuted ?? true);
    };

    window.addEventListener(HERO_MUTE_EVENT, handleHeroMute);
    return () => window.removeEventListener(HERO_MUTE_EVENT, handleHeroMute);
  }, []);

  const beginHeroIntro = (mute: boolean) => {
    manuallyStartedRef.current = true;
    setIntroStarted(true);
    setHeroMuted(mute);
    window.dispatchEvent(new Event(HERO_START_EVENT));
    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
    }

    window.setTimeout(() => {
      setHeroLoaderFading(true);
      window.setTimeout(() => {
        setHeroVideoReady(true);
      }, 2000);
    }, 3000);

    revealTimerRef.current = window.setTimeout(() => {
      revealTimerRef.current = null;
    }, 5000);
  };

  const startHeroWithSound = () => beginHeroIntro(false);
  const startHeroWithoutSound = () => beginHeroIntro(true);

  const switchHero = (nextHero: 0 | 1) => {
    if (heroSwitching || nextHero === activeHero || (nextHero === 1 && !hasAlternateHero)) return;
    setHeroSwitching(true);
    if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);

    switchTimerRef.current = window.setTimeout(() => {
      setActiveHero(nextHero);
      window.setTimeout(() => setHeroSwitching(false), 80);
    }, 240);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#080808] pt-16" dir={isAr ? 'rtl' : 'ltr'}>
      {showHeroLoader ? (
        <HeroLoadingOverlay
          started={introStarted}
          onStartWithSound={startHeroWithSound}
          onStartWithoutSound={startHeroWithoutSound}
          fading={heroLoaderFading}
          isAr={isAr}
        />
      ) : null}

      {activeVideoUrl ? (
        <div className="absolute inset-0 z-0">
          <VideoPlayer
            key={activeVideoUrl}
            embedCode=""
            videoUrl={activeVideoUrl}
            thumbnail=""
            title={activeHero === 0 ? 'Primary hero reel' : 'Alternate hero reel'}
            autoPlay
            loop
            muted={heroMuted}
            volume={0.4}
            fadeInAudio
            waitForStart={!heroVideoReady}
            startEventName={HERO_START_EVENT}
            className="absolute inset-0 h-full w-full rounded-none opacity-95"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,.86)_0%,rgba(8,8,8,.58)_42%,rgba(8,8,8,.22)_100%)]" />
          <div
            className="absolute inset-0 transition-[background] duration-700"
            style={{ background: 'radial-gradient(circle at 28% 30%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 34%), linear-gradient(180deg, rgba(8,8,8,.14) 0%, rgba(8,8,8,.12) 48%, #080808 100%)' }}
          />
        </div>
      ) : null}

      <div className={`pointer-events-none absolute inset-0 z-[3] bg-[#080808] transition-opacity duration-300 ${heroSwitching ? 'opacity-100' : 'opacity-0'}`} />

      <div className={`absolute inset-0 ${activeVideoUrl ? 'opacity-22' : 'opacity-35'}`}>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <motion.div
          className="absolute inset-y-0 left-[-20%] w-[42%] bg-[var(--accent-mid)]/16 blur-2xl"
          animate={isPortable ? undefined : { x: ['0%', '210%', '0%'] }}
          transition={isPortable ? undefined : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {hasHeroVideo ? (
        <button
          type="button"
          onClick={() => setHeroMuted((current) => !current)}
          className="fixed bottom-6 right-6 z-30 grid h-12 w-12 place-items-center rounded-full border border-white/18 bg-black/36 text-white/88 shadow-2xl shadow-black/30 backdrop-blur transition hover:border-[var(--accent)]/70 hover:text-[var(--accent)]"
          aria-label={heroMuted ? 'Unmute hero video' : 'Mute hero video'}
          title={heroMuted ? 'Unmute' : 'Mute'}
        >
          {heroMuted ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 9.5v5h3.4L12 18V6L7.4 9.5H4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M17 9l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 9.5v5h3.4L12 18V6L7.4 9.5H4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M16 9.2a4.2 4.2 0 010 5.6M18.8 6.6a8 8 0 010 10.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>
      ) : null}

      {hasAlternateHero && heroVideoReady ? (
        <>
          <button
            type="button"
            onClick={() => switchHero(activeHero === 0 ? 1 : 0)}
            disabled={heroSwitching}
            aria-label={activeHero === 0 ? 'Show alternate hero reel' : 'Show primary hero reel'}
            className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center border border-white/16 bg-black/28 text-xl text-white/62 backdrop-blur-md transition hover:border-[var(--accent)]/60 hover:text-white disabled:opacity-30 md:grid lg:left-7"
          >
            &#8592;
          </button>
          <button
            type="button"
            onClick={() => switchHero(activeHero === 0 ? 1 : 0)}
            disabled={heroSwitching}
            aria-label={activeHero === 0 ? 'Show alternate hero reel' : 'Show primary hero reel'}
            className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center border border-white/16 bg-black/28 text-xl text-white/62 backdrop-blur-md transition hover:border-[var(--accent)]/60 hover:text-white disabled:opacity-30 md:grid lg:right-7"
          >
            &#8594;
          </button>
          <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 border border-white/12 bg-black/36 px-3 py-2 backdrop-blur-md md:bottom-8">
            {[0, 1].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => switchHero(index as 0 | 1)}
                aria-label={`Show hero reel ${index + 1}`}
                aria-current={activeHero === index ? 'true' : undefined}
                className={`h-1.5 transition-all duration-500 ${activeHero === index ? 'w-8 bg-[var(--accent)]' : 'w-3 bg-white/30 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </>
      ) : null}

      <div className={`relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-4 pb-28 pt-24 sm:px-6 sm:pt-28 lg:pt-32 ${hasAlternateHero ? 'md:px-20 lg:px-24' : 'lg:px-8'}`}>
        <div className={`max-w-4xl ${isAr ? 'text-right' : 'text-left'}`}>
          <p className="mb-5 text-xs font-black uppercase tracking-[0.34em] text-[var(--accent)] transition-colors duration-700">
            {subtitle}
          </p>
          <h1 className={`max-w-5xl text-[clamp(3rem,8vw,7.4rem)] font-black tracking-normal text-white drop-shadow-[0_12px_42px_rgba(0,0,0,.72)] ${isAr ? 'leading-[1.16]' : 'leading-[1.02]'}`}>
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/78 drop-shadow-[0_8px_24px_rgba(0,0,0,.68)] sm:text-lg">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className="accent-gradient rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#090909] transition hover:brightness-110">
              {isAr ? '\u0634\u0627\u0647\u062F \u0627\u0644\u0623\u0639\u0645\u0627\u0644' : sections.hero.cta_text}
            </a>
            <a href="#contact" className="rounded-full border border-white/20 bg-black/20 px-6 py-3 text-sm font-bold text-white/90 backdrop-blur transition hover:border-white/45">
              {isAr ? '\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u064A' : 'Book Sam'}
            </a>
          </div>
        </div>

        <div className="mt-12 max-w-xl">
          {!activeVideoUrl ? (
            <div className="relative aspect-video overflow-hidden border border-white/14 bg-[linear-gradient(145deg,#161616,#090909)]">
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_35%,var(--accent)_36%,var(--accent)_43%,transparent_44%,transparent_100%)]"
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
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">{profile.name}</p>
                <p className="mt-2 text-3xl font-black uppercase leading-none text-white sm:text-5xl">Edit<br />Frame<br />Move</p>
              </div>
            </div>
          ) : null}

          <div className="border border-white/12 bg-[#101010]/82 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">{isAr ? '\u0645\u0646 \u0623\u0646\u0627' : 'Who I Am'}</p>
            <p className="mt-2 text-2xl font-black leading-tight text-white">{aboutTitle}</p>
            <p className="mt-3 text-sm leading-6 text-white/72">{about}</p>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none relative z-[2] hidden -rotate-2 overflow-hidden border-y border-white/[0.075] bg-white/[0.018] py-3 text-xs font-black uppercase tracking-[0.32em] text-white/[0.24] backdrop-blur-[1px] lg:flex"
      >
        <div className="flex min-w-max gap-7 whitespace-nowrap">
          {[...Array(10)].map((_, index) => (
            <span key={index} className="shrink-0">
              Motion Graphics / Video Editing / Design / Timing / Storyboard /
            </span>
          ))}
        </div>
      </div>

      <ScrollReveal className="relative z-10 mx-auto grid max-w-7xl gap-px border-y border-white/10 bg-white/10 sm:grid-cols-3">
        {stats.slice(0, 3).map((stat) => (
          <div key={stat.id} className="bg-[#080808]/92 px-4 py-5 text-center backdrop-blur">
            <p className="text-3xl font-black text-white">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/42">{getStatLabel(stat)}</p>
          </div>
        ))}
      </ScrollReveal>

    </section>
  );
}
