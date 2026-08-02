'use client';

import { DragEvent, useRef, useState } from 'react';
import {
  formatDuration,
  formatFileSize,
  optimizeVideo,
  VideoMetadata,
} from '@/lib/videoOptimizer';
import { ProjectMetadataInput, ProjectMetadataSuggestion } from '@/lib/projectMetadata';

export interface UploadedVideoResult {
  draftId: string;
  sourceFileName: string;
  fullUrl: string;
  hoverUrl: string;
  thumbnailUrl: string;
  analysisImage: string;
  metadata: VideoMetadata;
  suggestion?: ProjectMetadataSuggestion;
  originalSize: number;
  fullSize: number;
  hoverSize: number;
  thumbnailSize: number;
}

export interface ExistingProjectOption {
  id: string;
  title: string;
  title_ar?: string;
  client?: string;
  year: number;
}

interface QueueItem {
  id: string;
  draftId: string;
  file: File;
  status: 'ready' | 'processing' | 'uploading' | 'generating' | 'review' | 'done' | 'error';
  progress: number;
  stage: string;
  result?: UploadedVideoResult;
  replacementProjectId?: string;
  error?: string;
}

interface VideoOptimizerProps {
  uploadFile: (file: File, onProgress?: (percent: number) => void) => Promise<string>;
  generateMetadata?: (input: Omit<ProjectMetadataInput, 'existingProjects'>) => Promise<ProjectMetadataSuggestion>;
  onComplete?: (result: UploadedVideoResult) => void;
  onReview?: (result: UploadedVideoResult, replacementProjectId?: string) => void;
  existingProjects?: ExistingProjectOption[];
  multiple?: boolean;
  compact?: boolean;
}

function queueId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function VideoOptimizer({
  uploadFile,
  generateMetadata,
  onComplete,
  onReview,
  existingProjects = [],
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
          draftId: crypto.randomUUID(),
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
        const stageLabel = stage === 'inspect'
          ? 'Inspecting'
          : stage === 'thumbnail'
            ? 'Sampling frames'
            : stage === 'full'
              ? 'Creating 720p master'
              : 'Creating hover preview';
        const stageBase = stage === 'inspect' ? 0 : stage === 'thumbnail' ? 4 : stage === 'full' ? 10 : 57;
        const stageWeight = stage === 'inspect' ? 4 : stage === 'thumbnail' ? 6 : stage === 'full' ? 47 : 15;
        patchItem(item.id, {
          status: 'processing',
          stage: stageLabel,
          progress: Math.round(stageBase + progress * stageWeight),
        });
      });

      patchItem(item.id, { status: 'uploading', stage: 'Uploading 720p master', progress: 72 });
      const fullUrl = await uploadFile(optimized.full, (percent) => {
        patchItem(item.id, { progress: 72 + Math.round(percent * 0.11) });
      });

      patchItem(item.id, { stage: 'Uploading hover preview', progress: 83 });
      const hoverUrl = await uploadFile(optimized.hover, (percent) => {
        patchItem(item.id, { progress: 83 + Math.round(percent * 0.08) });
      });

      patchItem(item.id, { stage: 'Uploading thumbnail', progress: 91 });
      const thumbnailUrl = await uploadFile(optimized.thumbnail, (percent) => {
        patchItem(item.id, { progress: 91 + Math.round(percent * 0.04) });
      });

      const result: UploadedVideoResult = {
        draftId: item.draftId,
        sourceFileName: item.file.name,
        fullUrl,
        hoverUrl,
        thumbnailUrl,
        analysisImage: optimized.analysisImage,
        metadata: optimized.metadata,
        originalSize: item.file.size,
        fullSize: optimized.full.size,
        hoverSize: optimized.hover.size,
        thumbnailSize: optimized.thumbnail.size,
      };

      await finishMetadata(item.id, result);
    } catch (error) {
      patchItem(item.id, {
        status: 'error',
        stage: 'Failed',
        error: error instanceof Error ? error.message : 'Video optimization failed.',
      });
    }
  };

  const finishMetadata = async (id: string, result: UploadedVideoResult) => {
    if (!generateMetadata) {
      patchItem(id, { status: 'done', stage: 'Uploaded and ready for review', progress: 100, result, error: undefined });
      onComplete?.(result);
      return;
    }

    patchItem(id, { status: 'generating', stage: 'Writing bilingual project draft', progress: 96, result, error: undefined });

    try {
      const suggestion = await generateMetadata({
        sourceFileName: result.sourceFileName,
        duration: result.metadata.duration,
        width: result.metadata.width,
        height: result.metadata.height,
        analysisImage: result.analysisImage,
      });
      const completedResult = { ...result, suggestion };
      patchItem(id, { status: 'done', stage: 'Draft ready for review', progress: 100, result: completedResult, error: undefined });
      onComplete?.(completedResult);
    } catch (error) {
      patchItem(id, {
        status: 'review',
        stage: 'Media uploaded; metadata needs attention',
        progress: 100,
        result,
        error: error instanceof Error ? error.message : 'AI metadata generation failed.',
      });
      onComplete?.(result);
    }
  };

  const retryMetadata = async (item: QueueItem) => {
    if (!item.result || processing) return;
    setProcessing(true);
    try {
      await finishMetadata(item.id, item.result);
    } finally {
      setProcessing(false);
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
          <p className="mt-1 text-xs leading-5 text-white/42">Automatic 720p master, hover preview, thumbnail, and bilingual AI draft.</p>
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
                    {item.result ? ` -> ${formatFileSize(item.result.fullSize)} + ${formatFileSize(item.result.hoverSize)}` : ''}
                  </p>
                </div>
                {!processing && item.status !== 'done' ? (
                  <button
                    type="button"
                    onClick={() => setQueue((current) => current.filter((entry) => entry.id !== item.id))}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-sm text-white/45 hover:border-red-300/40 hover:text-red-200"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    X
                  </button>
                ) : null}
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full bg-gradient-to-r from-[#8ed8ff] to-[#4aa3ff] transition-all duration-200" style={{ width: `${item.progress}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                <span className={item.status === 'error' ? 'text-red-200' : item.status === 'review' ? 'text-amber-200' : item.status === 'done' ? 'text-emerald-200' : 'text-white/46'}>
                  {item.error || item.stage}
                </span>
                <span className="tabular-nums text-white/35">{item.progress}%</span>
              </div>
              {item.result ? (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-white/35">
                      Source {item.result.metadata.width}x{item.result.metadata.height} / Output 720p 30fps / {formatDuration(item.result.metadata.duration)}
                    </p>
                    <div className="flex flex-wrap gap-2">
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
                      <button
                        type="button"
                        onClick={async () => navigator.clipboard.writeText(item.result?.thumbnailUrl || '')}
                        className="border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white/55 hover:border-[#8ed8ff]/50 hover:text-white"
                      >
                        Copy thumbnail URL
                      </button>
                      {item.status === 'review' && generateMetadata ? (
                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => retryMetadata(item)}
                          className="border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-amber-100 disabled:opacity-40"
                        >
                          Retry metadata only
                        </button>
                      ) : null}
                      {(item.result.suggestion || item.replacementProjectId) && onReview ? (
                        <button
                          type="button"
                          onClick={() => onReview(
                            item.result!,
                            item.replacementProjectId ?? item.result?.suggestion?.matched_project_id ?? undefined,
                          )}
                          className="accent-gradient px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#05070b]"
                        >
                          {(item.replacementProjectId ?? item.result.suggestion?.matched_project_id)
                            ? 'Review replacement'
                            : 'Review new project'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {existingProjects.length && onReview ? (
                    <label className="block border-t border-white/10 pt-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8ed8ff]">Target existing project</span>
                      <select
                        value={item.replacementProjectId ?? item.result.suggestion?.matched_project_id ?? ''}
                        onChange={(event) => patchItem(item.id, { replacementProjectId: event.target.value })}
                        className="mt-2 w-full border border-white/12 bg-[#0d0f12] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#8ed8ff]/70"
                      >
                        <option value="">Create as a new project</option>
                        {existingProjects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.title || project.title_ar || 'Untitled project'}
                            {project.client ? ` / ${project.client}` : ''}
                            {project.year ? ` / ${project.year}` : ''}
                          </option>
                        ))}
                      </select>
                      <span className="mt-2 block text-xs leading-5 text-white/38">
                        If the filename does not match, choose the project manually. Its copy and settings will be preserved while the media is replaced.
                      </span>
                    </label>
                  ) : null}
                  {item.result.suggestion ? (
                    <div className="grid gap-3 border border-[#8ed8ff]/20 bg-[#8ed8ff]/[0.055] p-4 md:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8ed8ff]">English draft</p>
                        <p className="mt-1 text-sm font-black text-white">{item.result.suggestion.title}</p>
                        <p className="mt-1 text-xs leading-5 text-white/48">{item.result.suggestion.description}</p>
                      </div>
                      <div dir="rtl" className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8ed8ff]">Arabic draft</p>
                        <p className="mt-1 text-sm font-black text-white">{item.result.suggestion.title_ar}</p>
                        <p className="mt-1 text-xs leading-5 text-white/48">{item.result.suggestion.description_ar}</p>
                      </div>
                      {item.result.suggestion.review_notes.length ? (
                        <p className="text-xs leading-5 text-amber-100/70 md:col-span-2">
                          Review: {item.result.suggestion.review_notes.join(' / ')}
                        </p>
                      ) : null}
                      <p className="text-xs leading-5 text-white/52 md:col-span-2">
                        {item.result.suggestion.matched_project_id
                          ? `Existing project match: ${item.result.suggestion.match_confidence}% / ${item.result.suggestion.match_reason}`
                          : `No safe existing match / ${item.result.suggestion.match_reason}`}
                      </p>
                    </div>
                  ) : null}
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
              {processing ? 'Processing...' : `Create review draft${multiple ? 's' : ''}`}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
