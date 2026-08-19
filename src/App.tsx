import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  FileText, 
  Sparkles, 
  Layers, 
  Download, 
  CheckCircle2, 
  RotateCw, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { SettingsPanel } from './components/SettingsPanel';
import { PageGrid } from './components/PageGrid';
import { PreviewModal } from './components/PreviewModal';
import { ZipDownloadBar } from './components/ZipDownloadBar';
import { PasswordModal } from './components/PasswordModal';
import { 
  ConversionSettings, 
  LoadedPdf, 
  PageInfo,
  ConversionProgress 
} from './types';
import { 
  loadPdfDocument, 
  extractPagesInfo, 
  renderPageThumbnail, 
  renderPageToImage, 
  createZipArchive, 
  downloadFile, 
  copyImageToClipboard,
  parsePageRange
} from './utils/pdfRenderer';
import { createSamplePdf } from './utils/samplePdfs';

const DEFAULT_SETTINGS: ConversionSettings = {
  format: 'png',
  dpi: 300,
  scale: 300 / 72,
  jpegQuality: 0.95,
  colorMode: 'color',
  backgroundColor: '#ffffff',
  rotationOffset: 0,
  pageRange: 'all',
  namingPattern: '{name}_page_{page}',
};

export default function App() {
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdf | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>(DEFAULT_SETTINGS);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number } | null>(null);
  const [inspectPageNumber, setInspectPageNumber] = useState<number | null>(null);
  const [copiedPage, setCopiedPage] = useState<number | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Password protected handling
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const pendingBufferRef = useRef<{ buffer: ArrayBuffer; name: string } | null>(null);

  /**
   * Load PDF buffer and extract page information
   */
  const handleLoadPdf = async (name: string, buffer: ArrayBuffer, password?: string) => {
    setIsLoadingPdf(true);
    setGlobalError(null);
    setPasswordError(null);

    try {
      const pdfDoc = await loadPdfDocument(buffer, password);
      const pages = await extractPagesInfo(pdfDoc);

      const newPdf: LoadedPdf = {
        id: Math.random().toString(36).substring(7),
        name,
        size: buffer.byteLength,
        totalPages: pdfDoc.numPages,
        data: buffer,
        pages,
        pdfDocument: pdfDoc,
      };

      setLoadedPdf(newPdf);
      setIsPasswordModalOpen(false);
      pendingBufferRef.current = null;

      // Asynchronously render thumbnails in background
      renderAllThumbnails(pdfDoc, pages);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      if (err.name === 'PasswordException') {
        pendingBufferRef.current = { buffer, name };
        setIsPasswordModalOpen(true);
        if (password) {
          setPasswordError('Incorrect password. Please try again.');
        }
      } else {
        setGlobalError(err.message || 'Failed to load PDF document.');
      }
    } finally {
      setIsLoadingPdf(false);
    }
  };

  /**
   * Render fast preview thumbnails for all pages
   */
  const renderAllThumbnails = async (pdfDoc: any, pages: PageInfo[]) => {
    for (const page of pages) {
      try {
        const thumbUrl = await renderPageThumbnail(pdfDoc, page.pageNumber, page.userRotation);
        setLoadedPdf((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            pages: prev.pages.map((p) =>
              p.pageNumber === page.pageNumber ? { ...p, thumbnailUrl: thumbUrl } : p
            ),
          };
        });
      } catch (err) {
        console.error(`Failed thumbnail for page ${page.pageNumber}`, err);
      }
    }
  };

  /**
   * Load sample PDF
   */
  const handleLoadSample = (type: 'invoice' | 'presentation' | 'vector') => {
    const buffer = createSamplePdf(type);
    const names = {
      invoice: 'Sample_Invoice_Document.pdf',
      presentation: 'Sample_Presentation_Slide.pdf',
      vector: 'Sample_HighRes_Vector_Test.pdf',
    };
    handleLoadPdf(names[type], buffer);
  };

  /**
   * File drop / pick handler
   */
  const handleFileLoaded = (file: File, buffer: ArrayBuffer) => {
    handleLoadPdf(file.name, buffer);
  };

  /**
   * Update Settings
   */
  const handleUpdateSettings = (newSettings: Partial<ConversionSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  /**
   * Toggle individual page selection
   */
  const handleTogglePage = (pageNumber: number) => {
    setLoadedPdf((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        pages: prev.pages.map((p) =>
          p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
        ),
      };
    });
  };

  /**
   * Bulk selection filters
   */
  const handleSelectAll = () => {
    setLoadedPdf((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        pages: prev.pages.map((p) => ({ ...p, selected: true })),
      };
    });
  };

  const handleDeselectAll = () => {
    setLoadedPdf((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        pages: prev.pages.map((p) => ({ ...p, selected: false })),
      };
    });
  };

  const handleSelectFilter = (filter: 'all' | 'odd' | 'even' | 'first') => {
    setLoadedPdf((prev) => {
      if (!prev) return null;
      const targetSet = parsePageRange(filter, prev.totalPages);
      return {
        ...prev,
        pages: prev.pages.map((p) => ({ ...p, selected: targetSet.has(p.pageNumber) })),
      };
    });
  };

  /**
   * Rotate single page
   */
  const handleRotatePage = async (pageNumber: number) => {
    if (!loadedPdf) return;
    const targetPage = loadedPdf.pages.find((p) => p.pageNumber === pageNumber);
    if (!targetPage) return;

    const newRotation = (targetPage.userRotation + 90) % 360;

    // Update state and clear rendered preview so it re-renders at new rotation
    setLoadedPdf((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        pages: prev.pages.map((p) =>
          p.pageNumber === pageNumber
            ? { ...p, userRotation: newRotation, renderedBlob: undefined, renderedUrl: undefined }
            : p
        ),
      };
    });

    // Re-render thumbnail
    try {
      const thumb = await renderPageThumbnail(loadedPdf.pdfDocument, pageNumber, newRotation);
      setLoadedPdf((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          pages: prev.pages.map((p) =>
            p.pageNumber === pageNumber ? { ...p, thumbnailUrl: thumb } : p
          ),
        };
      });
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * High-Resolution Render All Selected Pages
   */
  const handleApplyConversion = async () => {
    if (!loadedPdf || !loadedPdf.pdfDocument) return;
    const selectedPages = loadedPdf.pages.filter((p) => p.selected);
    if (selectedPages.length === 0) return;

    setIsConverting(true);
    setConversionProgress({
      current: 0,
      total: selectedPages.length,
      currentPageNumber: selectedPages[0]?.pageNumber,
    });

    for (let i = 0; i < selectedPages.length; i++) {
      const page = selectedPages[i];
      setConversionProgress({
        current: i,
        total: selectedPages.length,
        currentPageNumber: page.pageNumber,
      });

      // Mark rendering
      setLoadedPdf((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          pages: prev.pages.map((p) =>
            p.pageNumber === page.pageNumber ? { ...p, isRendering: true } : p
          ),
        };
      });

      try {
        const res = await renderPageToImage(
          loadedPdf.pdfDocument,
          page.pageNumber,
          settings,
          page.userRotation
        );

        setLoadedPdf((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            pages: prev.pages.map((p) =>
              p.pageNumber === page.pageNumber
                ? {
                    ...p,
                    isRendering: false,
                    renderedBlob: res.blob,
                    renderedUrl: res.dataUrl,
                    renderedWidth: res.width,
                    renderedHeight: res.height,
                    renderedSize: res.size,
                  }
                : p
            ),
          };
        });
      } catch (err: any) {
        console.error(`Render error page ${page.pageNumber}:`, err);
        setLoadedPdf((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            pages: prev.pages.map((p) =>
              p.pageNumber === page.pageNumber
                ? { ...p, isRendering: false, error: err.message }
                : p
            ),
          };
        });
      }

      setConversionProgress({
        current: i + 1,
        total: selectedPages.length,
        currentPageNumber: page.pageNumber,
      });
    }

    setIsConverting(false);
    setConversionProgress(null);

    // Light celebratory feedback
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.85 },
      colors: ['#4f46e5', '#6366f1', '#10b981'],
    });
  };

  /**
   * Download single page
   */
  const handleDownloadPage = async (pageNumber: number) => {
    if (!loadedPdf) return;
    const page = loadedPdf.pages.find((p) => p.pageNumber === pageNumber);
    if (!page) return;

    let blob = page.renderedBlob;
    if (!blob) {
      // Render on demand if not pre-rendered
      const res = await renderPageToImage(
        loadedPdf.pdfDocument,
        pageNumber,
        settings,
        page.userRotation
      );
      blob = res.blob;
    }

    const baseName = loadedPdf.name.replace(/\.pdf$/i, '');
    const ext = settings.format === 'png' ? 'png' : 'jpg';
    const filename = `${baseName}_page_${String(pageNumber).padStart(2, '0')}_${settings.dpi}dpi.${ext}`;

    downloadFile(blob, filename);
  };

  /**
   * Copy page image to clipboard
   */
  const handleCopyPage = async (pageNumber: number) => {
    if (!loadedPdf) return;
    const page = loadedPdf.pages.find((p) => p.pageNumber === pageNumber);
    if (!page) return;

    let blob = page.renderedBlob;
    if (!blob) {
      const res = await renderPageToImage(
        loadedPdf.pdfDocument,
        pageNumber,
        settings,
        page.userRotation
      );
      blob = res.blob;
    }

    const success = await copyImageToClipboard(blob);
    if (success) {
      setCopiedPage(pageNumber);
      setTimeout(() => setCopiedPage(null), 2500);
    }
  };

  /**
   * Download All Selected Pages as ZIP archive
   */
  const handleDownloadZip = async () => {
    if (!loadedPdf) return;
    const selectedPages = loadedPdf.pages.filter((p) => p.selected);
    if (selectedPages.length === 0) return;

    setIsZipping(true);
    setZipProgress({ current: 0, total: selectedPages.length });

    try {
      const zipBlob = await createZipArchive(
        loadedPdf,
        settings,
        selectedPages,
        (current, total) => {
          setZipProgress({ current, total });
        }
      );

      const baseName = loadedPdf.name.replace(/\.pdf$/i, '');
      const zipFilename = `${baseName}_${settings.format.toUpperCase()}_${settings.dpi}DPI.zip`;

      downloadFile(zipBlob, zipFilename);

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error('ZIP export error:', err);
      setGlobalError(err.message || 'Failed to create ZIP package.');
    } finally {
      setIsZipping(false);
      setZipProgress(null);
    }
  };

  /**
   * Reset / Clear Document
   */
  const handleReset = () => {
    setLoadedPdf(null);
    setGlobalError(null);
    setInspectPageNumber(null);
  };

  // Inspect Modal Navigation
  const inspectingPage = loadedPdf?.pages.find((p) => p.pageNumber === inspectPageNumber) || null;
  const currentInspectIndex = loadedPdf?.pages.findIndex((p) => p.pageNumber === inspectPageNumber) ?? -1;
  const hasPrevInspect = currentInspectIndex > 0;
  const hasNextInspect = loadedPdf ? currentInspectIndex < loadedPdf.pages.length - 1 : false;

  const handlePrevInspect = () => {
    if (loadedPdf && hasPrevInspect) {
      setInspectPageNumber(loadedPdf.pages[currentInspectIndex - 1].pageNumber);
    }
  };

  const handleNextInspect = () => {
    if (loadedPdf && hasNextInspect) {
      setInspectPageNumber(loadedPdf.pages[currentInspectIndex + 1].pageNumber);
    }
  };

  const selectedCount = loadedPdf?.pages.filter((p) => p.selected).length || 0;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col text-gray-900 font-sans antialiased pb-28">
      {/* Top Header */}
      <Header
        hasDocument={!!loadedPdf}
        onReset={handleReset}
        onLoadSample={handleLoadSample}
        isLoading={isLoadingPdf}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Alert */}
        {globalError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error encountered</p>
              <p className="text-xs text-red-700 mt-0.5">{globalError}</p>
            </div>
          </div>
        )}

        {/* View State 1: No PDF loaded (Dropzone) */}
        {!loadedPdf && (
          <Dropzone
            onFileLoaded={handleFileLoaded}
            onLoadSample={handleLoadSample}
            isLoading={isLoadingPdf}
          />
        )}

        {/* View State 2: PDF Loaded (Settings + Page Grid) */}
        {loadedPdf && (
          <div className="space-y-6">
            
            {/* File Info Banner */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 truncate max-w-md">
                    {loadedPdf.name}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {loadedPdf.totalPages} {loadedPdf.totalPages === 1 ? 'Page' : 'Pages'} • {(loadedPdf.size / 1024).toFixed(1)} KB • PDF Document
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% In-Browser</span>
                </div>
              </div>
            </div>

            {/* Quality & Conversion Controls Panel */}
            <SettingsPanel
              settings={settings}
              onChangeSettings={handleUpdateSettings}
              loadedPdf={loadedPdf}
              onApplyConversion={handleApplyConversion}
              isConverting={isConverting}
              conversionProgress={conversionProgress}
              selectedCount={selectedCount}
            />

            {/* Page Grid */}
            <PageGrid
              pages={loadedPdf.pages}
              settings={settings}
              onTogglePage={handleTogglePage}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onSelectFilter={handleSelectFilter}
              onRotatePage={handleRotatePage}
              onDownloadPage={handleDownloadPage}
              onCopyPage={handleCopyPage}
              onInspectPage={(num) => setInspectPageNumber(num)}
              copiedPage={copiedPage}
            />

          </div>
        )}

      </main>

      {/* Floating Bottom ZIP Download Bar */}
      {loadedPdf && (
        <ZipDownloadBar
          selectedCount={selectedCount}
          totalCount={loadedPdf.totalPages}
          settings={settings}
          onDownloadZip={handleDownloadZip}
          isZipping={isZipping}
          zipProgress={zipProgress}
        />
      )}

      {/* Full-Screen Zoom/Pan Inspector Modal */}
      {inspectPageNumber !== null && (
        <PreviewModal
          page={inspectingPage}
          settings={settings}
          onClose={() => setInspectPageNumber(null)}
          onPrevPage={handlePrevInspect}
          onNextPage={handleNextInspect}
          hasPrev={hasPrevInspect}
          hasNext={hasNextInspect}
          onDownload={handleDownloadPage}
          onCopy={handleCopyPage}
          isCopied={copiedPage === inspectPageNumber}
        />
      )}

      {/* Password Protection Modal */}
      {isPasswordModalOpen && (
        <PasswordModal
          onSubmit={(pass) => {
            if (pendingBufferRef.current) {
              handleLoadPdf(pendingBufferRef.current.name, pendingBufferRef.current.buffer, pass);
            }
          }}
          onCancel={() => {
            setIsPasswordModalOpen(false);
            pendingBufferRef.current = null;
          }}
          error={passwordError}
        />
      )}

    </div>
  );
}
