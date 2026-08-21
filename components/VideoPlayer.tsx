'use client';

import { useEffect, useRef, useState } from 'react';
import { getGoogleDriveFileId } from '@/lib/videoUtils';

interface VideoPlayerProps {
  embedCode?: string;
  videoUrl?: string;
  thumbnail?: string;
  title: string;
  className?: string;
  objectFit?: 'contain' | 'cover';
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  fadeInAudio?: boolean;
  waitForStart?: boolean;
  onReady?: () => void;
  onAutoPlayBlocked?: () => void;
  startEventName?: string;
  fill?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

function getVideoEmbedUrl(videoUrl: string, autoplay = false, muted = false): string {
  try {
    const parsed = new URL(videoUrl);
    const params = new URLSearchParams(parsed.search);

    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      const id = parsed.hostname.includes('youtu.be')
        ? parsed.pathname.replace('/', '')
        : params.get('v');
      if (!id) return videoUrl;

      const embed = new URL(`https://www.youtube.com/embed/${id}`);
      embed.searchParams.set('rel', '0');
      embed.searchParams.set('controls', autoplay ? '0' : '1');
      embed.searchParams.set('playsinline', '1');
      embed.searchParams.set('mute', muted ? '1' : '0');
      embed.searchParams.set('loop', '1');
      embed.searchParams.set('playlist', id);
      embed.searchParams.set('modestbranding', '1');
      if (autoplay) embed.searchParams.set('autoplay', '1');
      return embed.toString();
    }

    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      if (!id) return videoUrl;

      const embed = new URL(`https://player.vimeo.com/video/${id}`);
      embed.searchParams.set('muted', muted ? '1' : '0');
      embed.searchParams.set('loop', '1');
      embed.searchParams.set('background', autoplay && muted ? '1' : '0');
      embed.searchParams.set('title', '0');
      embed.searchParams.set('byline', '0');
      embed.searchParams.set('portrait', '0');
      if (autoplay) embed.searchParams.set('autoplay', '1');
      return embed.toString();
    }

    if (parsed.hostname.includes('drive.google.com')) {
      const id = getGoogleDriveFileId(videoUrl);
      if (id) {
        return getGoogleDrivePreviewUrl(id);
      }
    }
  } catch {
    return videoUrl;
  }

  return videoUrl;
}

function getGoogleDrivePreviewUrl(id: string) {
  return `https://drive.google.com/file/d/${id}/preview`;
}

function getGoogleDriveDirectUrl(id: string) {
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

export default function VideoPlayer({
  embedCode,
  videoUrl,
  thumbnail,
  title,
  className = '',
  objectFit = 'cover',
  autoPlay = false,
  loop = false,
  muted = false,
  volume = 1,
  fadeInAudio = false,
  waitForStart = false,
  onReady,
  onAutoPlayBlocked,
  startEventName,
  fill = false,
  preload = 'metadata',
}: VideoPlayerProps) {
  const [playbackRequested, setPlaybackRequested] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(autoPlay);
  const [isEmbedLoading, setIsEmbedLoading] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(3 / 4);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMobilePlayer, setIsMobilePlayer] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyCalledRef = useRef(false);
  const blockedCalledRef = useRef(false);
  const resolvedVideoUrl = videoUrl ? getVideoEmbedUrl(videoUrl, autoPlay || playbackRequested, muted) : undefined;
  const driveFileId = getGoogleDriveFileId(videoUrl);
  const isEmbedVideo = Boolean(resolvedVideoUrl && /youtube\.com\/embed|player\.vimeo\.com|drive\.google\.com\/file\//.test(resolvedVideoUrl));
  const objectFitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover';
  const wrapperStyle = fill ? undefined : { aspectRatio, maxHeight: '80vh', maxWidth: '100%' };
  const wrapperRadius = fill ? 'rounded-none' : 'rounded-xl';
  const showCompactControls = !autoPlay;

  const markReady = () => {
    if (readyCalledRef.current) return;
    readyCalledRef.current = true;
    onReady?.();
  };

  const markBlocked = () => {
    setIsLoading(false);
    if (blockedCalledRef.current || readyCalledRef.current) return;
    blockedCalledRef.current = true;
    onAutoPlayBlocked?.();
  };

  useEffect(() => {
    setPlaybackRequested(autoPlay);
    setIsLoading(autoPlay);
    setIsEmbedLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    readyCalledRef.current = false;
    blockedCalledRef.current = false;
  }, [autoPlay, embedCode, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
    video.volume = muted ? 0 : volume;
  }, [muted, volume]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const update = () => setIsMobilePlayer(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const playVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    setPlaybackRequested(true);
    setIsLoading(true);
    video.muted = muted;
    video.volume = muted || fadeInAudio ? 0 : volume;

    try {
      await video.play();
      setIsPlaying(true);
      if (fadeInAudio && !muted) {
        const startedAt = performance.now();
        const fadeDuration = 1600;

        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / fadeDuration, 1);
          video.volume = volume * progress;
          if (progress < 1 && !video.muted) {
            window.requestAnimationFrame(tick);
          }
        };

        window.requestAnimationFrame(tick);
      }
      markReady();
    } catch {
      markBlocked();
    }
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      setPlaybackRequested(true);
      setIsLoading(true);
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsLoading(false);
        setIsPlaying(false);
        markBlocked();
      }
    } else {
      video.pause();
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const requestPlayback = () => {
    setPlaybackRequested(true);
    setIsLoading(true);

    if (videoRef.current) {
      void playVideo();
    }
  };

  const seekTo = (value: string) => {
    const video = videoRef.current;
    if (!video) return;

    const nextTime = Number(value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  const handleMetadata = () => {
    const video = videoRef.current;
    if (video?.videoWidth && video?.videoHeight) {
      setAspectRatio(video.videoWidth / video.videoHeight);
    }
    setDuration(video?.duration || 0);
    if (autoPlay && !waitForStart) void playVideo();
  };

  useEffect(() => {
    if (!startEventName) return undefined;

    const handleStart = () => {
      void playVideo();
    };

    window.addEventListener(startEventName, handleStart);
    return () => window.removeEventListener(startEventName, handleStart);
  }, [startEventName]);

  const loadingOverlay = (visible: boolean) => visible ? (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-black/28 backdrop-blur-[1px]" role="status" aria-label="Loading video">
      <div className="grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-black/60 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/25 border-t-[var(--accent)]" />
      </div>
    </div>
  ) : null;

  const renderDirectVideo = (src: string) => (
    <div className={`group relative w-full overflow-hidden ${wrapperRadius} bg-black ${className}`} style={wrapperStyle}>
      <video
        ref={videoRef}
        controls={false}
        poster={thumbnail}
        className={`h-full w-full ${objectFitClass}`}
        preload={preload}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        onClick={() => {
          if (showCompactControls) void togglePlayback();
        }}
        onLoadStart={() => {
          if (playbackRequested || autoPlay) setIsLoading(true);
        }}
        onWaiting={() => setIsLoading(true)}
        onStalled={() => setIsLoading(true)}
        onCanPlayThrough={() => {
          setIsLoading(false);
          if (autoPlay && !waitForStart) void playVideo();
          else markReady();
        }}
        onCanPlay={() => {
          setIsLoading(false);
          if (autoPlay && !waitForStart) void playVideo();
        }}
        onLoadedMetadata={handleMetadata}
        onLoadedData={() => {
          setIsLoading(false);
          if (autoPlay && !waitForStart) void playVideo();
          else markReady();
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
          markReady();
        }}
        onPause={() => {
          setIsLoading(false);
          setIsPlaying(false);
        }}
        onEnded={() => {
          setIsLoading(false);
          setIsPlaying(false);
        }}
        onError={() => {
          setIsLoading(false);
          markReady();
        }}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support video playback.
      </video>

      {loadingOverlay(isLoading && (playbackRequested || autoPlay))}

      {showCompactControls && !isPlaying && !isLoading ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            requestPlayback();
          }}
          className="absolute left-1/2 top-1/2 z-[15] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/58 text-white shadow-2xl shadow-black/45 backdrop-blur-xl transition hover:scale-105 hover:border-[var(--accent)]/65 hover:bg-[var(--accent)] hover:text-[#05070b]"
          aria-label="Play video"
        >
          <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current" aria-hidden="true">
            <path d="M8 5v14l11-7L8 5Z" />
          </svg>
        </button>
      ) : null}

      {showCompactControls && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 pb-3 pt-12 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/12 bg-black/58 px-3 py-2 shadow-2xl shadow-black/35 backdrop-blur-xl">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void togglePlayback();
              }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[#05070b] transition hover:bg-white"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M8 5v14l11-7L8 5Z" />
                </svg>
              )}
            </button>
            <span className="hidden min-w-[72px] text-xs font-bold tabular-nums text-white/70 sm:inline">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(currentTime, duration || currentTime)}
              onChange={(event) => seekTo(event.target.value)}
              className="h-1.5 min-w-0 flex-1 accent-[var(--accent)]"
              aria-label="Video progress"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderNativeMobileDriveVideo = (id: string) => {
    const directUrl = getGoogleDriveDirectUrl(id);

    return (
      <div className={`relative w-full overflow-hidden ${wrapperRadius} bg-black ${className}`} style={wrapperStyle}>
        <video
          ref={videoRef}
          controls
          poster={thumbnail}
          className={`h-full w-full ${objectFitClass}`}
          preload="metadata"
          playsInline
          onPlay={() => setIsLoading(true)}
          onWaiting={() => setIsLoading(true)}
          onStalled={() => setIsLoading(true)}
          onLoadedMetadata={handleMetadata}
          onLoadedData={() => {
            setIsLoading(false);
            markReady();
          }}
          onCanPlay={() => setIsLoading(false)}
          onPlaying={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            markReady();
          }}
        >
          <source src={directUrl} type="video/mp4" />
          Your browser does not support video playback.
        </video>
        {loadingOverlay(isLoading)}
      </div>
    );
  };

  if (embedCode) {
    return (
      <div className={`relative w-full overflow-hidden ${wrapperRadius} bg-black ${className}`} style={wrapperStyle}>
        <div dangerouslySetInnerHTML={{ __html: embedCode }} />
      </div>
    );
  }

  if (videoUrl && videoUrl.startsWith('/')) {
    return renderDirectVideo(videoUrl);
  }

  if (videoUrl && resolvedVideoUrl) {
    if (driveFileId && isMobilePlayer && !autoPlay) {
      return renderNativeMobileDriveVideo(driveFileId);
    }

    if (isEmbedVideo) {
      return (
        <div className={`relative w-full overflow-hidden ${wrapperRadius} bg-black ${className}`} style={wrapperStyle}>
          <iframe
            src={resolvedVideoUrl}
            title={title}
            className="h-full w-full"
            onLoad={() => {
              setIsEmbedLoading(false);
              markReady();
            }}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
            allowFullScreen
          />
          {loadingOverlay(isEmbedLoading)}
        </div>
      );
    }

    return renderDirectVideo(resolvedVideoUrl);
  }

  return (
    <div className={`relative flex w-full items-center justify-center overflow-hidden ${wrapperRadius} border border-white/10 bg-gradient-to-br from-sky-900/20 to-blue-900/20 ${className}`} style={wrapperStyle}>
      <div className="text-center text-white/60">
        <svg className="mx-auto mb-4 h-16 w-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">Video unavailable</p>
      </div>
    </div>
  );
}
