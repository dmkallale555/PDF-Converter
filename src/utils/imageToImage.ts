import { ImageFormat } from '../types';
import { dataURItoBlob } from './pdfRenderer';

export interface ImageToImageOptions {
  targetFormat: ImageFormat;
  quality: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  backgroundColor?: string; // '#ffffff', 'transparent', etc.
}

/**
 * Format MIME mapping
 */
function getMimeType(format: ImageFormat): string {
  switch (format) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'bmp':
      return 'image/bmp';
    case 'jpeg':
    case 'jpg':
    default:
      return 'image/jpeg';
  }
}

/**
 * Convert a single image File / Blob to a target format
 */
export async function convertSingleImage(
  file: File | Blob,
  fileName: string,
  options: ImageToImageOptions
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number; filename: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetW = img.naturalWidth;
      let targetH = img.naturalHeight;

      // Apply resize constraints if specified
      if (options.maxWidth && options.maxWidth < targetW) {
        const ratio = options.maxWidth / targetW;
        targetW = Math.round(targetW * ratio);
        targetH = Math.round(targetH * ratio);
      }

      if (options.maxHeight && options.maxHeight < targetH) {
        const ratio = options.maxHeight / targetH;
        targetW = Math.round(targetW * ratio);
        targetH = Math.round(targetH * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Background color handling
      const isPng = options.targetFormat === 'png';
      const isTransparentAllowed = isPng || options.targetFormat === 'webp';

      if (!isTransparentAllowed || (options.backgroundColor && options.backgroundColor !== 'transparent')) {
        ctx.fillStyle = options.backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      ctx.drawImage(img, 0, 0, targetW, targetH);

      const mime = getMimeType(options.targetFormat);
      const qualityVal = isPng ? undefined : options.quality;

      // Base filename without old extension
      const baseName = fileName.replace(/\.[^/.]+$/, '');
      const ext = options.targetFormat === 'jpeg' ? 'jpg' : options.targetFormat;
      const outFilename = `${baseName}.${ext}`;

      // Convert
      canvas.toBlob(
        (blob) => {
          let finalBlob = blob;
          let finalDataUrl = '';

          try {
            if (typeof qualityVal === 'number') {
              finalDataUrl = canvas.toDataURL(mime, qualityVal);
            } else {
              finalDataUrl = canvas.toDataURL(mime);
            }
          } catch {
            // fallback
          }

          if (!finalBlob && finalDataUrl) {
            try {
              finalBlob = dataURItoBlob(finalDataUrl);
            } catch (e) {
              console.error(e);
            }
          }

          if (!finalBlob) {
            reject(new Error(`Failed to encode image to ${options.targetFormat.toUpperCase()}`));
            return;
          }

          resolve({
            blob: finalBlob,
            dataUrl: finalDataUrl || URL.createObjectURL(finalBlob),
            width: targetW,
            height: targetH,
            filename: outFilename,
          });
        },
        mime,
        qualityVal
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Could not load image: ${fileName}`));
    };

    img.src = objectUrl;
  });
}
