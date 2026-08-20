import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { MergePdfFileItem } from '../types';

// Ensure PDF.js worker is ready
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/**
 * Parse a page range string (e.g., "1-3, 5, 8-10") into zero-based page indices
 */
export function parseMergePageRange(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr || rangeStr.trim() === '' || rangeStr.trim().toLowerCase() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const indices = new Set<number>();
  const parts = rangeStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);

      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let p = min; p <= max; p++) {
          indices.add(p - 1);
        }
      }
    } else {
      const pageNum = parseInt(trimmed, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        indices.add(pageNum - 1);
      }
    }
  }

  const sorted = Array.from(indices).sort((a, b) => a - b);
  return sorted.length > 0 ? sorted : Array.from({ length: totalPages }, (_, i) => i);
}

/**
 * Load PDF metadata and render a fast thumbnail of page 1
 */
export async function loadPdfMetadataAndThumbnail(
  data: ArrayBuffer
): Promise<{ pageCount: number; thumbnailUrl: string }> {
  let pageCount = 1;

  // 1. Fast extraction of page count using pdf-lib first
  try {
    const pdfLibDoc = await PDFDocument.load(data, { ignoreEncryption: true });
    pageCount = Math.max(1, pdfLibDoc.getPageCount());
  } catch (e) {
    // If pdf-lib fails, we will try pdfjs
  }

  // 2. Try rendering thumbnail with pdfjs with a 2-second timeout protection
  try {
    const renderPromise = (async () => {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(data.slice(0)),
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
      });
      const pdfDoc = await loadingTask.promise;
      const pages = pdfDoc.numPages;
      let thumbnailUrl = '';

      if (pages > 0) {
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });
        const scale = Math.min(200 / Math.max(viewport.width, 1), 260 / Math.max(viewport.height, 1), 0.8);
        const scaledViewport = page.getViewport({ scale: Math.max(scale, 0.2) });

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(scaledViewport.width);
        canvas.height = Math.floor(scaledViewport.height);

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: ctx,
            viewport: scaledViewport,
          }).promise;

          thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
        }
      }

      return { pageCount: pages || pageCount, thumbnailUrl };
    })();

    const timeoutPromise = new Promise<{ pageCount: number; thumbnailUrl: string }>((resolve) => {
      setTimeout(() => resolve({ pageCount, thumbnailUrl: '' }), 2000);
    });

    return await Promise.race([renderPromise, timeoutPromise]);
  } catch (err) {
    console.warn('Thumbnail generation skipped:', err);
    return { pageCount, thumbnailUrl: '' };
  }
}

/**
 * Merge multiple PDF items into a single PDF document
 */
export async function mergePdfs(
  items: MergePdfFileItem[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ blob: Blob; totalMergedPages: number }> {
  if (!items || items.length === 0) {
    throw new Error('No PDF documents provided to merge.');
  }

  const mergedPdf = await PDFDocument.create();
  let totalMergedPages = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (onProgress) {
      onProgress(i + 1, items.length, `Processing ${item.name} (${i + 1} of ${items.length})...`);
    }

    try {
      const srcDoc = await PDFDocument.load(item.data, { ignoreEncryption: true });
      const srcPageCount = srcDoc.getPageCount();
      const pageIndices = parseMergePageRange(item.pageRange, srcPageCount);

      if (pageIndices.length === 0) {
        continue;
      }

      const copiedPages = await mergedPdf.copyPages(srcDoc, pageIndices);
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
        totalMergedPages++;
      }
    } catch (err: any) {
      console.error(`Error copying pages from ${item.name}:`, err);
      throw new Error(`Failed to process "${item.name}": ${err.message || 'Corrupted or encrypted PDF'}`);
    }
  }

  if (totalMergedPages === 0) {
    throw new Error('No valid pages found to merge.');
  }

  if (onProgress) {
    onProgress(items.length, items.length, 'Compiling and optimizing merged PDF...');
  }

  const mergedPdfBytes = await mergedPdf.save();
  const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });

  return {
    blob,
    totalMergedPages,
  };
}
