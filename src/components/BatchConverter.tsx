import React, { useState, useRef } from 'react';
import { 
  Layers, 
  Upload, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Archive, 
  FileText, 
  Image as ImageIcon,
  Play,
  Plus
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { BatchFileItem, ImageFormat, ConversionSettings } from '../types';
import { loadPdfDocument, extractPagesInfo, renderPageToImage, downloadFile } from '../utils/pdfRenderer';
import { convertSingleImage } from '../utils/imageToImage';

interface BatchConverterProps {
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

export const BatchConverter: React.FC<BatchConverterProps> = ({ onConversionComplete }) => {
  const [items, setItems] = useState<BatchFileItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png');
  const [dpi, setDpi] = useState<number>(300);
  const [quality, setQuality] = useState<number>(0.92);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: BatchFileItem[] = Array.from(files).map((file) => {
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      return {
        id: 'batch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        file,
        name: file.name,
        size: file.size,
        type: isPdf ? 'pdf' : 'image',
        progress: 0,
        status: 'pending',
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
    setOverallProgress(0);
  };

  const handleProcessBatch = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    setOverallProgress(0);

    const zip = new JSZip();
    let totalInput = 0;
    let totalOutput = 0;
    let totalPagesCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      totalInput += item.size;

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'processing', progress: 10 } : it))
      );

      try {
        if (item.type === 'pdf') {
          // Process PDF
          const buffer = await item.file.arrayBuffer();
          const pdfDoc = await loadPdfDocument(buffer);
          const pagesInfo = await extractPagesInfo(pdfDoc);
          totalPagesCount += pagesInfo.length;

          const baseName = item.name.replace(/\.[^/.]+$/, '');
          const folder = zip.folder(baseName) || zip;

          for (let pIdx = 0; pIdx < pagesInfo.length; pIdx++) {
            const page = pagesInfo[pIdx];
            const renderRes = await renderPageToImage(pdfDoc, page.pageNumber, {
              format: targetFormat,
              dpi,
              scale: 1,
              jpegQuality: quality,
              colorMode: 'color',
              backgroundColor: '#ffffff',
              rotationOffset: 0,
              pageRange: '',
              namingPattern: '{name}_page_{page}',
            });

            const pageFilename = `${baseName}_page_${String(page.pageNumber).padStart(3, '0')}.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`;
            folder.file(pageFilename, renderRes.blob);
            totalOutput += renderRes.size;

            const itemPercent = Math.round(((pIdx + 1) / pagesInfo.length) * 100);
            setItems((prev) =>
              prev.map((it) => (it.id === item.id ? { ...it, progress: itemPercent } : it))
            );
          }

          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: 'completed', progress: 100 } : it
            )
          );
        } else {
          // Process Image
          const convRes = await convertSingleImage(item.file, item.name, {
            targetFormat,
            quality,
          });

          zip.file(convRes.filename, convRes.blob);
          totalOutput += convRes.blob.size;
          totalPagesCount += 1;

          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    status: 'completed',
                    progress: 100,
                    outputBlob: convRes.blob,
                    outputFilename: convRes.filename,
                  }
                : it
            )
          );
        }
      } catch (err: any) {
        console.error(`Error processing batch file ${item.name}:`, err);
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'error', errorMessage: err.message } : it
          )
        );
      }

      setOverallProgress(Math.round(((i + 1) / items.length) * 100));
    }

    setIsProcessing(false);

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipName = `ConvertPro_Batch_${targetFormat.toUpperCase()}_${dpi}DPI.zip`;
    const zipUrl = URL.createObjectURL(zipBlob);

    onConversionComplete({
      originalFilename: `Batch (${items.length} files)`,
      inputFormat: 'batch',
      outputFormat: targetFormat,
      inputSize: totalInput,
      outputSize: zipBlob.size,
      pageCount: totalPagesCount,
      downloadUrl: zipUrl,
      downloadFilename: zipName,
    });

    downloadFile(zipBlob, zipName);

    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.8 },
      colors: ['#4f46e5', '#38bdf8', '#10b981'],
    });
  };

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
          accept=".pdf, image/*"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-xs">
          <Layers className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">
          Bulk Multi-File Batch Converter
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 max-w-md mx-auto">
          Upload up to 20 PDF documents and images simultaneously. Individual real-time progress meters track each file and package everything into an organized ZIP archive.
        </p>

        <button
          type="button"
          id="browse-batch-files-btn"
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Select Multiple Files</span>
        </button>
      </div>

      {/* Batch Workspace */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: List with per-file progress */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
              <div>
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Batch Queue ({items.length} files)
                </h4>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Ready to process in parallel into high-resolution {targetFormat.toUpperCase()} images.
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

            {/* Overall progress bar if converting */}
            {isProcessing && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-100 dark:border-indigo-900 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  <span>Batch Conversion in Progress...</span>
                  <span>{overallProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-indigo-200/60 dark:bg-indigo-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Individual file cards */}
            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        {item.type === 'pdf' ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-xs sm:max-w-md">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {(item.size / 1024 / 1024).toFixed(2)} MB • {item.type.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          item.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'processing'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300'
                            : item.status === 'error'
                            ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {item.status === 'completed'
                          ? '100% Done'
                          : item.status === 'processing'
                          ? `${item.progress}%`
                          : item.status === 'error'
                          ? 'Failed'
                          : 'Queued'}
                      </span>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isProcessing}
                        className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Settings & Actions */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
                Batch Export Settings
              </h4>

              {/* Target Format */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Target Format
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
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* DPI Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Render Resolution (DPI)
                </label>
                <div className="grid grid-cols-4 gap-1.5 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl text-xs font-bold">
                  {[96, 150, 300, 600].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDpi(d)}
                      className={`py-1.5 rounded-lg transition-all ${
                        dpi === d
                          ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-gray-500'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality slider */}
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

              {/* Run Batch Action */}
              <button
                type="button"
                id="start-batch-btn"
                onClick={handleProcessBatch}
                disabled={isProcessing || items.length === 0}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Processing Batch...' : `Convert All (${items.length} Files)`}</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
