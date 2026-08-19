export type ImageFormat = 'png' | 'jpeg';

export type DpiPreset = 72 | 150 | 300 | 600 | 'custom';

export type ColorMode = 'color' | 'grayscale' | 'monochrome' | 'high-contrast';

export interface ConversionSettings {
  format: ImageFormat;
  dpi: number; // e.g. 72, 150, 300, 600, etc.
  scale: number; // calculated from dpi / 72
  jpegQuality: number; // 0.1 to 1.0 (for JPEG)
  colorMode: ColorMode;
  backgroundColor: string; // '#ffffff', 'transparent', etc.
  rotationOffset: number; // 0, 90, 180, 270
  pageRange: string; // e.g. "all", "1-3, 5"
  namingPattern: string; // e.g. "{name}_page_{page}"
}

export interface PageInfo {
  pageNumber: number;
  widthPt: number;
  heightPt: number;
  originalRotation: number;
  selected: boolean;
  userRotation: number; // 0, 90, 180, 270
  thumbnailUrl?: string;
  renderedBlob?: Blob;
  renderedUrl?: string;
  renderedWidth?: number;
  renderedHeight?: number;
  renderedSize?: number;
  isRendering?: boolean;
  error?: string;
}

export interface ConversionProgress {
  current: number;
  total: number;
  currentPageNumber?: number;
}

export interface LoadedPdf {
  id: string;
  name: string;
  size: number;
  totalPages: number;
  data: ArrayBuffer;
  pages: PageInfo[];
  pdfDocument?: any;
}
