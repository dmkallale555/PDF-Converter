import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Zap, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface DropzoneProps {
  onFileLoaded: (file: File, buffer: ArrayBuffer) => void;
  onLoadSample: (type: 'invoice' | 'presentation' | 'vector') => void;
  isLoading: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileLoaded,
  onLoadSample,
  isLoading
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

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-10">
      {/* Hero Heading */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          High-Resolution PDF Conversion
        </h1>
        <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
          Convert your documents to studio-quality JPG or PNG images with 600 DPI precision.
        </p>
      </div>

      {/* Main Drag & Drop Box */}
      <div
        id="pdf-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`w-full max-w-3xl mx-auto bg-white border-2 border-dashed rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center transition-all group cursor-pointer shadow-xs ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/40 scale-[1.01] shadow-md shadow-indigo-500/10'
            : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
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

        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-10 h-10 text-indigo-600" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
          Drop your PDF here
        </h2>
        <p className="text-gray-400 text-sm mb-8 text-center">
          or click to browse your computer
        </p>

        {/* Formats Pill Bar */}
        <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-xl border border-gray-100">
          <span className="px-5 py-2 bg-white shadow-xs border border-gray-200 rounded-lg text-xs font-bold text-gray-900">
            JPG
          </span>
          <span className="px-5 py-2 text-xs font-semibold text-gray-600">
            PNG
          </span>
          <span className="px-5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg">
            600 DPI
          </span>
        </div>

        {errorMsg && (
          <div className="mt-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Quick Test Samples Card */}
      <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Need a test file?
          </span>
          <p className="text-sm text-gray-700 font-medium">
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
            className="px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            Invoice Doc
          </button>
          <button
            id="quick-sample-slide"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('presentation');
            }}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Slide Deck
          </button>
          <button
            id="quick-sample-vector"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('vector');
            }}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            600 DPI Vector
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="w-full max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Resolution</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">600 DPI</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative mb-2">
              <div className="h-full w-full bg-indigo-600 rounded-full"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Studio-quality vector rendering with ultra-sharp text and borders.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Quality Level</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Ultra Lossless</span>
            </div>
            <div className="flex gap-1.5 mb-2">
              <div className="flex-1 h-1.5 bg-indigo-200 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-indigo-300 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-indigo-400 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-indigo-600 rounded-full"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Ideal for commercial printing, publications, and archival.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Privacy</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">100% In-Browser</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden relative mb-2">
              <div className="h-full w-full bg-emerald-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Client-side canvas conversion. Zero server tracking or file storage.
          </p>
        </div>
      </div>

    </div>
  );
};
