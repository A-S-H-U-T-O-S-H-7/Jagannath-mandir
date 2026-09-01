export const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

const TARGET_VIDEO_SIZE = 190 * 1024 * 1024;
const MIN_VIDEO_BITRATE = 250_000;
const AUDIO_BITRATE = 96_000;

type CaptureStreamVideo = HTMLVideoElement & {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
};

export async function compressVideoUnderLimit(file: File): Promise<File> {
  if (file.size <= MAX_VIDEO_SIZE) return file;
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    throw new Error('Video compression is not supported in this browser. Please use the latest Chrome or Edge.');
  }

  const video = document.createElement('video') as CaptureStreamVideo;
  const objectUrl = URL.createObjectURL(file);
  video.src = objectUrl;
  video.preload = 'auto';
  video.playsInline = true;
  video.muted = true;
  video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;';
  document.body.appendChild(video);

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('The selected video could not be read.'));
    });
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error('The video duration could not be determined.');
    }

    const capture = video.captureStream || video.mozCaptureStream;
    if (!capture) throw new Error('Video compression is not supported in this browser. Please use the latest Chrome or Edge.');

    const totalBitsPerSecond = Math.floor((TARGET_VIDEO_SIZE * 8) / video.duration);
    const videoBitsPerSecond = Math.max(MIN_VIDEO_BITRATE, totalBitsPerSecond - AUDIO_BITRATE);
    const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      .find((type) => MediaRecorder.isTypeSupported(type));
    if (!mimeType) throw new Error('This browser cannot create a compressed WebM video.');

    await video.play();
    const stream = capture.call(video);
    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond, audioBitsPerSecond: AUDIO_BITRATE });
    const compressed = await new Promise<Blob>((resolve, reject) => {
      recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
      recorder.onerror = () => reject(new Error('Video compression failed.'));
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
      video.onended = () => recorder.state !== 'inactive' && recorder.stop();
      recorder.start(1000);
    });

    stream.getTracks().forEach((track) => track.stop());
    if (!compressed.size || compressed.size > MAX_VIDEO_SIZE) {
      throw new Error('Video could not be compressed below 200MB. Please shorten it or lower its resolution.');
    }
    const baseName = file.name.replace(/\.[^.]+$/, '');
    return new File([compressed], `${baseName}-compressed.webm`, { type: 'video/webm', lastModified: Date.now() });
  } finally {
    video.pause();
    video.remove();
    URL.revokeObjectURL(objectUrl);
  }
}
