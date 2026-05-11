'use client';

import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
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
      embed.searchParams.set('controls', '0');
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
      embed.searchParams.set('background', muted ? '1' : '0');
      embed.searchParams.set('title', '0');
      embed.searchParams.set('byline', '0');
      embed.searchParams.set('portrait', '0');
      if (autoplay) embed.searchParams.set('autoplay', '1');
      return embed.toString();
    }

    if (parsed.hostname.includes('drive.google.com')) {
      const id = getGoogleDriveFileId(videoUrl);
      if (id) {
        return `https://drive.google.com/uc?export=download&id=${id}`;
      }
    }
  } catch {
    return videoUrl;
  }

  return videoUrl;
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
}: VideoPlayerProps) {
  const [showVideo, setShowVideo] = useState(autoPlay);
  const [aspectRatio, setAspectRatio] = useState(3 / 4);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyCalledRef = useRef(false);
  const blockedCalledRef = useRef(false);
  const resolvedVideoUrl = videoUrl ? getVideoEmbedUrl(videoUrl, autoPlay, muted) : undefined;
  const objectFitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover';
  const wrapperStyle = { aspectRatio, maxHeight: '80vh', maxWidth: '100%' };

  const handleThumbnailLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    }
  };

  const markReady = () => {
    if (readyCalledRef.current) return;
    readyCalledRef.current = true;
    onReady?.();
  };

  const markBlocked = () => {
    if (blockedCalledRef.current || readyCalledRef.current) return;
    blockedCalledRef.current = true;
    onAutoPlayBlocked?.();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
    video.volume = muted ? 0 : volume;
  }, [muted, volume]);

  const playVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
    video.volume = muted || fadeInAudio ? 0 : volume;

    try {
      await video.play();
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

  useEffect(() => {
    if (!startEventName) return undefined;

    const handleStart = () => {
      void playVideo();
    };

    window.addEventListener(startEventName, handleStart);
    return () => window.removeEventListener(startEventName, handleStart);
  });

  if (embedCode) {
    return (
      <div className={`relative w-full overflow-hidden rounded-xl bg-black ${className}`} style={wrapperStyle}>
        <div dangerouslySetInnerHTML={{ __html: embedCode }} />
      </div>
    );
  }

  if (videoUrl && videoUrl.startsWith('/')) {
    return (
      <div className={`relative w-full overflow-hidden rounded-xl bg-black ${className}`} style={wrapperStyle}>
        <video
          ref={videoRef}
          controls={!autoPlay}
          poster={thumbnail}
          className={`h-full w-full ${objectFitClass}`}
          preload="auto"
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          onCanPlayThrough={() => {
            if (autoPlay && !waitForStart) void playVideo();
            else markReady();
          }}
          onCanPlay={() => {
            if (autoPlay && !waitForStart) void playVideo();
          }}
          onLoadedMetadata={() => {
            const video = videoRef.current;
            if (video?.videoWidth && video?.videoHeight) {
              setAspectRatio(video.videoWidth / video.videoHeight);
            }
            if (autoPlay && !waitForStart) void playVideo();
          }}
          onLoadedData={() => {
            if (autoPlay && !waitForStart) void playVideo();
            else markReady();
          }}
          onPlaying={markReady}
          onError={markReady}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  if (videoUrl && resolvedVideoUrl && (showVideo || autoPlay || !thumbnail)) {
    const isEmbedVideo = /youtube\.com\/embed|player\.vimeo\.com|drive\.google\.com\/file/.test(resolvedVideoUrl);

    if (isEmbedVideo) {
      return (
        <div className={`relative w-full overflow-hidden rounded-xl bg-black ${className}`} style={wrapperStyle}>
          <iframe
            src={resolvedVideoUrl}
            title={title}
            className="h-full w-full"
            onLoad={markReady}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className={`relative w-full overflow-hidden rounded-xl bg-black ${className}`} style={wrapperStyle}>
        <video
          ref={videoRef}
          controls={!autoPlay}
          poster={thumbnail}
          className={`h-full w-full ${objectFitClass}`}
          preload="auto"
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          onCanPlayThrough={() => {
            if (autoPlay && !waitForStart) void playVideo();
            else markReady();
          }}
          onCanPlay={() => {
            if (autoPlay && !waitForStart) void playVideo();
          }}
          onLoadedMetadata={() => {
            const video = videoRef.current;
            if (video?.videoWidth && video?.videoHeight) {
              setAspectRatio(video.videoWidth / video.videoHeight);
            }
            if (autoPlay && !waitForStart) void playVideo();
          }}
          onLoadedData={() => {
            if (autoPlay && !waitForStart) void playVideo();
            else markReady();
          }}
          onPlaying={markReady}
          onError={markReady}
        >
          <source src={resolvedVideoUrl} type="video/mp4" />
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  if (videoUrl && thumbnail && !showVideo) {
    return (
      <div
        className={`relative w-full cursor-pointer overflow-hidden rounded-xl bg-black ${className}`}
        style={wrapperStyle}
        onClick={() => setShowVideo(true)}
      >
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-contain"
          onLoad={handleThumbnailLoad}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 text-white shadow-lg shadow-black/30">
            <span className="text-3xl leading-none">▶</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-sky-900/20 to-blue-900/20 ${className}`} style={wrapperStyle}>
      <div className="text-center text-white/60">
        <svg className="mx-auto mb-4 h-16 w-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">Video unavailable</p>
      </div>
    </div>
  );
}
