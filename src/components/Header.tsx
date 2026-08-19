import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Presentation, 
  Compass, 
  RotateCcw
} from 'lucide-react';

interface HeaderProps {
  hasDocument: boolean;
  onReset: () => void;
  onLoadSample: (type: 'invoice' | 'presentation' | 'vector') => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  hasDocument,
  onReset,
  onLoadSample,
  isLoading
}) => {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-xs">
            <div className="w-4 h-4 border-2 border-white rounded-xs"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900">
                PDFCORE
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                600 DPI Ultra
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block font-medium">
              High-Resolution PDF to JPG & PNG Converter
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Privacy Badge */}
          <div 
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200"
            title="All files are processed 100% locally inside your browser. No files are uploaded to any server."
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>100% Local & Private</span>
          </div>

          {/* Sample PDFs Dropdown / Buttons */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
            <span className="px-2 py-1 text-gray-400 font-semibold uppercase tracking-wider text-[10px] hidden lg:inline">Samples:</span>
            <button
              id="sample-doc-btn"
              onClick={() => onLoadSample('invoice')}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-2xs transition-all flex items-center gap-1 font-semibold disabled:opacity-50"
              title="Load 2-page Invoice & Spec sample PDF"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Document</span>
            </button>
            <button
              id="sample-slide-btn"
              onClick={() => onLoadSample('presentation')}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-2xs transition-all flex items-center gap-1 font-semibold disabled:opacity-50"
              title="Load Presentation Slide PDF"
            >
              <Presentation className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Slide</span>
            </button>
            <button
              id="sample-vector-btn"
              onClick={() => onLoadSample('vector')}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-2xs transition-all flex items-center gap-1 font-semibold disabled:opacity-50"
              title="Load High-Res Vector Art Benchmark PDF"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Vector</span>
            </button>
          </div>

          {/* Reset / New File Button */}
          {hasDocument && (
            <button
              id="new-file-btn"
              onClick={onReset}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Change File</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
