'use client';

import { useEffect, useState } from 'react';

export interface MotionPreferences {
  prefersReducedMotion: boolean;
  isTouchDevice: boolean;
  disableMotion: boolean;
  disableHoverMotion: boolean;
  disableParallaxMotion: boolean;
}

function detectMotionPreferences(): MotionPreferences {
  if (typeof window === 'undefined') {
    return {
      prefersReducedMotion: false,
      isTouchDevice: false,
      disableMotion: false,
      disableHoverMotion: false,
      disableParallaxMotion: false,
    };
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = /iP(hone|od|ad)|Android|Mobile|Tablet/.test(navigator.userAgent || '');
  const disableMotion = prefersReducedMotion;
  const disableHoverMotion = prefersReducedMotion || isTouchDevice;
  const disableParallaxMotion = prefersReducedMotion || isTouchDevice;

  return {
    prefersReducedMotion,
    isTouchDevice,
    disableMotion,
    disableHoverMotion,
    disableParallaxMotion,
  };
}

export function useMotionPreferences() {
  const [prefs, setPrefs] = useState<MotionPreferences>(() => detectMotionPreferences());

  useEffect(() => {
    setPrefs(detectMotionPreferences());
  }, []);

  return prefs;
}

export default function useDisableMotion() {
  const { disableMotion } = useMotionPreferences();
  return disableMotion;
}
