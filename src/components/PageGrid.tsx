import React from 'react';
import { 
  Check, 
  Download, 
  Copy, 
  RotateCw, 
  Maximize2, 
  FileText, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { PageInfo, ConversionSettings } from '../types';
import { formatBytes } from '../utils/pdfRenderer';

interface PageGridProps {
  pages: PageInfo[];
  settings: ConversionSettings;
  onTogglePage: (pageNumber: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectFilter: (filter: 'all' | 'odd' | 'even' | 'first') => void;
  onRotatePage: (pageNumber: number) => void;
  onDownloadPage: (pageNumber: number) => void;
  onCopyPage: (pageNumber: number) => void;
  onInspectPage: (pageNumber: number) => void;
  copiedPage: number | null;
}

export const PageGrid: React.FC<PageGridProps> = ({
  pages,
  settings,
  onTogglePage,
  onSelectAll,
  onDeselectAll,
  onSelectFilter,
  onRotatePage,
  onDownloadPage,
  onCopyPage,
  onInspectPage,
  copiedPage
}) => {
  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        
        {/* Left: Selection Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900">
            {selectedCount} of {pages.length} Pages Selected
          </span>
          <span className="text-xs text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-medium">
            Format: <span className="font-bold text-gray-900">{settings.format.toUpperCase()}</span> ({settings.dpi} DPI)
          </span>
        </div>

        {/* Right: Quick Selection Presets */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs">
          <span className="text-gray-400 font-bold mr-1 text-[11px] uppercase tracking-wider">Select:</span>
          <button
            id="select-all-btn"
            type="button"
            onClick={onSelectAll}
            className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold transition-all cursor-pointer"
          >
            All
          </button>
          <button
            id="select-none-btn"
            type="button"
            onClick={onDeselectAll}
            className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold transition-all cursor-pointer"
          >
            None
          </button>
          <button
            id="select-odd-btn"
            type="button"
            onClick={() => onSelectFilter('odd')}
            className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold transition-all cursor-pointer"
          >
            Odd
          </button>
          <button
            id="select-even-btn"
            type="button"
            onClick={() => onSelectFilter('even')}
            className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold transition-all cursor-pointer"
          >
            Even
          </button>
          <button
            id="select-first-btn"
            type="button"
            onClick={() => onSelectFilter('first')}
            className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold transition-all cursor-pointer"
          >
            1st Page
          </button>
        </div>

      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {pages.map((page) => {
          const isRendered = !!page.renderedUrl;
          const displayImg = page.renderedUrl || page.thumbnailUrl;

          return (
            <div
              key={page.pageNumber}
              id={`page-card-${page.pageNumber}`}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden group shadow-xs ${
                page.selected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-gray-200 opacity-60 hover:opacity-100'
              }`}
            >
              {/* Card Header */}
              <div className="p-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={page.selected}
                    onChange={() => onTogglePage(page.pageNumber)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer accent-indigo-600"
                  />
                  <span className="font-bold text-xs text-gray-900">
                    Page {page.pageNumber}
                  </span>
                </label>

                {/* Individual Rotate */}
                <button
                  type="button"
                  onClick={() => onRotatePage(page.pageNumber)}
                  title="Rotate 90° Clockwise"
                  className="p-1 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-200/60 transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Thumbnail / Image Container */}
              <div 
                className="relative aspect-[3/4] bg-gray-50 flex items-center justify-center p-3 cursor-pointer overflow-hidden"
                onClick={() => onInspectPage(page.pageNumber)}
              >
                {displayImg ? (
                  <img
                    src={displayImg}
                    alt={`Page ${page.pageNumber}`}
                    className="max-h-full max-w-full object-contain rounded shadow-2xs transition-transform duration-200 group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-1">
                    <FileText className="w-8 h-8 stroke-1" />
                    <span className="text-[10px] font-medium">Loading page...</span>
                  </div>
                )}

                {/* Render Status Badge */}
                {page.isRendering && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    <span className="text-xs font-bold text-indigo-900">Rendering {settings.dpi} DPI...</span>
                  </div>
                )}

                {isRendered && !page.isRendering && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{settings.dpi} DPI</span>
                  </div>
                )}

                {/* Hover Inspect Overlay */}
                <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="px-3 py-1 rounded-xl bg-gray-900 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                    <Maximize2 className="w-3 h-3" />
                    Inspect
                  </span>
                </div>
              </div>

              {/* Dimensions and Metadata Bar */}
              <div className="px-3 py-2 bg-gray-50/50 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
                <span className="font-mono font-medium">
                  {page.renderedWidth && page.renderedHeight
                    ? `${page.renderedWidth} × ${page.renderedHeight} px`
                    : `${Math.round(page.widthPt * (settings.dpi / 72))} × ${Math.round(page.heightPt * (settings.dpi / 72))} px`}
                </span>
                <span className="font-bold text-gray-700">
                  {page.renderedSize ? formatBytes(page.renderedSize) : `${settings.format.toUpperCase()}`}
                </span>
              </div>

              {/* Card Actions Footer */}
              <div className="p-2.5 border-t border-gray-100 grid grid-cols-2 gap-2 bg-white">
                <button
                  type="button"
                  id={`download-page-btn-${page.pageNumber}`}
                  onClick={() => onDownloadPage(page.pageNumber)}
                  className="px-2.5 py-1.5 rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 text-xs font-bold border border-gray-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Download this page image"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  id={`copy-page-btn-${page.pageNumber}`}
                  onClick={() => onCopyPage(page.pageNumber)}
                  className="px-2.5 py-1.5 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 text-xs font-bold border border-gray-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copy image to clipboard"
                >
                  {copiedPage === page.pageNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
