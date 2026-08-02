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
  thumbnail: File;
  analysisImage: string;
  metadata: VideoMetadata;
}

export type VideoOptimizationProgress = (stage: 'inspect' | 'thumbnail' | 'full' | 'hover', progress: number) => void;

function baseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'video';
}

function makeInput(file: File) {
  return new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  });
}

function waitForVideoEvent(video: HTMLVideoElement, eventName: 'loadeddata' | 'seeked') {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Timed out while reading preview frames from this video.'));
    }, 20_000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener(eventName, handleSuccess);
      video.removeEventListener('error', handleError);
    };

    const handleSuccess = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(new Error('The browser could not decode frames from this video.'));
    };

    video.addEventListener(eventName, handleSuccess, { once: true });
    video.addEventListener('error', handleError, { once: true });
  });
}

async function seekVideo(video: HTMLVideoElement, time: number) {
  const clampedTime = Math.min(Math.max(0, time), Math.max(0, video.duration - 0.05));
  if (Math.abs(video.currentTime - clampedTime) < 0.01) return;
  const ready = waitForVideoEvent(video, 'seeked');
  video.currentTime = clampedTime;
  await ready;
}

function drawContainedFrame(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  context.fillStyle = '#050505';
  context.fillRect(x, y, width, height);

  const scale = Math.min(width / video.videoWidth, height / video.videoHeight);
  const drawWidth = video.videoWidth * scale;
  const drawHeight = video.videoHeight * scale;
  context.drawImage(
    video,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not create a thumbnail from this video.'));
    }, 'image/jpeg', quality);
  });
}

async function createPreviewAssets(file: File, metadata: VideoMetadata) {
  const sourceUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = sourceUrl;

  try {
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await waitForVideoEvent(video, 'loadeddata');
    }

    const thumbnailScale = Math.min(1, 1280 / metadata.width, 1280 / metadata.height);
    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = Math.max(1, Math.round(metadata.width * thumbnailScale));
    thumbnailCanvas.height = Math.max(1, Math.round(metadata.height * thumbnailScale));
    const thumbnailContext = thumbnailCanvas.getContext('2d');
    if (!thumbnailContext) throw new Error('Canvas is unavailable in this browser.');

    await seekVideo(video, metadata.duration * 0.25);
    thumbnailContext.drawImage(video, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    const thumbnailBlob = await canvasToBlob(thumbnailCanvas, 0.84);

    const contactSheet = document.createElement('canvas');
    contactSheet.width = 960;
    contactSheet.height = 540;
    const contactContext = contactSheet.getContext('2d');
    if (!contactContext) throw new Error('Canvas is unavailable in this browser.');

    const samplePoints = [0.1, 0.36, 0.62, 0.88];
    for (let index = 0; index < samplePoints.length; index += 1) {
      await seekVideo(video, metadata.duration * samplePoints[index]);
      drawContainedFrame(
        contactContext,
        video,
        (index % 2) * 480,
        Math.floor(index / 2) * 270,
        480,
        270,
      );
    }

    const name = baseName(file.name);
    return {
      thumbnail: new File([thumbnailBlob], `${name}-thumbnail.jpg`, { type: 'image/jpeg' }),
      analysisImage: contactSheet.toDataURL('image/jpeg', 0.72),
    };
  } finally {
    video.pause();
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(sourceUrl);
  }
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

  onProgress?.('thumbnail', 0);
  const previewAssets = await createPreviewAssets(file, metadata);
  onProgress?.('thumbnail', 1);

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
    thumbnail: previewAssets.thumbnail,
    analysisImage: previewAssets.analysisImage,
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
