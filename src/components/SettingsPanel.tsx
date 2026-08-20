import React from 'react';
import { 
  Sliders, 
  Sparkles, 
  RotateCw, 
  Maximize2, 
  Loader2, 
  CheckCircle2,
  FileText,
  Printer,
  Grid,
  Zap
} from 'lucide-react';
import { ConversionSettings, LoadedPdf, ConversionProgress, ImageFormat } from '../types';

interface SettingsPanelProps {
  settings: ConversionSettings;
  onChangeSettings: (newSettings: Partial<ConversionSettings>) => void;
  loadedPdf: LoadedPdf;
  onApplyConversion: () => void;
  isConverting: boolean;
  conversionProgress?: ConversionProgress | null;
  selectedCount: number;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChangeSettings,
  loadedPdf,
  onApplyConversion,
  isConverting,
  conversionProgress,
  selectedCount
}) => {
  // Estimate pixel dimensions for page 1
  const firstPage = loadedPdf.pages[0] || { widthPt: 595, heightPt: 842, userRotation: 0 };
  const targetScale = settings.dpi / 72;
  const isRotated = ((firstPage.originalRotation || 0) + settings.rotationOffset + (firstPage.userRotation || 0)) % 180 !== 0;
  
  const widthPx = Math.round((isRotated ? firstPage.heightPt : firstPage.widthPt) * targetScale);
  const heightPx = Math.round((isRotated ? firstPage.widthPt : firstPage.heightPt) * targetScale);
  const megapixels = ((widthPx * heightPx) / 1000000).toFixed(1);

  // Estimate physical print size in inches at current DPI (widthPt / 72)
  const widthInches = (isRotated ? firstPage.heightPt : firstPage.widthPt) / 72;
  const heightInches = (isRotated ? firstPage.widthPt : firstPage.heightPt) / 72;

  const handleDpiSelect = (dpi: number) => {
    onChangeSettings({
      dpi,
      scale: dpi / 72
    });
  };

  const handleCustomDpiChange = (val: number) => {
    const clamped = Math.max(36, Math.min(1200, val));
    onChangeSettings({
      dpi: clamped,
      scale: clamped / 72
    });
  };

  const currentProgress = conversionProgress?.current ?? 0;
  const totalProgress = conversionProgress?.total ?? (selectedCount > 0 ? selectedCount : 1);
  const progressPercent = Math.min(100, Math.round((currentProgress / totalProgress) * 100));

  const formatOptions: { id: ImageFormat; label: string; badge: string; desc: string }[] = [
    { id: 'jpeg', label: 'JPG', badge: 'Compact', desc: 'Photos & scans' },
    { id: 'png', label: 'PNG', badge: 'Lossless', desc: 'Vectors & transparency' },
    { id: 'webp', label: 'WEBP', badge: 'Web', desc: 'High compression' },
    { id: 'tiff', label: 'TIFF', badge: 'Print', desc: 'Archival quality' },
    { id: 'bmp', label: 'BMP', badge: 'Bitmap', desc: 'Standard raster' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xs p-6 space-y-6 transition-colors">
      
      {/* Header with Title & Quick Info */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Conversion Controls</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Configure format, DPI resolution, and color modes</p>
          </div>
        </div>

        {/* Live Resolution Badge */}
        <div className="text-right">
          <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-100 dark:border-indigo-800/80 inline-flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{widthPx} × {heightPx} px</span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
            {megapixels} MP / page ({widthInches.toFixed(1)}" × {heightInches.toFixed(1)}" print)
          </p>
        </div>
      </div>

      {/* Grid of Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. Format Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            1. Output Format
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {formatOptions.map((fmt) => {
              const isSelected = settings.format === fmt.id;
              return (
                <button
                  key={fmt.id}
                  id={`format-${fmt.id}-btn`}
                  type="button"
                  onClick={() => onChangeSettings({ format: fmt.id })}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/80 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">{fmt.label}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {fmt.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight truncate">
                    {fmt.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* JPEG Quality Slider */}
          {settings.format === 'jpeg' && (
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Quality Level</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{Math.round(settings.jpegQuality * 100)}%</span>
              </div>
              <input
                id="jpeg-quality-slider"
                type="range"
                min="0.5"
                max="1.0"
                step="0.02"
                value={settings.jpegQuality}
                onChange={(e) => onChangeSettings({ jpegQuality: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
                <span>Standard (70%)</span>
                <span>High (90%)</span>
                <span>Max (100%)</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Resolution & DPI Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              2. Resolution
            </label>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
              {settings.dpi} DPI
            </span>
          </div>

          {/* DPI Preset Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id="dpi-150-btn"
              type="button"
              onClick={() => handleDpiSelect(150)}
              className={`p-2.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                settings.dpi === 150
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="font-bold text-gray-900 dark:text-white">150 DPI</div>
              <span className="text-[10px] text-gray-400">Web & Email</span>
            </button>

            <button
              id="dpi-300-btn"
              type="button"
              onClick={() => handleDpiSelect(300)}
              className={`p-2.5 rounded-2xl border text-left text-xs transition-all relative cursor-pointer ${
                settings.dpi === 300
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold ring-1 ring-indigo-500'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white">300 DPI</span>
                <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-1 rounded">Print</span>
              </div>
              <span className="text-[10px] text-gray-400">Standard Quality</span>
            </button>

            <button
              id="dpi-600-btn"
              type="button"
              onClick={() => handleDpiSelect(600)}
              className={`p-2.5 rounded-2xl border text-left text-xs transition-all relative cursor-pointer ${
                settings.dpi === 600
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold ring-1 ring-indigo-500'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white">600 DPI</span>
                <span className="text-[9px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold px-1 rounded">Ultra</span>
              </div>
              <span className="text-[10px] text-gray-400">Archival Precision</span>
            </button>

            <button
              id="dpi-72-btn"
              type="button"
              onClick={() => handleDpiSelect(72)}
              className={`p-2.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                settings.dpi === 72
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="font-bold text-gray-900 dark:text-white">72 DPI</div>
              <span className="text-[10px] text-gray-400">Screen Standard</span>
            </button>
          </div>

          {/* Custom DPI Slider */}
          <div className="pt-1">
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium">
              <span>Fine Adjust</span>
              <span className="font-mono text-gray-700 dark:text-gray-300 font-bold">
                {settings.dpi} DPI ({targetScale.toFixed(2)}x)
              </span>
            </div>
            <input
              id="dpi-custom-slider"
              type="range"
              min="72"
              max="600"
              step="1"
              value={settings.dpi}
              onChange={(e) => handleCustomDpiChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between mt-2 text-[10px] text-gray-400 dark:text-gray-500 font-bold">
              <span>72</span>
              <span>150</span>
              <span>300</span>
              <span>600</span>
            </div>
          </div>
        </div>

        {/* 3. Color Mode, Background & Rotation */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            3. Enhancements
          </label>

          {/* Color Mode Selector */}
          <div>
            <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5">Color Enhancement</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                id="color-mode-full"
                type="button"
                onClick={() => onChangeSettings({ colorMode: 'color' })}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  settings.colorMode === 'color'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                }`}
              >
                Original Color
              </button>
              <button
                id="color-mode-grayscale"
                type="button"
                onClick={() => onChangeSettings({ colorMode: 'grayscale' })}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  settings.colorMode === 'grayscale'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                }`}
              >
                Grayscale
              </button>
              <button
                id="color-mode-contrast"
                type="button"
                onClick={() => onChangeSettings({ colorMode: 'high-contrast' })}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  settings.colorMode === 'high-contrast'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                }`}
                title="Deepens black text and clears paper noise"
              >
                Clean Document
              </button>
              <button
                id="color-mode-monochrome"
                type="button"
                onClick={() => onChangeSettings({ colorMode: 'monochrome' })}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  settings.colorMode === 'monochrome'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                }`}
                title="Pure 1-bit Black & White"
              >
                Pure B&W
              </button>
            </div>
          </div>

          {/* Background & Rotation row */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Background */}
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Canvas BG</span>
              <select
                id="bg-color-select"
                value={settings.backgroundColor}
                onChange={(e) => onChangeSettings({ backgroundColor: e.target.value })}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="#ffffff">Pure White</option>
                {settings.format === 'png' && <option value="transparent">Transparent</option>}
                <option value="#f8fafc">Off-White</option>
                <option value="#1e293b">Dark Slate</option>
              </select>
            </div>

            {/* Global Rotation */}
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Rotate All</span>
              <button
                id="global-rotate-btn"
                type="button"
                onClick={() => onChangeSettings({ rotationOffset: (settings.rotationOffset + 90) % 360 })}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-gray-400" />
                <span>{settings.rotationOffset}°</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Conversion Progress Bar Banner (Shown when bulk converting) */}
      {isConverting && (
        <div id="conversion-progress-card" className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-indigo-950 dark:text-indigo-200">
              <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <span>
                Converting Pages {currentProgress} of {totalProgress}
                {conversionProgress?.currentPageNumber ? ` (Page ${conversionProgress.currentPageNumber})` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-700 shadow-2xs">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-white/80 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden border border-indigo-200/50 dark:border-indigo-700 p-0.5 shadow-2xs">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-indigo-700/80 dark:text-indigo-300 font-medium">
            <span>Rendering at {settings.dpi} DPI • {settings.format.toUpperCase()}</span>
            <span>{totalProgress - currentProgress > 0 ? `${totalProgress - currentProgress} page${totalProgress - currentProgress === 1 ? '' : 's'} remaining` : 'Finalizing...'}</span>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>
            Target output: <strong className="text-gray-900 dark:text-white font-bold">{settings.format.toUpperCase()}</strong> @ <strong className="text-gray-900 dark:text-white font-bold">{settings.dpi} DPI</strong> ({widthPx}×{heightPx} px)
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="apply-convert-all-btn"
            type="button"
            onClick={onApplyConversion}
            disabled={isConverting || selectedCount === 0}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 text-white animate-spin" />
                <span>Converting... {progressPercent}%</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>{`Render ${selectedCount} Page${selectedCount === 1 ? '' : 's'} at ${settings.dpi} DPI`}</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
