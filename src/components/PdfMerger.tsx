import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  AlertCircle, 
  Layers, 
  Eye, 
  Plus, 
  RotateCcw,
  Check,
  Zap,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MergePdfFileItem } from '../types';
import { mergePdfs, loadPdfMetadataAndThumbnail, parseMergePageRange } from '../utils/pdfMerger';
import { createSamplePdfAsync } from '../utils/samplePdfs';
import { formatFileSize, downloadFile } from '../utils/pdfRenderer';

interface PdfMergerProps {
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

export const PdfMerger: React.FC<PdfMergerProps> = ({ onConversionComplete }) => {
  const [items, setItems] = useState<MergePdfFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [outputFilename, setOutputFilename] = useState('ConvertPro_Merged_Document.pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<{ current: number; total: number; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mergedResult, setMergedResult] = useState<{
    blob: Blob;
    url: string;
    filename: string;
    size: number;
    totalPages: number;
  } | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setIsLoadingFiles(true);

    const newItems: MergePdfFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || 
                    file.type === 'application/pdf' || 
                    file.type.includes('pdf') || 
                    !file.type;
      
      if (!isPdf) {
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();
        const { pageCount, thumbnailUrl } = await loadPdfMetadataAndThumbnail(buffer);

        newItems.push({
          id: `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          data: buffer,
          name: file.name,
          size: file.size,
          pageCount: Math.max(1, pageCount),
          thumbnailUrl,
          pageRange: 'all',
          isValid: true,
        });
      } catch (err: any) {
        console.error('Failed to load PDF:', file.name, err);
        newItems.push({
          id: `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          data: await file.arrayBuffer().catch(() => new ArrayBuffer(0)),
          name: file.name,
          size: file.size,
          pageCount: 1,
          thumbnailUrl: '',
          pageRange: 'all',
          isValid: false,
          errorMessage: 'Unable to parse PDF structure or password-protected',
        });
      }
    }

    if (newItems.length === 0) {
      setError('Please select valid PDF (.pdf) documents.');
    } else {
      setItems((prev) => [...prev, ...newItems]);
    }

    setIsLoadingFiles(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSamplePdfs = async () => {
    setError(null);
    setIsLoadingFiles(true);

    try {
      const [sample1, sample2, sample3] = await Promise.all([
        createSamplePdfAsync('invoice'),
        createSamplePdfAsync('presentation'),
        createSamplePdfAsync('vector'),
      ]);

      const [meta1, meta2, meta3] = await Promise.all([
        loadPdfMetadataAndThumbnail(sample1),
        loadPdfMetadataAndThumbnail(sample2),
        loadPdfMetadataAndThumbnail(sample3),
      ]);

      const sampleItems: MergePdfFileItem[] = [
        {
          id: `sample-${Date.now()}-1`,
          data: sample1,
          name: 'Sample_Invoice_Document.pdf',
          size: sample1.byteLength,
          pageCount: meta1.pageCount,
          thumbnailUrl: meta1.thumbnailUrl,
          pageRange: 'all',
          isValid: true,
        },
        {
          id: `sample-${Date.now()}-2`,
          data: sample2,
          name: 'Sample_Presentation_Slides.pdf',
          size: sample2.byteLength,
          pageCount: meta2.pageCount,
          thumbnailUrl: meta2.thumbnailUrl,
          pageRange: 'all',
          isValid: true,
        },
        {
          id: `sample-${Date.now()}-3`,
          data: sample3,
          name: 'Sample_Vector_Artwork.pdf',
          size: sample3.byteLength,
          pageCount: meta3.pageCount,
          thumbnailUrl: meta3.thumbnailUrl,
          pageRange: 'all',
          isValid: true,
        },
      ];

      setItems(sampleItems);
    } catch (err: any) {
      console.error('Failed to load sample PDFs:', err);
      setError('Failed to generate sample PDF files.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePageRangeChange = (id: string, range: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, pageRange: range } : item))
    );
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      setError('Please add at least 2 PDF documents to merge.');
      return;
    }

    const invalidItems = items.filter((it) => !it.isValid);
    if (invalidItems.length > 0) {
      setError('Please remove or fix invalid/corrupted PDF files before merging.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProgressStatus({ current: 1, total: items.length, message: 'Starting PDF merger engine...' });

    try {
      const result = await mergePdfs(items, (current, total, message) => {
        setProgressStatus({ current, total, message });
      });

      const finalName = outputFilename.trim().endsWith('.pdf')
        ? outputFilename.trim()
        : `${outputFilename.trim() || 'Merged_Document'}.pdf`;

      const downloadUrl = URL.createObjectURL(result.blob);
      const totalInputSize = items.reduce((acc, it) => acc + it.size, 0);

      const resultObj = {
        blob: result.blob,
        url: downloadUrl,
        filename: finalName,
        size: result.blob.size,
        totalPages: result.totalMergedPages,
      };

      setMergedResult(resultObj);

      // Trigger celebratory confetti
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#7c3aed', '#2563eb', '#10b981'],
      });

      // Notify history storage
      onConversionComplete({
        originalFilename: `${items.length} PDF Documents Merged`,
        inputFormat: 'PDF',
        outputFormat: 'PDF (Merged)',
        inputSize: totalInputSize,
        outputSize: result.blob.size,
        pageCount: result.totalMergedPages,
        downloadUrl,
        downloadFilename: finalName,
      });
    } catch (err: any) {
      console.error('Merge error:', err);
      setError(err.message || 'An error occurred while merging your PDF documents.');
    } finally {
      setIsProcessing(false);
      setProgressStatus(null);
    }
  };

  const handleDownload = () => {
    if (!mergedResult) return;
    downloadFile(mergedResult.blob, mergedResult.filename);
  };

  const calculateTotalEstimatedPages = () => {
    return items.reduce((acc, item) => {
      const indices = parseMergePageRange(item.pageRange, item.pageCount);
      return acc + indices.length;
    }, 0);
  };

  const totalInputSize = items.reduce((acc, it) => acc + it.size, 0);

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-2xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Document PDF Combiner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              PDF Merger
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
              Combine multiple PDF files into one clean, continuous PDF document. Reorder pages, select custom page ranges, and merge in seconds with 100% client-side privacy.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="sample-merge-btn"
              onClick={handleLoadSamplePdfs}
              disabled={isLoadingFiles || isProcessing}
              className="px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title="Load 3 sample PDF files to test instant merging"
            >
              {isLoadingFiles ? (
                <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <span>{isLoadingFiles ? 'Loading Samples...' : 'Load Sample PDFs'}</span>
            </button>

            <button
              type="button"
              id="add-more-pdf-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoadingFiles || isProcessing}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add PDF Files</span>
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf,application/x-pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-bold underline hover:no-underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Upload Dropzone if no items */}
      {items.length === 0 ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFilesSelected(e.dataTransfer.files);
          }}
          onClick={() => !isLoadingFiles && fileInputRef.current?.click()}
          className={`bg-white dark:bg-gray-800 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-10 sm:p-16 text-center cursor-pointer transition-all hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 group relative overflow-hidden ${
            isLoadingFiles ? 'opacity-70 pointer-events-none' : ''
          }`}
        >
          {isLoadingFiles && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xs flex flex-col items-center justify-center z-10">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Reading & parsing PDF documents...</p>
            </div>
          )}

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xs">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
            Drag & Drop PDF Documents Here
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Select 2 or more PDF files from your computer to combine them in any custom order.
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Choose PDF Files</span>
          </button>

          <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              100% Private (Never leaves browser)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-500" />
              Preserves vector crispness
            </span>
          </div>
        </div>
      ) : (
        /* Active File List & Merge Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Reorderable Document List (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">
                    {items.length}
                  </span>
                  <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    Documents in Merge Order
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add More</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setItems([]);
                      setMergedResult(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 text-gray-600 dark:text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700/60 mt-2">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                      !item.isValid ? 'opacity-60 bg-rose-50/40 dark:bg-rose-950/20 px-3 rounded-2xl' : ''
                    }`}
                  >
                    {/* Order & Thumbnail & Details */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Order Badge */}
                      <div className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-black text-gray-600 dark:text-gray-300 shrink-0">
                        {index + 1}
                      </div>

                      {/* PDF Thumbnail */}
                      <div className="w-12 h-16 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 flex items-center justify-center relative shadow-2xs">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-6 h-6 text-indigo-400" />
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white font-bold text-center py-0.5">
                          {item.pageCount}p
                        </span>
                      </div>

                      {/* Name and Info */}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          <span>{formatFileSize(item.size)}</span>
                          <span>•</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
                          </span>
                        </div>
                        {item.errorMessage && (
                          <div className="text-[10px] text-rose-500 font-semibold mt-1">
                            {item.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Page Range Selector & Controls */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Page Range Input */}
                      <div className="flex items-center gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          Pages:
                        </label>
                        <input
                          type="text"
                          value={item.pageRange}
                          onChange={(e) => handlePageRangeChange(item.id, e.target.value)}
                          placeholder="e.g. all or 1-3, 5"
                          className="w-24 sm:w-28 px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          title="Page selection (e.g. 'all', '1-2', '1,3-5')"
                        />
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Move up in merge sequence"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === items.length - 1}
                          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Move down in merge sequence"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer ml-1"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Merge Settings & Action Card */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Merge Output Settings
                </h3>
              </div>

              {/* Output Filename */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Output Filename
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={outputFilename}
                    onChange={(e) => setOutputFilename(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    placeholder="Merged_Document.pdf"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 font-bold">
                    .pdf
                  </span>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Total Documents:</span>
                  <span className="font-extrabold text-gray-900 dark:text-white">{items.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Estimated Total Pages:</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    {calculateTotalEstimatedPages()} pages
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Combined Input Size:</span>
                  <span className="font-extrabold text-gray-900 dark:text-white">
                    {formatFileSize(totalInputSize)}
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              {isProcessing && progressStatus && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span>{progressStatus.message}</span>
                    <span>
                      {progressStatus.current} / {progressStatus.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{
                        width: `${(progressStatus.current / progressStatus.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                id="execute-merge-btn"
                onClick={handleMerge}
                disabled={items.length < 2 || isProcessing}
                className={`w-full py-3.5 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  items.length >= 2 && !isProcessing
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 hover:scale-[1.01]'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin text-white" />
                    <span>Compiling PDF Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Merge {items.length} PDFs into 1 File</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Merged Result Box */}
            {mergedResult && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-5 sm:p-6 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div className="font-black text-sm">PDF Merge Complete!</div>
                </div>

                <div className="text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
                  <div className="font-bold truncate">{mergedResult.filename}</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <span>{mergedResult.totalPages} pages</span>
                    <span>•</span>
                    <span>{formatFileSize(mergedResult.size)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewModalUrl(mergedResult.url)}
                    className="py-2.5 px-3 rounded-xl bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/50 dark:hover:bg-gray-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded Preview Modal */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                  {mergedResult?.filename || 'Merged PDF Preview'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {mergedResult && (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(null)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Body: PDF Viewer iframe */}
            <div className="flex-1 w-full bg-gray-100 dark:bg-gray-950 p-2">
              <iframe
                src={previewModalUrl}
                title="Merged PDF Preview"
                className="w-full h-full rounded-2xl border border-gray-200 dark:border-gray-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
