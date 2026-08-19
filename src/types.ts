export type ImageFormat = 'png' | 'jpeg' | 'jpg' | 'webp' | 'tiff' | 'bmp' | 'svg' | 'gif';

export type InputFileType = 'pdf' | 'image';

export type DpiPreset = 72 | 96 | 150 | 200 | 300 | 600 | 'custom';

export type ColorMode = 'color' | 'grayscale' | 'monochrome' | 'high-contrast';

export type PageOrientation = 'portrait' | 'landscape' | 'auto';

export type PageSize = 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Custom' | 'FitImage';

export type ImageScaling = 'fit' | 'fill' | 'original';

export type PageMargin = 'none' | 'small' | 'normal' | 'large';

export type PdfQuality = 'standard' | 'high' | 'maximum';

export type ThemeMode = 'light' | 'dark' | 'system';

export type UserRole = 'USER' | 'ADMIN';

export type AppRoute = 
  | 'home'
  | 'pdf-to-jpg'
  | 'pdf-to-png'
  | 'pdf-to-webp'
  | 'pdf-to-tiff'
  | 'pdf-to-bmp'
  | 'image-to-pdf'
  | 'jpg-to-png'
  | 'png-to-jpg'
  | 'jpg-to-pdf'
  | 'png-to-pdf'
  | 'image-to-image'
  | 'batch-converter'
  | 'dashboard'
  | 'history'
  | 'settings'
  | 'admin'
  | 'about'
  | 'privacy'
  | 'terms'
  | 'cookie-policy'
  | 'contact'
  | 'security';

export interface UserPreferences {
  defaultFormat: ImageFormat;
  defaultDpi: number;
  defaultQuality: number;
  theme: ThemeMode;
  autoDownloadZip: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'disabled';
  preferences: UserPreferences;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: number;
}

export interface ConversionRecord {
  id: string;
  userId: string;
  originalFilename: string;
  inputFormat: string;
  outputFormat: string;
  inputSize: number;
  outputSize: number;
  pageCount?: number;
  dpi?: number;
  quality?: number;
  status: 'completed' | 'failed' | 'processing';
  createdAt: string;
  downloadUrl?: string;
  downloadFilename?: string;
}

export interface ConversionSettings {
  format: ImageFormat;
  dpi: number;
  scale: number;
  jpegQuality: number; // 0.1 to 1.0
  colorMode: ColorMode;
  backgroundColor: string; // '#ffffff', 'transparent', etc.
  rotationOffset: number; // 0, 90, 180, 270
  pageRange: string;
  namingPattern: string; // e.g. "{name}_page_{page}"
}

export interface ImageToPdfSettings {
  pageSize: PageSize;
  orientation: PageOrientation;
  scaling: ImageScaling;
  margin: PageMargin;
  quality: PdfQuality;
  outputFilename: string;
}

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  width: number;
  height: number;
  rotation: number;
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
  statusMessage?: string;
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

export interface BatchFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: 'pdf' | 'image';
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  outputBlob?: Blob;
  outputFilename?: string;
  pageCount?: number;
  previewUrl?: string;
}

export interface SystemConfig {
  maxFileSizeMb: number;
  maxBatchFiles: number;
  maxPagesPerPdf: number;
  maxDpi: number;
  retentionHours: number;
}
