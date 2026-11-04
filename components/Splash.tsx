'use client';

import { useEffect, useState } from 'react';
import { LogoLockup } from './Logo';

const SEEN_KEY = 'xsam-splash-seen';

/**
 * One-time intro on a visitor's first visit: the logo animation plays once, then fades away.
 * An inline script in the layout hides it before paint for returning visitors (html.xs-seen),
 * so they never see a flash.
 */
export default function Splash() {
  const [phase, setPhase] = useState<'show' | 'fade' | 'gone'>('show');

  useEffect(() => {
    let seen = document.documentElement.classList.contains('xs-seen');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      seen = seen || Boolean(window.localStorage.getItem(SEEN_KEY));
      window.localStorage.setItem(SEEN_KEY, '1');
    } catch {
      // Without storage the intro simply plays each visit.
    }
    if (seen || reduced) {
      setPhase('gone');
      return;
    }
    const fade = window.setTimeout(() => setPhase('fade'), 1900);
    const gone = window.setTimeout(() => setPhase('gone'), 2500);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(gone);
    };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div className={`xs-splash ${phase === 'fade' ? 'xs-splash-fade' : ''}`} aria-hidden="true">
      <LogoLockup animate="intro" markClassName="h-14 w-14" textClassName="text-3xl" className="gap-4" />
    </div>
  );
}
