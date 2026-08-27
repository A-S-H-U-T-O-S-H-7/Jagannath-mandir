const MAX_DIMENSION = 2560;

export async function compressImageUnderLimit(file: File, maxBytes: number): Promise<File> {
  if (file.size <= maxBytes) return file;

  const source = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Unable to read image')); };
    image.src = url;
  });

  const scale = Math.min(1, MAX_DIMENSION / Math.max(source.naturalWidth, source.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height);

  for (const quality of [0.88, 0.78, 0.68, 0.58, 0.48, 0.38]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob && blob.size <= maxBytes) {
      const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
      return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified });
    }
  }
  throw new Error('Image could not be compressed below 5MB. Please choose a smaller image.');
}
