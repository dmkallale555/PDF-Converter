import React, { useState, useEffect, useRef } from 'react';
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
  Info,
  ArrowRight,
  LayoutDashboard,
  LogIn
} from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Dropzone } from './components/Dropzone';
import { SettingsPanel } from './components/SettingsPanel';
import { PageGrid } from './components/PageGrid';
import { PreviewModal } from './components/PreviewModal';
import { ZipDownloadBar } from './components/ZipDownloadBar';
import { PasswordModal } from './components/PasswordModal';
import { AuthModal } from './components/AuthModal';
import { ImageToPdfConverter } from './components/ImageToPdfConverter';
import { ImageToImageConverter } from './components/ImageToImageConverter';
import { BatchConverter } from './components/BatchConverter';
import { UserDashboard } from './components/UserDashboard';
import { HistoryView } from './components/HistoryView';
import { AccountSettings } from './components/AccountSettings';
import { AdminPanel } from './components/AdminPanel';
import { ToolsTabBar } from './components/ToolsTabBar';

import { 
  ConversionSettings, 
  LoadedPdf, 
  PageInfo,
  ConversionProgress,
  AppRoute,
  User,
  ThemeMode,
  ImageFormat
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
import { getCurrentUser, logoutUser } from './utils/authStorage';
import { addConversionRecord } from './utils/historyStorage';

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
  // Navigation & User State
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);

  // Theme State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('convertpro_theme') as ThemeMode) || 'system';
  });

  // PDF to Image State
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

  // Synchronize theme with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    localStorage.setItem('convertpro_theme', theme);
  }, [theme]);

  // Route specific format synchronization
  useEffect(() => {
    if (currentRoute === 'pdf-to-jpg') {
      setSettings((prev) => ({ ...prev, format: 'jpeg' }));
    } else if (currentRoute === 'pdf-to-png') {
      setSettings((prev) => ({ ...prev, format: 'png' }));
    } else if (currentRoute === 'pdf-to-webp') {
      setSettings((prev) => ({ ...prev, format: 'webp' }));
    } else if (currentRoute === 'pdf-to-tiff') {
      setSettings((prev) => ({ ...prev, format: 'tiff' }));
    } else if (currentRoute === 'pdf-to-bmp') {
      setSettings((prev) => ({ ...prev, format: 'bmp' }));
    }
  }, [currentRoute]);

  const handleToggleTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    if (currentRoute === 'dashboard' || currentRoute === 'settings' || currentRoute === 'admin') {
      setCurrentRoute('home');
    }
  };

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

      // Render thumbnails in background
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
   * Render preview thumbnails for all pages
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

    let totalOutputBytes = 0;

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

        totalOutputBytes += res.size;

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

    // Save record to history
    addConversionRecord({
      userId: user?.id,
      originalFilename: loadedPdf.name,
      inputFormat: 'pdf',
      outputFormat: settings.format,
      inputSize: loadedPdf.size,
      outputSize: totalOutputBytes || loadedPdf.size,
      pageCount: selectedPages.length,
      dpi: settings.dpi,
      status: 'completed',
    });

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
      const res = await renderPageToImage(
        loadedPdf.pdfDocument,
        pageNumber,
        settings,
        page.userRotation
      );
      blob = res.blob;
    }

    const baseName = loadedPdf.name.replace(/\.pdf$/i, '');
    const ext = settings.format === 'jpeg' ? 'jpg' : settings.format;
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

  const handleExternalConversionComplete = (record: {
    originalFilename: string;
    inputFormat: string;
    outputFormat: string;
    inputSize: number;
    outputSize: number;
    pageCount?: number;
    downloadUrl: string;
    downloadFilename: string;
  }) => {
    addConversionRecord({
      userId: user?.id,
      originalFilename: record.originalFilename,
      inputFormat: record.inputFormat,
      outputFormat: record.outputFormat,
      inputSize: record.inputSize,
      outputSize: record.outputSize,
      pageCount: record.pageCount,
      status: 'completed',
    });
  };

  const handleReset = () => {
    setLoadedPdf(null);
    setGlobalError(null);
    setInspectPageNumber(null);
  };

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

  // Determine current active converter view
  const isImageToPdfView = currentRoute === 'image-to-pdf' || currentRoute === 'jpg-to-pdf' || currentRoute === 'png-to-pdf';
  const isImageToImageView = currentRoute === 'image-to-image' || currentRoute === 'jpg-to-png' || currentRoute === 'png-to-jpg';
  const isBatchView = currentRoute === 'batch-converter';
  const isDashboardView = currentRoute === 'dashboard';
  const isHistoryView = currentRoute === 'history';
  const isSettingsView = currentRoute === 'settings';
  const isAdminView = currentRoute === 'admin';
  const isPdfToImageView = !isImageToPdfView && !isImageToImageView && !isBatchView && !isDashboardView && !isHistoryView && !isSettingsView && !isAdminView;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 flex flex-col text-gray-900 dark:text-gray-100 font-sans antialiased transition-colors">
      
      {/* Universal Top Header */}
      <Header
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        user={user}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLoadSample={handleLoadSample}
        isLoadingSample={isLoadingPdf}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Universal Active Tools Tab Bar */}
        <ToolsTabBar currentRoute={currentRoute} onNavigate={setCurrentRoute} />

        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error encountered</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{globalError}</p>
            </div>
          </div>
        )}

        {/* 1. PDF TO IMAGE CONVERTER VIEW */}
        {isPdfToImageView && (
          <div>
            {!loadedPdf ? (
              <Dropzone
                onFileLoaded={(file, buffer) => handleLoadPdf(file.name, buffer)}
                onLoadSample={handleLoadSample}
                isLoading={isLoadingPdf}
                activeRoute={currentRoute}
              />
            ) : (
              <div className="space-y-6">
                {/* File Info Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-gray-900 dark:text-white truncate max-w-md">
                        {loadedPdf.name}
                      </h2>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                        {loadedPdf.totalPages} {loadedPdf.totalPages === 1 ? 'Page' : 'Pages'} • {(loadedPdf.size / 1024).toFixed(1)} KB • PDF Document
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Change PDF
                    </button>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>100% In-Browser</span>
                    </div>
                  </div>
                </div>

                {/* Quality & Conversion Controls Panel */}
                <SettingsPanel
                  settings={settings}
                  onChangeSettings={(s) => setSettings((prev) => ({ ...prev, ...s }))}
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
                  onTogglePage={(pageNum) => {
                    setLoadedPdf((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        pages: prev.pages.map((p) =>
                          p.pageNumber === pageNum ? { ...p, selected: !p.selected } : p
                        ),
                      };
                    });
                  }}
                  onSelectAll={() => {
                    setLoadedPdf((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        pages: prev.pages.map((p) => ({ ...p, selected: true })),
                      };
                    });
                  }}
                  onDeselectAll={() => {
                    setLoadedPdf((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        pages: prev.pages.map((p) => ({ ...p, selected: false })),
                      };
                    });
                  }}
                  onSelectFilter={(filter) => {
                    setLoadedPdf((prev) => {
                      if (!prev) return null;
                      const targetSet = parsePageRange(filter, prev.totalPages);
                      return {
                        ...prev,
                        pages: prev.pages.map((p) => ({ ...p, selected: targetSet.has(p.pageNumber) })),
                      };
                    });
                  }}
                  onRotatePage={async (pageNum) => {
                    if (!loadedPdf) return;
                    const page = loadedPdf.pages.find((p) => p.pageNumber === pageNum);
                    if (!page) return;
                    const newRot = (page.userRotation + 90) % 360;

                    setLoadedPdf((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        pages: prev.pages.map((p) =>
                          p.pageNumber === pageNum
                            ? { ...p, userRotation: newRot, renderedBlob: undefined, renderedUrl: undefined }
                            : p
                        ),
                      };
                    });

                    try {
                      const thumb = await renderPageThumbnail(loadedPdf.pdfDocument, pageNum, newRot);
                      setLoadedPdf((prev) => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          pages: prev.pages.map((p) =>
                            p.pageNumber === pageNum ? { ...p, thumbnailUrl: thumb } : p
                          ),
                        };
                      });
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  onDownloadPage={handleDownloadPage}
                  onCopyPage={handleCopyPage}
                  onInspectPage={(num) => setInspectPageNumber(num)}
                  copiedPage={copiedPage}
                />
              </div>
            )}
          </div>
        )}

        {/* 2. IMAGE TO PDF CONVERTER VIEW */}
        {isImageToPdfView && (
          <ImageToPdfConverter
            mode={currentRoute === 'jpg-to-pdf' ? 'jpg-to-pdf' : currentRoute === 'png-to-pdf' ? 'png-to-pdf' : 'image-to-pdf'}
            onConversionComplete={handleExternalConversionComplete}
          />
        )}

        {/* 3. IMAGE TO IMAGE CONVERTER VIEW */}
        {isImageToImageView && (
          <ImageToImageConverter
            initialTargetFormat={
              currentRoute === 'jpg-to-png' ? 'png' : currentRoute === 'png-to-jpg' ? 'jpg' : 'webp'
            }
            onConversionComplete={handleExternalConversionComplete}
          />
        )}

        {/* 4. BATCH MULTI-FILE CONVERTER VIEW */}
        {isBatchView && (
          <BatchConverter onConversionComplete={handleExternalConversionComplete} />
        )}

        {/* 5. USER DASHBOARD VIEW */}
        {isDashboardView && (
          <div>
            {user ? (
              <UserDashboard user={user} onNavigate={setCurrentRoute} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-12 text-center max-w-md mx-auto space-y-4 shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                  <LayoutDashboard className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Member Dashboard
                </h3>
                <p className="text-xs text-gray-400">
                  Please sign in to access your personal dashboard, conversion analytics, and saved presets.
                </p>
                <button
                  onClick={() => setAuthModalMode('login')}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Your Account</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 6. CONVERSION HISTORY VIEW */}
        {isHistoryView && (
          <HistoryView userId={user?.id} onNavigate={setCurrentRoute} />
        )}

        {/* 7. ACCOUNT SETTINGS VIEW */}
        {isSettingsView && (
          <div>
            {user ? (
              <AccountSettings
                user={user}
                onUpdateUser={setUser}
                onLogout={handleLogout}
                theme={theme}
                onToggleTheme={handleToggleTheme}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-12 text-center max-w-md mx-auto space-y-4 shadow-2xs">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Account Settings
                </h3>
                <p className="text-xs text-gray-400">
                  Please log in to manage your user profile and preferences.
                </p>
                <button
                  onClick={() => setAuthModalMode('login')}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}

        {/* 8. ADMIN PANEL VIEW */}
        {isAdminView && (
          <div>
            {user?.role === 'ADMIN' ? (
              <AdminPanel currentUser={user} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-12 text-center max-w-md mx-auto space-y-4 shadow-2xs">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Administrator Access Required
                </h3>
                <p className="text-xs text-gray-400">
                  You must be logged in as an administrator to view this page.
                </p>
                <button
                  onClick={() => setAuthModalMode('login')}
                  className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                >
                  Sign In with Admin Account
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Floating Bottom ZIP Download Bar (when in PDF to Image view with active document) */}
      {isPdfToImageView && loadedPdf && (
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

      {/* Authentication Modal (Sign In / Register / Forgot Password) */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setAuthModalMode(null);
          }}
        />
      )}

      {/* Global Footer */}
      <Footer
        onNavigate={setCurrentRoute}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

    </div>
  );
}
