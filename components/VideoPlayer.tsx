'use client';

import { useState } from 'react';

interface VideoPlayerProps {
  embedCode?: string;
  videoUrl?: string;
  thumbnail?: string;
  title: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

function getVideoEmbedUrl(videoUrl: string, autoplay = false): string {
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
      embed.searchParams.set('mute', '1');
      embed.searchParams.set('loop', '1');
      embed.searchParams.set('playlist', id);
      embed.searchParams.set('modestbranding', '1');
      embed.searchParams.set('showinfo', '0');
      if (autoplay) embed.searchParams.set('autoplay', '1');
      return embed.toString();
    }

    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      if (!id) return videoUrl;
      const embed = new URL(`https://player.vimeo.com/video/${id}`);
      embed.searchParams.set('muted', '1');
      embed.searchParams.set('loop', '1');
      embed.searchParams.set('background', '1');
      embed.searchParams.set('title', '0');
      embed.searchParams.set('byline', '0');
      embed.searchParams.set('portrait', '0');
      if (autoplay) embed.searchParams.set('autoplay', '1');
      return embed.toString();
    }

    if (parsed.hostname.includes('drive.google.com')) {
      const match = videoUrl.match(/\/file\/d\/([^/]+)/);
      if (match) {
        const id = match[1];
        const embed = new URL(`https://drive.google.com/file/d/${id}/preview`);
        if (autoplay) embed.searchParams.set('autoplay', '1');
        return embed.toString();
      }
    }
  } catch {
    return videoUrl;
  }

  return videoUrl;
}

export default function VideoPlayer({ embedCode, videoUrl, thumbnail, title, className = '', autoPlay = false, loop = false, muted = false }: VideoPlayerProps) {
  const [showVideo, setShowVideo] = useState(autoPlay);
  const resolvedVideoUrl = videoUrl ? getVideoEmbedUrl(videoUrl, autoPlay) : undefined;

  // إذا كان هناك embed code، استخدمه
  if (embedCode) {
    return (
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-black ${className}`}>
        <div dangerouslySetInnerHTML={{ __html: embedCode }} />
      </div>
    );
  }

  // إذا كان فيديو محلي، استخدم HTML5 video
  if (videoUrl && videoUrl.startsWith('/')) {
    return (
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-black ${className}`}>
        <video
          controls={!autoPlay}
          poster={thumbnail}
          className="w-full h-full object-cover"
          preload="metadata"
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
          متصفحك لا يدعم تشغيل الفيديو.
        </video>
      </div>
    );
  }

  if (videoUrl && resolvedVideoUrl && (showVideo || autoPlay || !thumbnail)) {
    const isEmbedVideo = /youtube\.com\/embed|player\.vimeo\.com|drive\.google\.com\/file/.test(resolvedVideoUrl);

    if (isEmbedVideo) {
      return (
        <div className={`relative w-full aspect-video overflow-hidden rounded-xl bg-black ${className}`}>
          <iframe
            src={resolvedVideoUrl}
            title={title}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-black ${className}`}>
        <video
          controls={!autoPlay}
          poster={thumbnail}
          className="w-full h-full object-cover"
          preload="metadata"
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
        >
          <source src={resolvedVideoUrl} type="video/mp4" />
          متصفحك لا يدعم تشغيل الفيديو.
        </video>
      </div>
    );
  }

  // إذا كان رابط خارجي، أظهر thumbnail مع زر تشغيل
  if (videoUrl && thumbnail) {
    return (
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-black cursor-pointer ${className}`} onClick={() => setShowVideo(true)}>
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 transition-opacity" />
      </div>
    );
  }

  // إذا لم يكن هناك فيديو، أظهر placeholder
  return (
    <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/10 flex items-center justify-center ${className}`}>
      <div className="text-center text-white/60">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">فيديو غير متوفر</p>
      </div>
    </div>
  );
}