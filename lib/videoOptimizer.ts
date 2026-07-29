import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
} from 'mediabunny';

const MAX_FULL_SIZE = 10 * 1024 * 1024;
const TARGET_FULL_SIZE = 9.2 * 1024 * 1024;
const FULL_MAX_BITRATE = 1_800_000;
const FULL_MIN_BITRATE = 550_000;
const HOVER_BITRATE = 850_000;
const AUDIO_BITRATE = 96_000;
const HOVER_DURATION = 6;

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

export interface OptimizedVideo {
  full: File;
  hover: File;
  metadata: VideoMetadata;
}

export type VideoOptimizationProgress = (stage: 'inspect' | 'full' | 'hover', progress: number) => void;

function baseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'video';
}

function makeInput(file: File) {
  return new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  });
}

function getResizeOptions(metadata: VideoMetadata) {
  if (metadata.width >= metadata.height) {
    return { height: 720 };
  }

  return { width: 720 };
}

function getFullBitrate(duration: number) {
  const availableBits = Math.max(1, TARGET_FULL_SIZE * 8 - AUDIO_BITRATE * duration);
  const sizeBoundBitrate = Math.floor(availableBits / Math.max(duration, 1));
  return Math.max(FULL_MIN_BITRATE, Math.min(FULL_MAX_BITRATE, sizeBoundBitrate));
}

async function convertVideo({
  file,
  metadata,
  bitrate,
  includeAudio,
  trimEnd,
  onProgress,
}: {
  file: File;
  metadata: VideoMetadata;
  bitrate: number;
  includeAudio: boolean;
  trimEnd?: number;
  onProgress?: (progress: number) => void;
}) {
  const input = makeInput(file);
  const target = new BufferTarget();
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
    target,
  });

  try {
    const conversion = await Conversion.init({
      input,
      output,
      tracks: 'primary',
      video: {
        ...getResizeOptions(metadata),
        frameRate: 30,
        codec: 'avc',
        bitrate,
        keyFrameInterval: 2,
        hardwareAcceleration: 'prefer-hardware',
        forceTranscode: true,
      },
      audio: includeAudio
        ? {
            codec: 'aac',
            bitrate: AUDIO_BITRATE,
            numberOfChannels: 2,
            sampleRate: 48_000,
            forceTranscode: true,
          }
        : { discard: true },
      trim: trimEnd ? { start: 0, end: trimEnd } : undefined,
      tags: {},
      showWarnings: false,
    });

    if (!conversion.isValid) {
      const reasons = conversion.discardedTracks.map((item) => item.reason).join(', ');
      throw new Error(`This browser cannot optimize this video${reasons ? `: ${reasons}` : ''}. Try current Chrome or Edge.`);
    }

    conversion.onProgress = (progress) => onProgress?.(Math.min(1, Math.max(0, progress)));
    await conversion.execute();

    if (!target.buffer) {
      throw new Error('Video conversion finished without an output file.');
    }

    return target.buffer;
  } finally {
    input.dispose();
  }
}

export async function inspectVideo(file: File): Promise<VideoMetadata> {
  const input = makeInput(file);

  try {
    if (!(await input.canRead())) {
      throw new Error('Unsupported or unreadable video file.');
    }

    const track = await input.getPrimaryVideoTrack();
    if (!track) {
      throw new Error('No video track was found in this file.');
    }

    const [durationFromMetadata, width, height] = await Promise.all([
      input.getDurationFromMetadata(),
      track.getDisplayWidth(),
      track.getDisplayHeight(),
    ]);
    const duration = durationFromMetadata || await input.computeDuration();

    if (!duration || !Number.isFinite(duration)) {
      throw new Error('Could not detect the video duration.');
    }

    return { duration, width, height };
  } finally {
    input.dispose();
  }
}

export async function optimizeVideo(
  file: File,
  onProgress?: VideoOptimizationProgress,
): Promise<OptimizedVideo> {
  onProgress?.('inspect', 0);
  const metadata = await inspectVideo(file);
  onProgress?.('inspect', 1);

  let fullBitrate = getFullBitrate(metadata.duration);
  let fullBuffer = await convertVideo({
    file,
    metadata,
    bitrate: fullBitrate,
    includeAudio: true,
    onProgress: (progress) => onProgress?.('full', progress),
  });

  if (fullBuffer.byteLength > MAX_FULL_SIZE && fullBitrate > FULL_MIN_BITRATE) {
    const correction = (MAX_FULL_SIZE * 0.94) / fullBuffer.byteLength;
    fullBitrate = Math.max(FULL_MIN_BITRATE, Math.floor(fullBitrate * correction));
    fullBuffer = await convertVideo({
      file,
      metadata,
      bitrate: fullBitrate,
      includeAudio: true,
      onProgress: (progress) => onProgress?.('full', progress),
    });
  }

  const hoverBuffer = await convertVideo({
    file,
    metadata,
    bitrate: HOVER_BITRATE,
    includeAudio: false,
    trimEnd: Math.min(HOVER_DURATION, metadata.duration),
    onProgress: (progress) => onProgress?.('hover', progress),
  });

  const name = baseName(file.name);
  return {
    full: new File([fullBuffer], `${name}-720p.mp4`, { type: 'video/mp4' }),
    hover: new File([hoverBuffer], `${name}-hover-720p.mp4`, { type: 'video/mp4' }),
    metadata,
  };
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}
