import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { ColorMode, ConversionSettings, LoadedPdf, PageInfo } from '../types';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/**
 * Load PDF document from ArrayBuffer
 */
export async function loadPdfDocument(data: ArrayBuffer, password?: string): Promise<any> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(data),
    password: password || undefined,
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true,
  });

  return await loadingTask.promise;
}

/**
 * Extract initial page metadata (dimensions, default rotation)
 */
export async function extractPagesInfo(pdfDoc: any): Promise<PageInfo[]> {
  const pages: PageInfo[] = [];
  const totalPages = pdfDoc.numPages;

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });

    pages.push({
      pageNumber: i,
      widthPt: Math.round(viewport.width),
      heightPt: Math.round(viewport.height),
      originalRotation: page.rotate || 0,
      selected: true,
      userRotation: 0,
    });
  }

  return pages;
}

/**
 * Render a fast low-res thumbnail for the grid view
 */
export async function renderPageThumbnail(
  pdfDoc: any,
  pageNumber: number,
  userRotation: number = 0
): Promise<string> {
  const page = await pdfDoc.getPage(pageNumber);
  const rotation = ((page.rotate || 0) + userRotation) % 360;
  
  // Render thumbnail at reasonable scale (~150-200px wide)
  const initialViewport = page.getViewport({ scale: 1.0, rotation });
  const scale = 200 / Math.max(initialViewport.width, initialViewport.height);
  const viewport = page.getViewport({ scale, rotation });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) throw new Error('Could not get canvas context');

  // Fill white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Helper to convert Base64 Data URL to a Blob
 */
export function dataURItoBlob(dataURI: string): Blob {
  const parts = dataURI.split(',');
  const byteString = atob(parts[1]);
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeString = mimeMatch ? mimeMatch[1] : 'image/png';
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

/**
 * Robust canvas to Blob & DataURL converter with multiple fallbacks
 */
export async function canvasToBlobAndDataUrl(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<{ blob: Blob; dataUrl: string }> {
  let blob: Blob | null = null;
  let dataUrl: string = '';

  // 1. Try canvas.toBlob first
  try {
    blob = await new Promise<Blob | null>((resolve) => {
      try {
        if (typeof quality === 'number') {
          canvas.toBlob((b) => resolve(b), mimeType, quality);
        } else {
          canvas.toBlob((b) => resolve(b), mimeType);
        }
      } catch {
        resolve(null);
      }
    });
  } catch {
    blob = null;
  }

  // 2. If toBlob succeeded, extract or generate dataUrl
  if (blob) {
    try {
      if (typeof quality === 'number') {
        dataUrl = canvas.toDataURL(mimeType, quality);
      } else {
        dataUrl = canvas.toDataURL(mimeType);
      }
    } catch {
      dataUrl = URL.createObjectURL(blob);
    }
  } else {
    // 3. Fallback: If toBlob returned null (frequent in sandboxed iframes or high resolutions), convert via toDataURL
    try {
      if (typeof quality === 'number') {
        dataUrl = canvas.toDataURL(mimeType, quality);
      } else {
        dataUrl = canvas.toDataURL(mimeType);
      }
      blob = dataURItoBlob(dataUrl);
    } catch (e) {
      console.warn('Fallback dataURL to Blob conversion failed, trying secondary format:', e);
    }
  }

  // 4. Secondary fallback: try fallback format (JPEG or PNG)
  if (!blob) {
    try {
      const fallbackMime = mimeType === 'image/png' ? 'image/jpeg' : 'image/png';
      dataUrl = canvas.toDataURL(fallbackMime, 0.92);
      blob = dataURItoBlob(dataUrl);
    } catch (e) {
      console.error('Secondary fallback format failed:', e);
    }
  }

  if (!blob) {
    throw new Error(
      'Image rendering failed due to browser memory limits. Please try lowering the DPI setting or choosing JPG format.'
    );
  }

  return { blob, dataUrl };
}

/**
 * Render a PDF page at High Resolution (Target DPI / Scale)
 */
export async function renderPageToImage(
  pdfDoc: any,
  pageNumber: number,
  settings: ConversionSettings,
  userRotation: number = 0
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number; size: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const finalRotation = ((page.rotate || 0) + settings.rotationOffset + userRotation) % 360;

  // Calculate target scale based on target DPI (Standard PDF is 72 DPI)
  // Scale = targetDpi / 72
  let targetScale = settings.dpi / 72;
  let viewport = page.getViewport({ scale: targetScale, rotation: finalRotation });

  // Safe dimension clamping for browser canvas memory limits (Max ~12,000px or ~70MP)
  const maxSafeDimension = 10000;
  if (viewport.width > maxSafeDimension || viewport.height > maxSafeDimension) {
    const clampRatio = maxSafeDimension / Math.max(viewport.width, viewport.height);
    targetScale = targetScale * clampRatio;
    viewport = page.getViewport({ scale: targetScale, rotation: finalRotation });
  }

  const width = Math.floor(viewport.width);
  const height = Math.floor(viewport.height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const isPng = settings.format === 'png';
  const allowAlpha = isPng && settings.backgroundColor === 'transparent';
  const ctx = canvas.getContext('2d', { alpha: allowAlpha, willReadFrequently: true });

  if (!ctx) throw new Error('Could not get 2D rendering context');

  // Fill background
  if (!allowAlpha) {
    ctx.fillStyle = settings.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  // Enhanced image rendering quality settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Render vector PDF content onto canvas
  await page.render({
    canvasContext: ctx,
    viewport,
    background: allowAlpha ? 'rgba(0,0,0,0)' : (settings.backgroundColor || '#ffffff'),
  }).promise;

  // Apply post-processing color modes if requested
  if (settings.colorMode !== 'color') {
    applyColorFilter(ctx, width, height, settings.colorMode);
  }

  // Export to requested format using robust fallback engine
  let mimeType = 'image/png';
  let quality: number | undefined = undefined;

  switch (settings.format) {
    case 'webp':
      mimeType = 'image/webp';
      quality = settings.jpegQuality;
      break;
    case 'bmp':
      mimeType = 'image/bmp';
      break;
    case 'tiff':
      mimeType = 'image/tiff';
      break;
    case 'svg':
      mimeType = 'image/png'; // Will be wrapped if svg requested
      break;
    case 'jpeg':
    case 'jpg':
      mimeType = 'image/jpeg';
      quality = settings.jpegQuality;
      break;
    case 'png':
    default:
      mimeType = 'image/png';
      quality = undefined;
      break;
  }

  let { blob, dataUrl } = await canvasToBlobAndDataUrl(canvas, mimeType, quality);

  // SVG wrapping if SVG format is selected
  if (settings.format === 'svg') {
    const svgString = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" xlink:href="${dataUrl}"/>
</svg>`;
    blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
  }

  return {
    blob,
    dataUrl,
    width,
    height,
    size: blob.size,
  };
}

/**
 * Apply Grayscale, Monochrome, or High-Contrast Document Filters
 */
function applyColorFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mode: ColorMode
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const a = d[i + 3];

    if (a === 0) continue;

    // Standard Rec. 709 luminance weights for natural perception
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (mode === 'grayscale') {
      d[i] = lum;
      d[i + 1] = lum;
      d[i + 2] = lum;
    } else if (mode === 'monochrome') {
      // Pure black and white threshold
      const val = lum < 128 ? 0 : 255;
      d[i] = val;
      d[i + 1] = val;
      d[i + 2] = val;
    } else if (mode === 'high-contrast') {
      // Scanned document optimization: boost white paper to pure white & darken ink
      let val = lum;
      if (val > 180) {
        val = 255; // clean background noise
      } else if (val < 100) {
        val = Math.max(0, val * 0.7); // deepen dark text
      } else {
        // High contrast S-curve
        val = ((val - 128) * 1.5) + 128;
        val = Math.max(0, Math.min(255, val));
      }
      d[i] = val;
      d[i + 1] = val;
      d[i + 2] = val;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Parse custom page range string like "1, 3-5, 8" into set of 1-based page numbers
 */
export function parsePageRange(rangeStr: string, totalPages: number): Set<number> {
  const trimmed = rangeStr.trim().toLowerCase();
  const result = new Set<number>();

  if (!trimmed || trimmed === 'all') {
    for (let i = 1; i <= totalPages; i++) result.add(i);
    return result;
  }
  if (trimmed === 'odd') {
    for (let i = 1; i <= totalPages; i += 2) result.add(i);
    return result;
  }
  if (trimmed === 'even') {
    for (let i = 2; i <= totalPages; i += 2) result.add(i);
    return result;
  }
  if (trimmed === 'first') {
    result.add(1);
    return result;
  }

  const parts = trimmed.split(/[,;\s]+/);
  for (const part of parts) {
    if (!part) continue;
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let i = min; i <= max; i++) result.add(i);
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        result.add(num);
      }
    }
  }

  if (result.size === 0) {
    for (let i = 1; i <= totalPages; i++) result.add(i);
  }

  return result;
}

/**
 * Create a ZIP archive containing all selected converted high-res images
 */
export async function createZipArchive(
  loadedPdf: LoadedPdf,
  settings: ConversionSettings,
  pagesToConvert: PageInfo[],
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const baseName = loadedPdf.name.replace(/\.pdf$/i, '');
  const ext = settings.format === 'png' ? 'png' : 'jpg';

  const total = pagesToConvert.length;
  let current = 0;

  for (const pageInfo of pagesToConvert) {
    current++;
    if (onProgress) {
      onProgress(current, total);
    }

    let blob = pageInfo.renderedBlob;

    // If not already rendered with current settings, render now
    if (!blob) {
      const res = await renderPageToImage(
        loadedPdf.pdfDocument,
        pageInfo.pageNumber,
        settings,
        pageInfo.userRotation
      );
      blob = res.blob;
    }

    const padDigits = totalPagesDigits(loadedPdf.totalPages);
    const pageStr = String(pageInfo.pageNumber).padStart(padDigits, '0');
    const filename = `${baseName}_page_${pageStr}_${settings.dpi}dpi.${ext}`;

    zip.file(filename, blob);
  }

  return await zip.generateAsync({ type: 'blob' });
}

function totalPagesDigits(total: number): number {
  if (total >= 100) return 3;
  if (total >= 10) return 2;
  return 1;
}

/**
 * Trigger browser file download
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Copy image directly to user's clipboard
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    // Clipboard item requires image/png
    if (blob.type === 'image/png') {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    } else {
      // Convert to png for clipboard
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.src = url;
      await new Promise((res) => (img.onload = res));
      
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      return new Promise<boolean>((resolve) => {
        canvas.toBlob(async (pngBlob) => {
          let finalBlob = pngBlob;
          if (!finalBlob) {
            try {
              const dataUrl = canvas.toDataURL('image/png');
              finalBlob = dataURItoBlob(dataUrl);
            } catch {
              finalBlob = null;
            }
          }

          if (!finalBlob) {
            resolve(false);
            return;
          }

          try {
            const item = new ClipboardItem({ 'image/png': finalBlob });
            await navigator.clipboard.write([item]);
            resolve(true);
          } catch (e) {
            console.error('Clipboard write error', e);
            resolve(false);
          }
        }, 'image/png');
      });
    }
  } catch (err) {
    console.error('Clipboard copy failed', err);
    return false;
  }
}

/**
 * Format bytes to readable string (KB, MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const formatFileSize = formatBytes;

