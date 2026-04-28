'use client';

import { useState } from 'react';

interface VideoPlayerProps {
  embedCode?: string;
  videoUrl?: string;
  thumbnail?: string;
  title: string;
}

export default function VideoPlayer({ embedCode, videoUrl, thumbnail, title }: VideoPlayerProps) {
  const [showVideo, setShowVideo] = useState(false);

  // إذا كان هناك embed code، استخدمه
  if (embedCode) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        <div dangerouslySetInnerHTML={{ __html: embedCode }} />
      </div>
    );
  }

  // إذا كان فيديو محلي، استخدم HTML5 video
  if (videoUrl && videoUrl.startsWith('/')) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        <video
          controls
          poster={thumbnail}
          className="w-full h-full object-cover"
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          متصفحك لا يدعم تشغيل الفيديو.
        </video>
      </div>
    );
  }

  // إذا كان رابط خارجي، أظهر thumbnail مع زر تشغيل
  if (videoUrl && thumbnail) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black cursor-pointer group" onClick={() => setShowVideo(true)}>
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
          اضغط للمشاهدة
        </div>
      </div>
    );
  }

  // إذا لم يكن هناك فيديو، أظهر placeholder
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/10 flex items-center justify-center">
      <div className="text-center text-white/60">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">فيديو غير متوفر</p>
      </div>
    </div>
  );
}