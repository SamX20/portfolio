export const BRAND_NAME = 'XSam Studio';
export const BRAND_ACCENT = '#8EA2FF';

/** The XSam mark: two play shapes meeting, with a spark born between them. Uses currentColor for the shapes. */
export function LogoMark({
  className = '',
  spark = BRAND_ACCENT,
  animate,
}: {
  className?: string;
  spark?: string;
  /** 'intro' plays once, 'loop' keeps breathing (for loading states). */
  animate?: 'intro' | 'loop';
}) {
  return (
    <svg viewBox="0 0 64 64" className={`${animate ? `logo-${animate}` : ''} ${className}`} aria-hidden="true" overflow="visible">
      <polygon className="logo-l" points="6,8 25,25 6,42" fill="currentColor" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <polygon className="logo-r" points="58,22 39,39 58,56" fill="currentColor" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <path
        className="logo-s"
        d="M32 23C32.7 29.12 34.25 31.1 39.02 32 34.25 32.9 32.7 34.88 32 41 31.3 34.88 29.75 32.9 24.98 32 29.75 31.1 31.3 29.12 32 23Z"
        fill={spark}
      />
    </svg>
  );
}

export function LogoLockup({
  className = '',
  markClassName = 'h-7 w-7',
  animate,
}: {
  className?: string;
  markClassName?: string;
  animate?: 'intro';
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} dir="ltr">
      <LogoMark className={markClassName} animate={animate} />
      <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">
        XSam <span className="font-normal text-[var(--muted)]">Studio</span>
      </span>
    </span>
  );
}
