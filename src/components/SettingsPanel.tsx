import React from 'react';
import { 
  Sliders, 
  Sparkles, 
  RotateCw, 
  Maximize2,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { ConversionSettings, LoadedPdf, ConversionProgress } from '../types';

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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      
      {/* Header with Title & Quick Info */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Conversion Controls</h3>
            <p className="text-xs text-gray-400 font-medium">Configure resolution, format, and color adjustments</p>
          </div>
        </div>

        {/* Live Resolution Badge */}
        <div className="text-right">
          <div className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 inline-flex items-center gap-1.5">
            <Maximize2 className="w-3 h-3 text-indigo-600" />
            <span>{widthPx} × {heightPx} px</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
            {megapixels} MP / page ({widthInches.toFixed(1)}" × {heightInches.toFixed(1)}" print)
          </p>
        </div>
      </div>

      {/* Grid of Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. Format Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
            1. Output Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="format-png-btn"
              type="button"
              onClick={() => onChangeSettings({ format: 'png' })}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                settings.format === 'png'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">PNG</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  Lossless
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-tight">
                Sharp text, vectors, transparency
              </p>
            </button>

            <button
              id="format-jpg-btn"
              type="button"
              onClick={() => onChangeSettings({ format: 'jpeg' })}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                settings.format === 'jpeg'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">JPG</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  Compact
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-tight">
                Photo & scanned doc optimized
              </p>
            </button>
          </div>

          {/* JPEG Quality Slider */}
          {settings.format === 'jpeg' && (
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500 font-medium">Quality Level</span>
                <span className="font-bold text-indigo-600">{Math.round(settings.jpegQuality * 100)}%</span>
              </div>
              <input
                id="jpeg-quality-slider"
                type="range"
                min="0.5"
                max="1.0"
                step="0.02"
                value={settings.jpegQuality}
                onChange={(e) => onChangeSettings({ jpegQuality: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
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
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              2. Resolution
            </label>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {settings.dpi} DPI
            </span>
          </div>

          {/* DPI Preset Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id="dpi-150-btn"
              type="button"
              onClick={() => handleDpiSelect(150)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                settings.dpi === 150
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
              }`}
            >
              <div className="font-bold text-gray-900">150 DPI</div>
              <span className="text-[10px] text-gray-400">Web & Email</span>
            </button>

            <button
              id="dpi-300-btn"
              type="button"
              onClick={() => handleDpiSelect(300)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all relative cursor-pointer ${
                settings.dpi === 300
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-1 ring-indigo-500'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">300 DPI</span>
                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">Print</span>
              </div>
              <span className="text-[10px] text-gray-400">Standard Quality</span>
            </button>

            <button
              id="dpi-600-btn"
              type="button"
              onClick={() => handleDpiSelect(600)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all relative cursor-pointer ${
                settings.dpi === 600
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-1 ring-indigo-500'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">600 DPI</span>
                <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1 rounded">Ultra</span>
              </div>
              <span className="text-[10px] text-gray-400">Archival Precision</span>
            </button>

            <button
              id="dpi-72-btn"
              type="button"
              onClick={() => handleDpiSelect(72)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                settings.dpi === 72
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
              }`}
            >
              <div className="font-bold text-gray-900">72 DPI</div>
              <span className="text-[10px] text-gray-400">Screen Standard</span>
            </button>
          </div>

          {/* Custom DPI Slider */}
          <div className="pt-1">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
              <span>Fine Adjust</span>
              <span className="font-mono text-gray-700 font-bold">
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
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold">
              <span>72</span>
              <span>150</span>
              <span>300</span>
              <span>600</span>
            </div>
          </div>
        </div>

        {/* 3. Color Mode, Background & Rotation */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
            3. Enhancements
          </label>

          {/* Color Mode Selector */}
          <div>
            <span className="block text-xs text-gray-500 font-medium mb-1.5">Color Enhancement</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                id="color-mode-full"
                type="button"
                onClick={() => onChangeSettings({ colorMode: 'color' })}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                  settings.colorMode === 'color'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Original Color
              </button>
              <button
                id="color-mode-grayscale"
                type="button"
                onClick={() => onChangeSettings({ colorMode: 'grayscale' })}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                  settings.colorMode === 'grayscale'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Grayscale
              </button>
              <button
                id="color-mode-contrast"
                type="button"
                onClick={() => onChangeSettings({ colorMode: 'high-contrast' })}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                  settings.colorMode === 'high-contrast'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
                title="Deepens black text and clears paper noise"
              >
                Clean Document
              </button>
              <button
                id="color-mode-monochrome"
                type="button"
                onClick={() => onChangeSettings({ colorMode: 'monochrome' })}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                  settings.colorMode === 'monochrome'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
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
              <span className="block text-xs text-gray-500 font-medium mb-1">Canvas BG</span>
              <select
                id="bg-color-select"
                value={settings.backgroundColor}
                onChange={(e) => onChangeSettings({ backgroundColor: e.target.value })}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="#ffffff">Pure White</option>
                {settings.format === 'png' && <option value="transparent">Transparent</option>}
                <option value="#f8fafc">Off-White</option>
                <option value="#1e293b">Dark Slate</option>
              </select>
            </div>

            {/* Global Rotation */}
            <div>
              <span className="block text-xs text-gray-500 font-medium mb-1">Rotate All</span>
              <button
                id="global-rotate-btn"
                type="button"
                onClick={() => onChangeSettings({ rotationOffset: (settings.rotationOffset + 90) % 360 })}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
        <div id="conversion-progress-card" className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-indigo-950">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>
                Converting Pages {currentProgress} of {totalProgress}
                {conversionProgress?.currentPageNumber ? ` (Page ${conversionProgress.currentPageNumber})` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-200/60 shadow-2xs">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-white/80 rounded-full h-2.5 overflow-hidden border border-indigo-200/50 p-0.5 shadow-2xs">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-indigo-700/80 font-medium">
            <span>Rendering at {settings.dpi} DPI • {settings.format.toUpperCase()}</span>
            <span>{totalProgress - currentProgress > 0 ? `${totalProgress - currentProgress} page${totalProgress - currentProgress === 1 ? '' : 's'} remaining` : 'Finalizing...'}</span>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            Target output: <strong className="text-gray-900 font-bold">{settings.format.toUpperCase()}</strong> @ <strong className="text-gray-900 font-bold">{settings.dpi} DPI</strong> ({widthPx}×{heightPx} px)
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="apply-convert-all-btn"
            type="button"
            onClick={onApplyConversion}
            disabled={isConverting || selectedCount === 0}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
