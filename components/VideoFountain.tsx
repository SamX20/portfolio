'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface FountainClip {
  id: string;
  src: string;
  poster?: string;
  title?: string;
}

interface Tile {
  key: number;
  clip: FountainClip;
  left: number; // % of the container width
  width: number; // px
  aspect: number; // width / height
  duration: number; // s
  drift: number; // px of sideways drift over the whole rise
  sway: number; // s for one sway cycle
  rise: number; // px travelled from the bottom edge to above the top edge
}

const SPAWN_EVERY_MS = 1500;
const MAX_TILES = 8;

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Read a clip's aspect ratio from its poster (posters are frames of the same video). */
function loadAspect(clip: FountainClip): Promise<number> {
  return new Promise((resolve) => {
    if (!clip.poster) return resolve(16 / 9);
    const image = new Image();
    image.onload = () => resolve(image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : 16 / 9);
    image.onerror = () => resolve(16 / 9);
    image.src = clip.poster;
  });
}

/**
 * Project previews rise from a soft, blurred source at the bottom, come into focus while
 * floating up, then dissolve at the top — like a slow fountain of work. Muted, low-res
 * hover previews, each at its own aspect ratio (reels tall, landscape wide).
 */
export default function VideoFountain({ clips, className = '' }: { clips: FountainClip[]; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<FountainClip[]>([]);
  const aspectRef = useRef(new Map<string, number>());
  const lastLanesRef = useRef<number[]>([]);
  const keyRef = useRef(0);
  const activeRef = useRef(true);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Learn every clip's shape up front so tiles appear at the right aspect ratio.
  useEffect(() => {
    let cancelled = false;
    clips.forEach((clip) => {
      if (aspectRef.current.has(clip.id)) return;
      void loadAspect(clip).then((aspect) => {
        if (!cancelled) aspectRef.current.set(clip.id, aspect);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [clips]);

  const nextClip = useCallback(() => {
    for (let attempt = 0; attempt < clips.length * 2; attempt += 1) {
      if (!queueRef.current.length) queueRef.current = shuffle(clips);
      const clip = queueRef.current.shift();
      if (clip && aspectRef.current.has(clip.id)) return clip;
      if (clip) queueRef.current.push(clip);
    }
    return null;
  }, [clips]);

  const spawn = useCallback(() => {
    const container = containerRef.current;
    if (!container || !activeRef.current) return;
    const clip = nextClip();
    if (!clip) return;

    const aspect = aspectRef.current.get(clip.id) || 16 / 9;
    const portrait = aspect < 1;
    const containerWidth = container.clientWidth || 600;
    const containerHeight = container.clientHeight || 700;
    const depth = 0.72 + Math.random() * 0.28;
    const width = Math.round((portrait ? containerWidth * 0.24 : containerWidth * 0.46) * depth);
    const widthPercent = (width / containerWidth) * 100;

    // Five lanes across the area; avoid the two most recently used so tiles don't stack.
    const lanes = [0, 1, 2, 3, 4].filter((lane) => !lastLanesRef.current.includes(lane));
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    lastLanesRef.current = [lane, ...lastLanesRef.current].slice(0, 2);
    const left = Math.min(Math.max((lane / 4) * (100 - widthPercent - 8) + 2 + (Math.random() * 4 - 2), 2), 94 - widthPercent);

    keyRef.current += 1;
    const tile: Tile = {
      key: keyRef.current,
      clip,
      left,
      width,
      aspect,
      duration: 9 + Math.random() * 3.5,
      // Outer lanes drift inward so tiles never slide past the edge.
      drift: lane >= 3 ? -(10 + Math.random() * 30) : lane <= 1 ? 10 + Math.random() * 30 : Math.random() * 40 - 20,
      sway: 3.5 + Math.random() * 2,
      rise: Math.round(containerHeight + width / aspect + 40),
    };
    setTiles((current) => (current.length >= MAX_TILES ? current : [...current, tile]));
  }, [nextClip]);

  // Spawn on a steady beat; pause while the hero is off-screen or the tab is hidden.
  useEffect(() => {
    if (reduced || !clips.length) return;
    const container = containerRef.current;
    let visible = true;
    const update = () => {
      activeRef.current = visible && !document.hidden;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    if (container) observer.observe(container);
    document.addEventListener('visibilitychange', update);
    const first = window.setTimeout(spawn, 400);
    const second = window.setTimeout(spawn, 1300);
    const interval = window.setInterval(spawn, SPAWN_EVERY_MS);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      window.clearTimeout(first);
      window.clearTimeout(second);
      window.clearInterval(interval);
    };
  }, [clips.length, reduced, spawn]);

  const removeTile = (key: number) => setTiles((current) => current.filter((tile) => tile.key !== key));

  if (!clips.length) return null;

  if (reduced) {
    return (
      <div ref={containerRef} className={`pointer-events-none relative ${className}`} aria-hidden="true">
        <div className="absolute inset-0 flex items-center justify-center gap-4">
          {clips.slice(0, 3).map((clip) => (
            clip.poster ? <img key={clip.id} src={clip.poster} alt="" className="w-1/4 rounded-2xl object-cover opacity-80" /> : null
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`fountain pointer-events-none relative overflow-hidden ${className}`} aria-hidden="true">
      <div className="fountain-source" />
      {tiles.map((tile) => {
        const height = tile.width / tile.aspect;
        return (
          <div
            key={tile.key}
            className="fountain-tile"
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) removeTile(tile.key);
            }}
            style={{
              left: `${tile.left}%`,
              width: tile.width,
              height,
              ['--dur' as string]: `${tile.duration}s`,
              ['--drift' as string]: `${tile.drift}px`,
              ['--rise' as string]: `${tile.rise}px`,
            }}
          >
            <div className="fountain-sway" style={{ ['--sway' as string]: `${tile.sway}s` }}>
              <video
                src={tile.clip.src}
                poster={tile.clip.poster}
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                className="h-full w-full rounded-[14px] object-cover"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
