'use client';

import { useLayoutEffect, useRef } from 'react';
import { LogoMark } from './Logo';

/**
 * Seamless looping loader: the mark slides across and wipes the name in,
 * holds with a spark twinkle, wipes it back out, settles with a small bounce, and repeats.
 * The end state matches the start state, so there is no jump between loops.
 */
export default function BrandLoader({ size = 44 }: { size?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const measure = () => {
      if (!rootRef.current || !nameRef.current) return;
      const gap = size * 0.4;
      rootRef.current.style.setProperty('--d', `${nameRef.current.offsetWidth + gap}px`);
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => undefined);
  }, [size]);

  return (
    <div ref={rootRef} className="brand-loader" role="status" aria-label="Loading" dir="ltr" style={{ ['--mark' as string]: `${size}px` }}>
      <div className="brand-loader-track">
        <span className="brand-loader-mark">
          <LogoMark className="brand-loader-svg" />
        </span>
        <span ref={nameRef} className="brand-loader-name">
          XSam <span className="font-normal text-[var(--muted)]">Studio</span>
        </span>
      </div>
    </div>
  );
}
