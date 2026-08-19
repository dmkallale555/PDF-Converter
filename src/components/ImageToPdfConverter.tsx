import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  RotateCw, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  FileCheck, 
  AlertCircle,
  Settings2,
  Layers,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImageItem, ImageToPdfSettings, PageSize, PageOrientation, PageMargin, ImageScaling, PdfQuality } from '../types';
import { convertImagesToPdf } from '../utils/imageToPdf';
import { downloadFile } from '../utils/pdfRenderer';

interface ImageToPdfConverterProps {
  onConversionComplete: (record: {
    originalFilename: string;
    inputFormat: string;
    outputFormat: string;
    inputSize: number;
    outputSize: number;
    pageCount: number;
    downloadUrl: string;
    downloadFilename: string;
  }) => void;
}

const DEFAULT_SETTINGS: ImageToPdfSettings = {
  pageSize: 'A4',
  orientation: 'auto',
  scaling: 'fit',
  margin: 'small',
  quality: 'high',
  outputFilename: 'ConvertPro_Compiled_Images.pdf',
};

export const ImageToPdfConverter: React.FC<ImageToPdfConverterProps> = ({ onConversionComplete }) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<ImageToPdfSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<{ current: number; total: number; message: string } | null>(null);
  const [generatedPdf, setGeneratedPdf] = useState<{ blob: Blob; url: string; filename: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const newItems: ImageItem[] = [];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/svg+xml', 'image/gif', 'image/tiff'];

    Array.from(files).forEach((file) => {
      // Basic check
      const previewUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            file,
            name: file.name,
            size: file.size,
            type: file.type || 'image/jpeg',
            previewUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            rotation: 0,
          },
        ]);
      };
      img.src = previewUrl;
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (generatedPdf) setGeneratedPdf(null);
  };

  const handleRotateImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img))
    );
    if (generatedPdf) setGeneratedPdf(null);
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;

    const list = [...images];
    const item = list.splice(index, 1)[0];
    list.splice(newIdx, 0, item);
    setImages(list);
    if (generatedPdf) setGeneratedPdf(null);
  };

  const handleClearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setGeneratedPdf(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setError('Please add at least one image.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgressStatus({ current: 0, total: images.length, message: 'Initializing PDF builder...' });

    try {
      const result = await convertImagesToPdf(images, settings, (curr, tot, msg) => {
        setProgressStatus({ current: curr, total: tot, message: msg });
      });

      const url = URL.createObjectURL(result.blob);
      setGeneratedPdf({
        blob: result.blob,
        url,
        filename: result.filename,
        size: result.size,
      });

      const totalInputSize = images.reduce((acc, img) => acc + img.size, 0);

      onConversionComplete({
        originalFilename: images[0]?.name + (images.length > 1 ? ` (+${images.length - 1} images)` : ''),
        inputFormat: 'images',
        outputFormat: 'pdf',
        inputSize: totalInputSize,
        outputSize: result.size,
        pageCount: images.length,
        downloadUrl: url,
        downloadFilename: result.filename,
      });

      // Confetti feedback
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#4f46e5', '#38bdf8', '#10b981'],
      });
    } catch (err: any) {
      console.error('Image to PDF conversion error:', err);
      setError(err.message || 'Failed to convert images to PDF.');
    } finally {
      setIsProcessing(false);
      setProgressStatus(null);
    }
  };

  const handleDownloadPdf = () => {
    if (!generatedPdf) return;
    downloadFile(generatedPdf.blob, generatedPdf.filename);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Upload Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors shadow-xs"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/jpg, image/webp, image/bmp, image/svg+xml, image/gif, image/tiff"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-xs">
          <Upload className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">
          Upload Images to Convert to PDF
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 max-w-md mx-auto">
          Drag & drop your JPG, PNG, WEBP, BMP, SVG, TIFF images here, or browse from your computer. Select multiple files to merge them into a single multi-page PDF.
        </p>

        <button
          type="button"
          id="browse-images-btn"
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Browse Image Files</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace when images are loaded */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Reorderable Image Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
              <div>
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Images Queue ({images.length} pages in PDF)</span>
                </h4>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Reorder pages, rotate images, or remove items before generating the PDF.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 transition-colors"
                >
                  + Add More
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Image cards list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 flex flex-col justify-between shadow-2xs group hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
                >
                  {/* Card Header with Page Number */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-[10px] font-bold">
                      Page {index + 1}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate max-w-[100px]" title={item.name}>
                      {(item.size / 1024).toFixed(0)} KB
                    </span>
                  </div>

                  {/* Thumbnail Image Container */}
                  <div className="w-full h-36 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden relative border border-gray-100 dark:border-gray-800">
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      style={{ transform: `rotate(${item.rotation}deg)` }}
                      className="max-h-full max-w-full object-contain transition-transform duration-200"
                    />
                  </div>

                  <div className="mt-2 truncate text-[11px] font-medium text-gray-700 dark:text-gray-300" title={item.name}>
                    {item.name}
                  </div>

                  {/* Actions: Reorder, Rotate, Delete */}
                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveImage(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 disabled:opacity-30"
                        title="Move Page Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveImage(index, 'down')}
                        disabled={index === images.length - 1}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 disabled:opacity-30"
                        title="Move Page Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRotateImage(item.id)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-indigo-600"
                        title="Rotate 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveImage(item.id)}
                        className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-600"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: PDF Sizing & Layout Controls */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                <Settings2 className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  PDF Page & Layout Settings
                </h4>
              </div>

              {/* Page Size */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Page Size
                </label>
                <select
                  value={settings.pageSize}
                  onChange={(e) => setSettings({ ...settings, pageSize: e.target.value as PageSize })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">US Letter (8.5 × 11 in)</option>
                  <option value="Legal">US Legal (8.5 × 14 in)</option>
                  <option value="A3">A3 (297 × 420 mm)</option>
                  <option value="A5">A5 (148 × 210 mm)</option>
                  <option value="FitImage">Fit to Image Size (Custom)</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Page Orientation
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl text-xs font-bold">
                  {(['auto', 'portrait', 'landscape'] as PageOrientation[]).map((ori) => (
                    <button
                      key={ori}
                      type="button"
                      onClick={() => setSettings({ ...settings, orientation: ori })}
                      className={`py-1.5 rounded-lg capitalize transition-all ${
                        settings.orientation === ori
                          ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {ori}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Scaling */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Image Fit / Scaling
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl text-xs font-bold">
                  {(['fit', 'fill', 'original'] as ImageScaling[]).map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setSettings({ ...settings, scaling: scale })}
                      className={`py-1.5 rounded-lg capitalize transition-all ${
                        settings.scaling === scale
                          ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {scale === 'fit' ? 'Fit Page' : scale === 'fill' ? 'Fill Page' : 'Original'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Page Margin
                </label>
                <div className="grid grid-cols-4 gap-1.5 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl text-xs font-bold">
                  {(['none', 'small', 'normal', 'large'] as PageMargin[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSettings({ ...settings, margin: m })}
                      className={`py-1.5 rounded-lg capitalize transition-all ${
                        settings.margin === m
                          ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* PDF Quality */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  PDF Quality / Compression
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl text-xs font-bold">
                  {(['standard', 'high', 'maximum'] as PdfQuality[]).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSettings({ ...settings, quality: q })}
                      className={`py-1.5 rounded-lg capitalize transition-all ${
                        settings.quality === q
                          ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filename */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Output Filename
                </label>
                <input
                  type="text"
                  value={settings.outputFilename}
                  onChange={(e) => setSettings({ ...settings, outputFilename: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Progress Indicator */}
              {isProcessing && progressStatus && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-100 dark:border-indigo-900 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <span>Compiling PDF...</span>
                    <span>{Math.round((progressStatus.current / (progressStatus.total || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-200/60 dark:bg-indigo-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${(progressStatus.current / (progressStatus.total || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-300 truncate">
                    {progressStatus.message}
                  </div>
                </div>
              )}

              {/* Convert Button */}
              <button
                type="button"
                id="generate-pdf-btn"
                onClick={handleConvert}
                disabled={isProcessing || images.length === 0}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Generating PDF...' : `Convert ${images.length} Images to PDF`}</span>
              </button>

              {/* Download Result Card */}
              {generatedPdf && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>PDF Document Ready!</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    {generatedPdf.filename} • {(generatedPdf.size / 1024).toFixed(1)} KB
                  </div>
                  <button
                    type="button"
                    id="download-generated-pdf-btn"
                    onClick={handleDownloadPdf}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Document</span>
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
