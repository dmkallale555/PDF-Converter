import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generate lightweight standard PDF binary buffers for instant testing
 */
export async function createSamplePdfAsync(type: 'invoice' | 'presentation' | 'vector'): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  if (type === 'invoice') {
    // Page 1: Invoice
    const page1 = doc.addPage([595.28, 841.89]);
    page1.drawRectangle({
      x: 50,
      y: 780,
      width: 495,
      height: 30,
      color: rgb(0.1, 0.35, 0.7),
    });
    page1.drawText('HIGH RESOLUTION DOCUMENT - PAGE 1', {
      x: 60,
      y: 790,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page1.drawText('INVOICE & SPECIFICATION SHEET', {
      x: 50,
      y: 730,
      size: 13,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    page1.drawText('Invoice #: INV-2026-8942   |   Date: August 18, 2026   |   Status: PAID', {
      x: 50,
      y: 710,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    page1.drawRectangle({
      x: 50,
      y: 680,
      width: 495,
      height: 2,
      color: rgb(0.8, 0.85, 0.9),
    });
    page1.drawText('Item Description                            Qty    Rate      Amount', {
      x: 50,
      y: 650,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    page1.drawText('High-Resolution Vector Graphics Asset Pack   1    $450.00   $450.00', {
      x: 50,
      y: 610,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    page1.drawText('Ultra 600 DPI Print Typography Master Files  2    $125.00   $250.00', {
      x: 50,
      y: 580,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    page1.drawText('Lossless PNG / Crisp JPG Conversion License  1    $300.00   $300.00', {
      x: 50,
      y: 550,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    page1.drawRectangle({
      x: 350,
      y: 490,
      width: 195,
      height: 35,
      color: rgb(0.1, 0.35, 0.7),
    });
    page1.drawText('TOTAL PAID: $1,000.00', {
      x: 365,
      y: 502,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Page 2
    const page2 = doc.addPage([595.28, 841.89]);
    page2.drawRectangle({
      x: 50,
      y: 780,
      width: 495,
      height: 30,
      color: rgb(0.7, 0.15, 0.2),
    });
    page2.drawText('TECHNICAL SPECIFICATIONS - PAGE 2', {
      x: 60,
      y: 790,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page2.drawText('Render Quality Comparison Metrics', {
      x: 50,
      y: 730,
      size: 13,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    page2.drawText('1. Standard Screen (72 DPI) - 595 x 842 px - Fast web preview', {
      x: 50,
      y: 700,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    page2.drawText('2. Medium Resolution (150 DPI) - 1240 x 1754 px - Digital sharing & email', {
      x: 50,
      y: 670,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    page2.drawText('3. High Resolution (300 DPI) - 2480 x 3508 px - Commercial print standard', {
      x: 50,
      y: 640,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    page2.drawText('4. Ultra Resolution (600 DPI) - 4960 x 7016 px - Archival & large-format output', {
      x: 50,
      y: 610,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  } else if (type === 'presentation') {
    const page = doc.addPage([841.89, 595.28]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 842,
      height: 595,
      color: rgb(0.08, 0.12, 0.2),
    });
    page.drawRectangle({
      x: 40,
      y: 40,
      width: 762,
      height: 515,
      color: rgb(0.15, 0.22, 0.35),
    });
    page.drawText('High-Resolution Presentation Slide', {
      x: 70,
      y: 480,
      size: 24,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText('Converting PDF vector pages to ultra-sharp PNG & JPG images', {
      x: 70,
      y: 440,
      size: 14,
      font,
      color: rgb(0.8, 0.9, 1),
    });
    page.drawRectangle({
      x: 70,
      y: 320,
      width: 200,
      height: 80,
      color: rgb(0.9, 0.7, 0.1),
    });
    page.drawText('300 DPI PNG', {
      x: 100,
      y: 355,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawRectangle({
      x: 300,
      y: 320,
      width: 200,
      height: 80,
      color: rgb(0.1, 0.7, 0.4),
    });
    page.drawText('Lossless JPG', {
      x: 330,
      y: 355,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawRectangle({
      x: 530,
      y: 320,
      width: 200,
      height: 80,
      color: rgb(0.8, 0.2, 0.3),
    });
    page.drawText('Batch Merged', {
      x: 560,
      y: 355,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  } else {
    // Vector
    const page = doc.addPage([600, 600]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 600,
      height: 600,
      color: rgb(0.95, 0.96, 0.98),
    });
    page.drawRectangle({
      x: 80,
      y: 80,
      width: 440,
      height: 440,
      color: rgb(0.2, 0.4, 0.9),
    });
    page.drawRectangle({
      x: 120,
      y: 120,
      width: 360,
      height: 360,
      color: rgb(1, 1, 1),
    });
    page.drawRectangle({
      x: 150,
      y: 150,
      width: 300,
      height: 300,
      color: rgb(0.1, 0.7, 0.4),
    });
    page.drawText('ULTRA 600 DPI', {
      x: 180,
      y: 320,
      size: 22,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText('Vector Grid Benchmark', {
      x: 180,
      y: 280,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  const bytes = await doc.save();
  return bytes.buffer as ArrayBuffer;
}

// Synchronous wrapper cache
let cachedInvoice: ArrayBuffer | null = null;
let cachedPresentation: ArrayBuffer | null = null;
let cachedVector: ArrayBuffer | null = null;

// Preload caches
if (typeof window !== 'undefined') {
  createSamplePdfAsync('invoice').then((b) => { cachedInvoice = b; });
  createSamplePdfAsync('presentation').then((b) => { cachedPresentation = b; });
  createSamplePdfAsync('vector').then((b) => { cachedVector = b; });
}

export function createSamplePdf(type: 'invoice' | 'presentation' | 'vector'): ArrayBuffer {
  if (type === 'invoice' && cachedInvoice) return cachedInvoice;
  if (type === 'presentation' && cachedPresentation) return cachedPresentation;
  if (type === 'vector' && cachedVector) return cachedVector;

  // Fallback if not cached yet
  return createMinimalValidPdf();
}

function createMinimalValidPdf(): ArrayBuffer {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Length 120 >>
stream
q
BT /F1 18 Tf 50 780 Td (Sample PDF Document) Tj ET
Q
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000242 00000 n 
0000000318 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
490
%%EOF`;
  const enc = new TextEncoder();
  return enc.encode(content).buffer as ArrayBuffer;
}

