import { PDFDocument, rgb } from 'pdf-lib';
import { ImageItem, ImageToPdfSettings, PageSize, PageOrientation, PageMargin } from '../types';

// Page dimensions in PDF Points (72 points = 1 inch)
const PAGE_DIMENSIONS: Record<Exclude<PageSize, 'Custom' | 'FitImage'>, { width: number; height: number }> = {
  A4: { width: 595.28, height: 841.89 },
  A3: { width: 841.89, height: 1190.55 },
  A5: { width: 419.53, height: 595.28 },
  Letter: { width: 612.0, height: 792.0 },
  Legal: { width: 612.0, height: 1008.0 },
};

const MARGIN_POINTS: Record<PageMargin, number> = {
  none: 0,
  small: 18, // 0.25 inch
  normal: 36, // 0.5 inch
  large: 54, // 0.75 inch
};

/**
 * Converts any image format (including SVG, WebP, BMP, etc.) into a PNG/JPEG Uint8Array
 * so pdf-lib can embed it reliably.
 */
async function prepareImageForPdf(
  imageItem: ImageItem,
  quality: 'standard' | 'high' | 'maximum'
): Promise<{ bytes: Uint8Array; format: 'png' | 'jpg'; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      const rot = (imageItem.rotation || 0) % 360;
      const isSwapped = rot === 90 || rot === 270;
      
      const width = isSwapped ? img.naturalHeight : img.naturalWidth;
      const height = isSwapped ? img.naturalWidth : img.naturalHeight;

      canvas.width = width;
      canvas.height = height;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();

      // Quality ratio for jpeg compression
      const q = quality === 'maximum' ? 0.98 : quality === 'high' ? 0.92 : 0.82;

      // Determine output mime
      const isPng = imageItem.type.includes('png') || imageItem.name.toLowerCase().endsWith('.png');
      const mime = isPng ? 'image/png' : 'image/jpeg';

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            // Fallback via toDataURL
            try {
              const dataUrl = canvas.toDataURL(mime, q);
              const byteString = atob(dataUrl.split(',')[1]);
              const u8 = new Uint8Array(byteString.length);
              for (let i = 0; i < byteString.length; i++) {
                u8[i] = byteString.charCodeAt(i);
              }
              resolve({ bytes: u8, format: isPng ? 'png' : 'jpg', width, height });
            } catch (err) {
              reject(err);
            }
            return;
          }

          const arrayBuffer = await blob.arrayBuffer();
          resolve({
            bytes: new Uint8Array(arrayBuffer),
            format: isPng ? 'png' : 'jpg',
            width,
            height,
          });
        },
        mime,
        q
      );
    };

    img.onerror = () => reject(new Error(`Failed to load image: ${imageItem.name}`));
    img.src = imageItem.previewUrl;
  });
}

/**
 * Generate a PDF document from a list of images with specified page settings
 */
export async function convertImagesToPdf(
  images: ImageItem[],
  settings: ImageToPdfSettings,
  onProgress?: (current: number, total: number, status: string) => void
): Promise<{ blob: Blob; filename: string; pageCount: number; size: number }> {
  if (images.length === 0) {
    throw new Error('No images provided for PDF conversion.');
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(settings.outputFilename || 'ConvertPro_Images.pdf');
  pdfDoc.setProducer('ConvertPro PDF Studio (In-Browser High-Res Engine)');
  pdfDoc.setCreator('ConvertPro');

  const marginPt = MARGIN_POINTS[settings.margin] || 0;
  const total = images.length;

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    if (onProgress) {
      onProgress(i + 1, total, `Processing image ${i + 1} of ${total}: ${item.name}`);
    }

    const { bytes, format, width: imgW, height: imgH } = await prepareImageForPdf(
      item,
      settings.quality
    );

    let embeddedImage;
    if (format === 'png') {
      embeddedImage = await pdfDoc.embedPng(bytes);
    } else {
      embeddedImage = await pdfDoc.embedJpg(bytes);
    }

    // Determine target page dimensions
    let pageWidth: number;
    let pageHeight: number;

    if (settings.pageSize === 'FitImage' || settings.pageSize === 'Custom') {
      // 72 DPI PDF point mapping: 1 pixel = 0.75 points (or 1:1)
      pageWidth = imgW * 0.75 + marginPt * 2;
      pageHeight = imgH * 0.75 + marginPt * 2;
    } else {
      const standard = PAGE_DIMENSIONS[settings.pageSize] || PAGE_DIMENSIONS.A4;
      let w = standard.width;
      let h = standard.height;

      // Auto orientation or explicit
      let isLandscape = false;
      if (settings.orientation === 'auto') {
        isLandscape = imgW > imgH;
      } else if (settings.orientation === 'landscape') {
        isLandscape = true;
      }

      if (isLandscape) {
        pageWidth = Math.max(w, h);
        pageHeight = Math.min(w, h);
      } else {
        pageWidth = Math.min(w, h);
        pageHeight = Math.max(w, h);
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Available drawable box inside margins
    const drawBoxW = Math.max(10, pageWidth - marginPt * 2);
    const drawBoxH = Math.max(10, pageHeight - marginPt * 2);

    let finalDrawW: number;
    let finalDrawH: number;
    let finalX: number;
    let finalY: number;

    if (settings.scaling === 'fit') {
      const scaleFactor = Math.min(drawBoxW / imgW, drawBoxH / imgH);
      finalDrawW = imgW * scaleFactor;
      finalDrawH = imgH * scaleFactor;
      finalX = marginPt + (drawBoxW - finalDrawW) / 2;
      finalY = marginPt + (drawBoxH - finalDrawH) / 2;
    } else if (settings.scaling === 'fill') {
      const scaleFactor = Math.max(drawBoxW / imgW, drawBoxH / imgH);
      finalDrawW = imgW * scaleFactor;
      finalDrawH = imgH * scaleFactor;
      finalX = marginPt + (drawBoxW - finalDrawW) / 2;
      finalY = marginPt + (drawBoxH - finalDrawH) / 2;
    } else {
      // Original size (72 pt per 96 px)
      finalDrawW = Math.min(drawBoxW, imgW * 0.75);
      finalDrawH = Math.min(drawBoxH, imgH * 0.75);
      finalX = marginPt + (drawBoxW - finalDrawW) / 2;
      finalY = marginPt + (drawBoxH - finalDrawH) / 2;
    }

    page.drawImage(embeddedImage, {
      x: finalX,
      y: finalY,
      width: finalDrawW,
      height: finalDrawH,
    });
  }

  if (onProgress) {
    onProgress(total, total, 'Compiling and optimizing PDF document...');
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

  let outName = settings.outputFilename.trim();
  if (!outName.toLowerCase().endsWith('.pdf')) {
    outName += '.pdf';
  }

  return {
    blob: pdfBlob,
    filename: outName,
    pageCount: images.length,
    size: pdfBlob.size,
  };
}
