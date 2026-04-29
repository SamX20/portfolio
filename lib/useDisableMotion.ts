'use client';

import { useEffect, useState } from 'react';

export default function useDisableMotion() {
  const [disableMotion, setDisableMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const hasNoHover = window.matchMedia('(hover: none)').matches;
    const userAgent = navigator.userAgent || '';
    const isTouchDevice = /iP(hone|od|ad)|Android/.test(userAgent);

    setDisableMotion(prefersReduced || hasCoarsePointer || hasNoHover || isTouchDevice);
  }, []);

  return disableMotion;
}
