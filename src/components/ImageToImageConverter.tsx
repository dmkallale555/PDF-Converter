import React, { useState, useRef } from 'react';
import { 
  Upload, 
  ArrowRightLeft, 
  Download, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon,
  Archive,
  Plus
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { ImageFormat } from '../types';
import { convertSingleImage } from '../utils/imageToImage';
import { downloadFile } from '../utils/pdfRenderer';

interface ImageToImageConverterProps {
  initialTargetFormat?: ImageFormat;
  onConversionComplete: (record: {
    originalFilename: string;
    inputFormat: string;
    outputFormat: string;
    inputSize: number;
    outputSize: number;
    pageCount?: number;
    downloadUrl: string;
    downloadFilename: string;
  }) => void;
}

interface ImageConvertItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedFilename?: string;
  convertedSize?: number;
  error?: string;
}

export const ImageToImageConverter: React.FC<ImageToImageConverterProps> = ({
  initialTargetFormat = 'png',
  onConversionComplete,
}) => {
  const [items, setItems] = useState<ImageConvertItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>(initialTargetFormat);
  const [quality, setQuality] = useState<number>(0.92);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const newItems: ImageConvertItem[] = Array.from(files).map((file) => ({
      id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));

    setItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach((i) => {
      URL.revokeObjectURL(i.previewUrl);
      if (i.convertedUrl) URL.revokeObjectURL(i.convertedUrl);
    });
    setItems([]);
    setError(null);
  };

  const handleConvertAll = async () => {
    if (items.length === 0) {
      setError('Please add at least one image to convert.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    let totalInput = 0;
    let totalOutput = 0;
    const completedList: ImageConvertItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'processing' } : it))
      );

      try {
        const res = await convertSingleImage(item.file, item.name, {
          targetFormat,
          quality,
          backgroundColor,
        });

        totalInput += item.size;
        totalOutput += res.blob.size;

        const updatedItem: ImageConvertItem = {
          ...item,
          status: 'completed',
          convertedBlob: res.blob,
          convertedUrl: res.dataUrl,
          convertedFilename: res.filename,
          convertedSize: res.blob.size,
        };

        completedList.push(updatedItem);

        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? updatedItem : it))
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'error', error: err.message } : it
          )
        );
      }
    }

    setIsProcessing(false);

    if (completedList.length > 0) {
      onConversionComplete({
        originalFilename: completedList[0].name + (completedList.length > 1 ? ` (+${completedList.length - 1} images)` : ''),
        inputFormat: 'image',
        outputFormat: targetFormat,
        inputSize: totalInput,
        outputSize: totalOutput,
        pageCount: completedList.length,
        downloadUrl: completedList[0].convertedUrl || '',
        downloadFilename: completedList[0].convertedFilename || `converted.${targetFormat}`,
      });

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#4f46e5', '#38bdf8', '#10b981'],
      });
    }
  };

  const handleDownloadSingle = (item: ImageConvertItem) => {
    if (!item.convertedBlob || !item.convertedFilename) return;
    downloadFile(item.convertedBlob, item.convertedFilename);
  };

  const handleDownloadZipAll = async () => {
    const readyItems = items.filter((i) => i.status === 'completed' && i.convertedBlob);
    if (readyItems.length === 0) return;

    const zip = new JSZip();
    readyItems.forEach((it) => {
      if (it.convertedBlob && it.convertedFilename) {
        zip.file(it.convertedFilename, it.convertedBlob);
      }
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, `ConvertPro_Batch_${targetFormat.toUpperCase()}.zip`);
  };

  const completedCount = items.filter((i) => i.status === 'completed').length;

  return (
    <div className="space-y-6">
      
      {/* Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleFilesSelected(e.dataTransfer.files);
        }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 text-center hover:border-indigo-500 transition-colors shadow-xs"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-xs">
          <ArrowRightLeft className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">
          Convert Between Any Image Formats
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 max-w-md mx-auto">
          Convert JPG, JPEG, PNG, WEBP, BMP, SVG, TIFF, and GIF instantly with custom compression quality, color adjustments, and bulk ZIP download.
        </p>

        <button
          type="button"
          id="browse-img2img-btn"
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

      {/* Main Workspace */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Image Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
              <div>
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Images to Convert ({items.length} files)
                </h4>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Target format: <span className="font-bold uppercase text-indigo-600 dark:text-indigo-400">{targetFormat}</span>
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

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 flex flex-col justify-between shadow-2xs"
                >
                  <div className="w-full h-32 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden relative border border-gray-100 dark:border-gray-800">
                    <img
                      src={item.convertedUrl || item.previewUrl}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                    {item.status === 'completed' && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                        Converted
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5">
                      <span>{(item.size / 1024).toFixed(1)} KB</span>
                      {item.convertedSize && (
                        <span className="font-bold text-emerald-600">
                          → {(item.convertedSize / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                    {item.status === 'completed' ? (
                      <button
                        onClick={() => handleDownloadSingle(item)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] flex items-center gap-1 hover:bg-indigo-100"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400">
                        {item.status === 'processing' ? 'Converting...' : 'Pending'}
                      </span>
                    )}

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-600"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
                Target Format & Settings
              </h4>

              {/* Target Format Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Convert Output To
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['png', 'jpg', 'webp', 'bmp', 'tiff', 'svg'] as ImageFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTargetFormat(fmt)}
                      className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                        targetFormat === fmt
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider for lossy formats */}
              {(targetFormat === 'jpg' || targetFormat === 'jpeg' || targetFormat === 'webp') && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    <span>Compression Quality</span>
                    <span className="text-indigo-600">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              )}

              {/* Background Color */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Background Fill
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setBackgroundColor('#ffffff')}
                    className={`py-2 rounded-xl border transition-all ${
                      backgroundColor === '#ffffff'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600'
                    }`}
                  >
                    White Background
                  </button>
                  <button
                    type="button"
                    onClick={() => setBackgroundColor('transparent')}
                    className={`py-2 rounded-xl border transition-all ${
                      backgroundColor === 'transparent'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600'
                    }`}
                  >
                    Transparent (PNG)
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                id="convert-all-images-btn"
                onClick={handleConvertAll}
                disabled={isProcessing || items.length === 0}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Converting...' : `Convert All to ${targetFormat.toUpperCase()}`}</span>
              </button>

              {/* Bulk ZIP download button */}
              {completedCount > 1 && (
                <button
                  type="button"
                  id="download-images-zip-btn"
                  onClick={handleDownloadZipAll}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Archive className="w-4 h-4" />
                  <span>Download All as ZIP ({completedCount} files)</span>
                </button>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
