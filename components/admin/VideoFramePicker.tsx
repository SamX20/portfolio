'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatDuration } from '@/lib/videoOptimizer';

export interface FrameSelection {
  file: File;
  previewUrl: string;
  time: number;
}

interface VideoFramePickerProps {
  source: File;
  onCancel: () => void;
  onConfirm: (selection: FrameSelection) => void | Promise<void>;
}

function thumbnailName(fileName: string) {
  const name = fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'video';
  return `${name}-thumbnail.jpg`;
}

export default function VideoFramePicker({ source, onCancel, onConfirm }: VideoFramePickerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(source);
    setSourceUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [source]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  const seekTo = (nextTime: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(nextTime)) return;
    const clamped = Math.min(Math.max(0, nextTime), Math.max(0, duration - 0.04));
    video.pause();
    setSeeking(true);
    video.currentTime = clamped;
    setPlaying(false);
    setTime(clamped);
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return;

    setCapturing(true);
    setError('');
    try {
      video.pause();
      setPlaying(false);
      const scale = Math.min(1, 1280 / video.videoWidth, 1280 / video.videoHeight);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('The browser could not prepare this frame.');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not create the thumbnail.')), 'image/jpeg', 0.86);
      });
      await onConfirm({
        file: new File([blob], thumbnailName(source.name), { type: 'image/jpeg' }),
        previewUrl: canvas.toDataURL('image/jpeg', 0.82),
        time: video.currentTime,
      });
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : 'Could not capture this frame.');
    } finally {
      setCapturing(false);
    }
  };

  if (!sourceUrl || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[140] grid place-items-center overflow-y-auto bg-black/82 p-3 backdrop-blur-xl sm:p-6" onClick={onCancel}>
      <div role="dialog" aria-modal="true" aria-labelledby="frame-picker-title" className="w-full max-w-4xl overflow-hidden border border-white/12 bg-[#0d0f12] shadow-2xl shadow-black/60" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8ed8ff]">Thumbnail frame</p>
            <h3 id="frame-picker-title" className="mt-1 text-lg font-black text-white">Choose a Frame</h3>
          </div>
          <button type="button" onClick={onCancel} className="grid h-10 w-10 place-items-center rounded-full border border-white/12 text-white/65 transition hover:border-white/30 hover:text-white" aria-label="Close frame picker">X</button>
        </div>

        <div className="bg-black">
          <video
            ref={videoRef}
            src={sourceUrl}
            muted
            playsInline
            preload="auto"
            className="mx-auto max-h-[58dvh] w-full object-contain"
            onLoadedMetadata={(event) => {
              const nextDuration = event.currentTarget.duration || 0;
              const initialTime = Math.min(Math.max(0, nextDuration * 0.25), Math.max(0, nextDuration - 0.04));
              setDuration(nextDuration);
              setTime(initialTime);
              setSeeking(true);
              event.currentTarget.currentTime = initialTime;
            }}
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
            onSeeked={() => setSeeking(false)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => setError('This browser could not preview the selected video.')}
          />
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                if (video.paused) void video.play();
                else video.pause();
              }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#8ed8ff] text-sm font-black text-[#05070b]"
              aria-label={playing ? 'Pause preview' : 'Play preview'}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M8 5v14l11-7L8 5Z" />
                </svg>
              )}
            </button>
            <button type="button" onClick={() => seekTo(time - 1)} className="h-10 border border-white/12 px-3 text-xs font-black text-white/65 hover:border-white/30 hover:text-white">-1s</button>
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.04"
              value={Math.min(time, duration || time)}
              onChange={(event) => seekTo(Number(event.target.value))}
              className="h-1.5 min-w-0 flex-1 accent-[#8ed8ff]"
              aria-label="Choose thumbnail frame"
            />
            <button type="button" onClick={() => seekTo(time + 1)} className="h-10 border border-white/12 px-3 text-xs font-black text-white/65 hover:border-white/30 hover:text-white">+1s</button>
            <span className="hidden min-w-24 text-right text-xs font-bold tabular-nums text-white/55 sm:block">{formatDuration(time)} / {formatDuration(duration)}</span>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-white">Frame at {time.toFixed(2)} seconds</p>
              <p className="mt-1 text-xs text-white/38">The automatic frame remains available unless you confirm this selection.</p>
              {error ? <p className="mt-2 text-xs text-red-200">{error}</p> : null}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onCancel} className="rounded-full border border-white/12 px-5 py-2.5 text-xs font-bold text-white/62 hover:border-white/30 hover:text-white">Cancel</button>
              <button type="button" disabled={capturing || seeking || !duration} onClick={captureFrame} className="accent-gradient rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#05070b] disabled:opacity-45">
                {capturing ? 'Capturing...' : seeking ? 'Seeking...' : 'Use this Frame'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
