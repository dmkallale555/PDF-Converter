import React, { useState, useEffect } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Copy, 
  Check, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PageInfo, ConversionSettings } from '../types';
import { formatBytes } from '../utils/pdfRenderer';

interface PreviewModalProps {
  page: PageInfo | null;
  settings: ConversionSettings;
  onClose: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onDownload: (pageNumber: number) => void;
  onCopy: (pageNumber: number) => void;
  isCopied: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  page,
  settings,
  onClose,
  onPrevPage,
  onNextPage,
  hasPrev,
  hasNext,
  onDownload,
  onCopy,
  isCopied
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    // Reset zoom when modal opens or page changes
    setZoomLevel(1);
  }, [page?.pageNumber]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrevPage();
      if (e.key === 'ArrowRight' && hasNext) onNextPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevPage, onNextPage, hasPrev, hasNext]);

  if (!page) return null;

  const imgSrc = page.renderedUrl || page.thumbnailUrl;
  const isHighRes = !!page.renderedUrl;

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
          
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-white">
              Page {page.pageNumber}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>{isHighRes ? `${settings.dpi} DPI High-Res` : 'Preview Quality'}</span>
            </div>
            {page.renderedWidth && (
              <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                {page.renderedWidth} × {page.renderedHeight} px {page.renderedSize ? `(${formatBytes(page.renderedSize)})` : ''}
              </span>
            )}
          </div>

          {/* Zoom Controls & Navigation */}
          <div className="flex items-center gap-2">
            
            {/* Zoom Tool */}
            <div className="flex items-center bg-gray-800 rounded-xl p-0.5 border border-gray-700 text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-300 transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-gray-300 text-xs select-none">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-300 transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="px-2 py-1 hover:bg-gray-700 rounded-lg text-gray-300 transition-all text-[11px] font-bold cursor-pointer"
                title="Reset Zoom"
              >
                100%
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

        </div>

        {/* Center Viewer Area */}
        <div className="flex-1 bg-gray-900/95 overflow-auto flex items-center justify-center p-4 sm:p-8 relative select-none">
          
          {/* Navigation Arrows */}
          {hasPrev && (
            <button
              onClick={onPrevPage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white shadow-lg backdrop-blur-xs transition-all cursor-pointer"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {hasNext && (
            <button
              onClick={onNextPage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white shadow-lg backdrop-blur-xs transition-all cursor-pointer"
              title="Next Page (Right Arrow)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Rendered Image */}
          {imgSrc ? (
            <div 
              className="transition-transform duration-100 ease-out origin-center max-w-full max-h-full flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={imgSrc}
                alt={`Page ${page.pageNumber}`}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl bg-white"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Rendering image preview...</div>
          )}

        </div>

        {/* Bottom Action Footer */}
        <div className="px-5 py-3.5 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="text-xs text-gray-500 font-medium">
            Format: <strong className="text-gray-900">{settings.format.toUpperCase()}</strong> • Resolution: <strong className="text-gray-900">{settings.dpi} DPI</strong> • Mode: <strong className="text-gray-900">{settings.colorMode}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCopy(page.pageNumber)}
              className="px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-500" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onDownload(page.pageNumber)}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res {settings.format.toUpperCase()}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
