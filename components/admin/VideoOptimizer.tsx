'use client';

import { DragEvent, useRef, useState } from 'react';
import {
  formatDuration,
  formatFileSize,
  optimizeVideo,
  VideoMetadata,
} from '@/lib/videoOptimizer';

export interface UploadedVideoResult {
  fullUrl: string;
  hoverUrl: string;
  metadata: VideoMetadata;
  originalSize: number;
  fullSize: number;
  hoverSize: number;
}

interface QueueItem {
  id: string;
  file: File;
  status: 'ready' | 'processing' | 'uploading' | 'done' | 'error';
  progress: number;
  stage: string;
  result?: UploadedVideoResult;
  error?: string;
}

interface VideoOptimizerProps {
  uploadFile: (file: File, onProgress?: (percent: number) => void) => Promise<string>;
  onComplete?: (result: UploadedVideoResult) => void;
  multiple?: boolean;
  compact?: boolean;
}

function queueId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function VideoOptimizer({
  uploadFile,
  onComplete,
  multiple = true,
  compact = false,
}: VideoOptimizerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);

  const patchItem = (id: string, patch: Partial<QueueItem>) => {
    setQueue((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addFiles = (files: File[]) => {
    const videoFiles = files.filter((file) => file.type.startsWith('video/'));
    if (!videoFiles.length) return;

    setQueue((current) => {
      const nextFiles = multiple ? videoFiles : videoFiles.slice(0, 1);
      const existingIds = new Set(current.map((item) => item.id));
      const additions = nextFiles
        .filter((file) => !existingIds.has(queueId(file)))
        .map((file) => ({
          id: queueId(file),
          file,
          status: 'ready' as const,
          progress: 0,
          stage: 'Ready',
        }));

      return multiple ? [...current, ...additions] : additions;
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const processItem = async (item: QueueItem) => {
    patchItem(item.id, { status: 'processing', stage: 'Inspecting', progress: 1, error: undefined });

    try {
      const optimized = await optimizeVideo(item.file, (stage, progress) => {
        const stageLabel = stage === 'inspect' ? 'Inspecting' : stage === 'full' ? 'Creating 720p master' : 'Creating hover preview';
        const stageBase = stage === 'inspect' ? 0 : stage === 'full' ? 5 : 65;
        const stageWeight = stage === 'inspect' ? 5 : stage === 'full' ? 60 : 20;
        patchItem(item.id, {
          status: 'processing',
          stage: stageLabel,
          progress: Math.round(stageBase + progress * stageWeight),
        });
      });

      patchItem(item.id, { status: 'uploading', stage: 'Uploading 720p master', progress: 85 });
      const fullUrl = await uploadFile(optimized.full, (percent) => {
        patchItem(item.id, { progress: 85 + Math.round(percent * 0.08) });
      });

      patchItem(item.id, { stage: 'Uploading hover preview', progress: 93 });
      const hoverUrl = await uploadFile(optimized.hover, (percent) => {
        patchItem(item.id, { progress: 93 + Math.round(percent * 0.07) });
      });

      const result: UploadedVideoResult = {
        fullUrl,
        hoverUrl,
        metadata: optimized.metadata,
        originalSize: item.file.size,
        fullSize: optimized.full.size,
        hoverSize: optimized.hover.size,
      };

      patchItem(item.id, { status: 'done', stage: 'Uploaded', progress: 100, result });
      onComplete?.(result);
    } catch (error) {
      patchItem(item.id, {
        status: 'error',
        stage: 'Failed',
        error: error instanceof Error ? error.message : 'Video optimization failed.',
      });
    }
  };

  const processQueue = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      const pendingItems = queue.filter((item) => item.status === 'ready' || item.status === 'error');
      for (const item of pendingItems) {
        await processItem(item);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={compact ? '' : 'border border-white/10 bg-white/[0.025] p-5 sm:p-6'}>
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`grid min-h-36 place-items-center border border-dashed px-5 py-7 text-center transition ${
          dragging ? 'border-[#8ed8ff] bg-[#8ed8ff]/10' : 'border-white/15 bg-black/20 hover:border-white/30'
        }`}
      >
        <div>
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-[#8ed8ff]/40 bg-[#8ed8ff]/10 text-xl text-[#8ed8ff]">+</div>
          <p className="mt-3 text-sm font-black text-white">Drop video files here</p>
          <p className="mt-1 text-xs leading-5 text-white/42">Automatic 720p, 30fps, fast-start MP4 and a 6-second hover preview.</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/72 transition hover:border-[#8ed8ff]/60 hover:text-white"
          >
            Choose {multiple ? 'videos' : 'video'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            multiple={multiple}
            className="hidden"
            onChange={(event) => {
              addFiles(Array.from(event.target.files || []));
              event.target.value = '';
            }}
          />
        </div>
      </div>

      {queue.length ? (
        <div className="mt-4 space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="border border-white/10 bg-black/25 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">{item.file.name}</p>
                  <p className="mt-1 text-xs text-white/38">
                    {formatFileSize(item.file.size)}
                    {item.result ? ` → ${formatFileSize(item.result.fullSize)} + ${formatFileSize(item.result.hoverSize)}` : ''}
                  </p>
                </div>
                {!processing && item.status !== 'done' ? (
                  <button
                    type="button"
                    onClick={() => setQueue((current) => current.filter((entry) => entry.id !== item.id))}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-sm text-white/45 hover:border-red-300/40 hover:text-red-200"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    ×
                  </button>
                ) : null}
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full bg-gradient-to-r from-[#8ed8ff] to-[#4aa3ff] transition-all duration-200" style={{ width: `${item.progress}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                <span className={item.status === 'error' ? 'text-red-200' : item.status === 'done' ? 'text-emerald-200' : 'text-white/46'}>
                  {item.error || item.stage}
                </span>
                <span className="tabular-nums text-white/35">{item.progress}%</span>
              </div>
              {item.result ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-white/35">
                    Source {item.result.metadata.width}×{item.result.metadata.height} · Output 720p/30fps · {formatDuration(item.result.metadata.duration)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => navigator.clipboard.writeText(item.result?.fullUrl || '')}
                      className="border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white/55 hover:border-[#8ed8ff]/50 hover:text-white"
                    >
                      Copy master URL
                    </button>
                    <button
                      type="button"
                      onClick={async () => navigator.clipboard.writeText(item.result?.hoverUrl || '')}
                      className="border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white/55 hover:border-[#8ed8ff]/50 hover:text-white"
                    >
                      Copy hover URL
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setQueue([])}
              disabled={processing}
              className="border border-white/10 px-4 py-2 text-xs font-bold text-white/48 transition hover:border-white/25 hover:text-white disabled:opacity-35"
            >
              Clear queue
            </button>
            <button
              type="button"
              onClick={processQueue}
              disabled={processing || !queue.some((item) => item.status === 'ready' || item.status === 'error')}
              className="accent-gradient px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#05070b] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? 'Optimizing…' : `Optimize and upload${multiple ? ' all' : ''}`}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
