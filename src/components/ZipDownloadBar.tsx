import React from 'react';
import { 
  Archive, 
  Loader2, 
  FileArchive
} from 'lucide-react';
import { ConversionSettings } from '../types';

interface ZipDownloadBarProps {
  selectedCount: number;
  totalCount: number;
  settings: ConversionSettings;
  onDownloadZip: () => void;
  isZipping: boolean;
  zipProgress: { current: number; total: number } | null;
}

export const ZipDownloadBar: React.FC<ZipDownloadBarProps> = ({
  selectedCount,
  totalCount,
  settings,
  onDownloadZip,
  isZipping,
  zipProgress
}) => {
  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg py-3.5 px-4 sm:px-8 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left Status Info */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                {selectedCount} {selectedCount === 1 ? 'Page' : 'Pages'} Selected
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                {settings.format.toUpperCase()} • {settings.dpi} DPI
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              Instant ZIP archive with all pages rendered at full resolution
            </p>
          </div>
        </div>

        {/* Right Download Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isZipping && zipProgress && (
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Building ZIP: Page {zipProgress.current} of {zipProgress.total}...</span>
            </div>
          )}

          <button
            id="download-zip-btn"
            type="button"
            onClick={onDownloadZip}
            disabled={isZipping || selectedCount === 0}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isZipping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Images ({zipProgress ? `${zipProgress.current}/${zipProgress.total}` : 'Packaging...'})</span>
              </>
            ) : (
              <>
                <FileArchive className="w-4 h-4" />
                <span>Download All as ZIP ({selectedCount})</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
