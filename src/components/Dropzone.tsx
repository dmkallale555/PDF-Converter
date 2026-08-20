import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Zap, 
  CheckCircle2,
  FileCheck,
  Printer,
  Grid
} from 'lucide-react';
import { AppRoute } from '../types';

interface DropzoneProps {
  onFileLoaded: (file: File, buffer: ArrayBuffer) => void;
  onLoadSample: (type: 'invoice' | 'presentation' | 'vector') => void;
  isLoading: boolean;
  activeRoute?: AppRoute;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileLoaded,
  onLoadSample,
  isLoading,
  activeRoute = 'pdf-to-jpg'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF document (.pdf).');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      onFileLoaded(file, buffer);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to read file.');
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const getToolDetails = () => {
    switch (activeRoute) {
      case 'pdf-to-png':
        return {
          title: 'PDF to PNG Converter',
          subtitle: 'Extract vector pages into lossless PNG graphics with full transparency support and 600 DPI crispness.',
          activePill: 'PNG (Lossless)',
        };
      case 'pdf-to-webp':
        return {
          title: 'PDF to WEBP Converter',
          subtitle: 'Convert PDF pages into lightweight, high-performance WEBP images optimized for websites and apps.',
          activePill: 'WEBP (Compact)',
        };
      case 'pdf-to-tiff':
        return {
          title: 'PDF to TIFF Converter',
          subtitle: 'Export high-definition, uncompressed TIFF images ideal for commercial printing and institutional archiving.',
          activePill: 'TIFF (Print)',
        };
      case 'pdf-to-bmp':
        return {
          title: 'PDF to BMP Converter',
          subtitle: 'Convert PDF document pages to standard Windows bitmap (BMP) raster graphics.',
          activePill: 'BMP (Bitmap)',
        };
      case 'pdf-to-jpg':
      default:
        return {
          title: 'PDF to JPG Converter',
          subtitle: 'Convert your PDF documents into high-resolution, studio-quality JPG images up to 600 DPI.',
          activePill: 'JPG (High-Res)',
        };
    }
  };

  const details = getToolDetails();

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 px-4 space-y-8">
      {/* Hero Heading */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3">
          {details.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
          {details.subtitle}
        </p>
      </div>

      {/* Main Drag & Drop Box */}
      <div
        id="pdf-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 border-2 border-dashed rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center transition-all group cursor-pointer shadow-xs ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 scale-[1.01] shadow-md shadow-indigo-500/10'
            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm'
        } ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleInputChange}
          disabled={isLoading}
        />

        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/60 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Drop your PDF here
        </h2>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-8 text-center">
          or click to browse your computer
        </p>

        {/* Formats Pill Bar */}
        <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-900/80 p-1.5 rounded-xl border border-gray-100 dark:border-gray-700/80">
          <span className="px-4 py-2 bg-white dark:bg-gray-800 shadow-xs border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {details.activePill}
          </span>
          <span className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
            Multi-Page
          </span>
          <span className="px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg">
            600 DPI Studio
          </span>
        </div>

        {errorMsg && (
          <div className="mt-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Quick Test Samples Card */}
      <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">
            Need a test file?
          </span>
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            Try one of our high-resolution vector samples:
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <button
            id="quick-sample-doc"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('invoice');
            }}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Invoice Doc
          </button>
          <button
            id="quick-sample-slide"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('presentation');
            }}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Slide Deck
          </button>
          <button
            id="quick-sample-vector"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('vector');
            }}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            600 DPI Vector
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="w-full max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Resolution</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">600 DPI</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative mb-2">
              <div className="h-full w-full bg-indigo-600 rounded-full"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            Studio-quality vector rendering with ultra-sharp text and borders.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Quality Level</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">Ultra Lossless</span>
            </div>
            <div className="flex gap-1.5 mb-2">
              <div className="flex-1 h-1.5 bg-indigo-200 dark:bg-indigo-900 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-indigo-300 dark:bg-indigo-800 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-indigo-400 dark:bg-indigo-700 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-indigo-600 rounded-full"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            Ideal for commercial printing, publications, and archival.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Privacy</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">100% In-Browser</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-100 dark:bg-emerald-900 rounded-full overflow-hidden relative mb-2">
              <div className="h-full w-full bg-emerald-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            Client-side canvas conversion. Zero server tracking or file storage.
          </p>
        </div>
      </div>

    </div>
  );
};
