/**
 * Generate lightweight standard PDF binary buffers for instant testing
 */

export function createSamplePdf(type: 'invoice' | 'presentation' | 'vector'): ArrayBuffer {
  // We can generate clean valid PDF files in pure standard raw format
  if (type === 'invoice') {
    return generateInvoicePdf();
  } else if (type === 'presentation') {
    return generatePresentationPdf();
  } else {
    return generateVectorArtPdf();
  }
}

function generateInvoicePdf(): ArrayBuffer {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 7 0 R >>
endobj
4 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 8 0 R >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
7 0 obj
<< /Length 720 >>
stream
q
0.1 0.35 0.7 rg
50 780 495 30 re f
1 1 1 rg
BT /F1 18 Tf 60 790 Td (HIGH RESOLUTION DOCUMENT - PAGE 1) Tj ET
0.2 0.2 0.2 rg
BT /F1 14 Tf 50 730 Td (INVOICE & SPECIFICATION SHEET) Tj ET
BT /F2 10 Tf 50 710 Td (Invoice #: INV-2026-8942   |   Date: August 18, 2026   |   Status: PAID) Tj ET
0.8 0.85 0.9 rg
50 680 495 2 re f
0.1 0.1 0.1 rg
BT /F1 11 Tf 50 650 Td (Item Description) Tj 320 650 Td (Qty) Tj 400 650 Td (Rate) Tj 480 650 Td (Amount) Tj ET
0.9 0.9 0.9 rg
50 630 495 1 re f
0.3 0.3 0.3 rg
BT /F2 10 Tf 50 610 Td (High-Resolution Vector Graphics Asset Pack) Tj 330 610 Td (1) Tj 390 610 Td ($450.00) Tj 470 610 Td ($450.00) Tj ET
BT /F2 10 Tf 50 580 Td (Ultra 600 DPI Print Typography Master Files) Tj 330 580 Td (2) Tj 390 580 Td ($125.00) Tj 470 580 Td ($250.00) Tj ET
BT /F2 10 Tf 50 550 Td (Lossless PNG / Crisp JPG Conversion License) Tj 330 550 Td (1) Tj 390 550 Td ($300.00) Tj 470 550 Td ($300.00) Tj ET
0.1 0.35 0.7 rg
350 490 195 40 re f
1 1 1 rg
BT /F1 12 Tf 365 505 Td (TOTAL PAID: $1,000.00) Tj ET
0.2 0.2 0.2 rg
BT /F2 9 Tf 50 200 Td (Note: Convert this page at 300 or 600 DPI to verify crisp antialiased text and sharp vector borders.) Tj ET
Q
endstream
endobj
8 0 obj
<< /Length 580 >>
stream
q
0.7 0.15 0.2 rg
50 780 495 30 re f
1 1 1 rg
BT /F1 18 Tf 60 790 Td (TECHNICAL SPECIFICATIONS - PAGE 2) Tj ET
0.2 0.2 0.2 rg
BT /F1 13 Tf 50 730 Td (Render Quality Comparison Metrics) Tj ET
BT /F2 10 Tf 50 700 Td (1. Standard Screen (72 DPI) - 595 x 842 px - Fast web preview) Tj ET
BT /F2 10 Tf 50 670 Td (2. Medium Resolution (150 DPI) - 1240 x 1754 px - Digital sharing & email) Tj ET
BT /F2 10 Tf 50 640 Td (3. High Resolution (300 DPI) - 2480 x 3508 px - Commercial print standard) Tj ET
BT /F2 10 Tf 50 610 Td (4. Ultra Resolution (600 DPI) - 4960 x 7016 px - Archival & large-format vector output) Tj ET
0.2 0.5 0.3 rg
50 500 495 60 re f
1 1 1 rg
BT /F1 14 Tf 70 535 Td (100% Client-Side In-Browser Conversion) Tj ET
BT /F2 10 Tf 70 515 Td (Zero server uploads. Your confidential files stay completely private on your device.) Tj ET
Q
endstream
endobj
xref
0 9
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000242 00000 n 
0000000369 00000 n 
0000000445 00000 n 
0000000515 00000 n 
0000001306 00000 n 
trailer
<< /Size 9 /Root 1 0 R >>
startxref
1957
%%EOF`;

  const enc = new TextEncoder();
  return enc.encode(content).buffer as ArrayBuffer;
}

function generatePresentationPdf(): ArrayBuffer {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length 640 >>
stream
q
0.08 0.12 0.2 rg
0 0 842 595 re f
0.15 0.5 0.9 rg
50 50 742 495 re f
1 1 1 rg
BT /F1 28 Tf 80 480 Td (High-Resolution Presentation Slide) Tj ET
0.9 0.95 1 rg
BT /F2 16 Tf 80 440 Td (Converting PDF vector pages to ultra-sharp PNG & JPG images) Tj ET
1 0.8 0.2 rg
80 320 200 80 re f
0.2 0.8 0.5 rg
320 320 200 80 re f
0.9 0.3 0.4 rg
560 320 200 80 re f
1 1 1 rg
BT /F1 14 Tf 110 360 Td (300 DPI PNG) Tj 350 360 Td (Lossless JPG) Tj 580 360 Td (Batch ZIP) Tj ET
BT /F2 12 Tf 80 180 Td (High pixel density ensures vector curves, icons, and typography remain razor sharp.) Tj ET
Q
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000109 00000 n 
0000000236 00000 n 
0000000312 00000 n 
0000000382 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
1093
%%EOF`;

  const enc = new TextEncoder();
  return enc.encode(content).buffer as ArrayBuffer;
}

function generateVectorArtPdf(): ArrayBuffer {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 600] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Length 610 >>
stream
q
0.98 0.98 0.99 rg
0 0 600 600 re f
0.2 0.4 0.9 rg
100 100 400 400 re f
1 1 1 rg
120 120 360 360 re f
0.1 0.7 0.4 rg
150 150 300 300 re f
1 1 1 rg
BT /F1 22 Tf 180 320 Td (ULTRA 600 DPI) Tj ET
BT /F1 16 Tf 180 280 Td (Vector Grid Benchmark) Tj ET
0.9 0.2 0.3 rg
200 200 200 40 re f
1 1 1 rg
BT /F1 13 Tf 225 218 Td (Crystal Clear Output) Tj ET
Q
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000109 00000 n 
0000000216 00000 n 
0000000286 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
967
%%EOF`;

  const enc = new TextEncoder();
  return enc.encode(content).buffer as ArrayBuffer;
}
