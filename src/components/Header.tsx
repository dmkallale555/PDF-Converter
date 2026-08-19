import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Layers, 
  Image as ImageIcon, 
  History, 
  LayoutDashboard, 
  Shield, 
  Settings, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Sun, 
  Moon, 
  Monitor, 
  Menu, 
  X,
  FileCheck,
  Zap,
  Lock,
  ArrowRightLeft
} from 'lucide-react';
import { User, AppRoute, ThemeMode } from '../types';

interface HeaderProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  user: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
  onLoadSample: (type: 'invoice' | 'presentation' | 'vector') => void;
  isLoadingSample?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  theme,
  onToggleTheme,
  onLoadSample,
  isLoadingSample,
}) => {
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
  const [isImageDropdownOpen, setIsImageDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const pdfRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pdfRef.current && !pdfRef.current.contains(e.target as Node)) {
        setIsPdfDropdownOpen(false);
      }
      if (imgRef.current && !imgRef.current.contains(e.target as Node)) {
        setIsImageDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            id="brand-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900 dark:text-white">
                  Convert<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 hidden sm:inline">
                  FREE
                </span>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium hidden md:block leading-none">
                PDF ↔ Image Converter
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* PDF Tools Dropdown */}
            <div className="relative" ref={pdfRef}>
              <button
                id="nav-pdf-tools-btn"
                onClick={() => setIsPdfDropdownOpen(!isPdfDropdownOpen)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentRoute.startsWith('pdf-')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>PDF Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPdfDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPdfDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Convert PDF to Images
                  </div>
                  {[
                    { route: 'pdf-to-jpg', label: 'PDF to JPG', desc: 'Fast & compatible' },
                    { route: 'pdf-to-png', label: 'PDF to PNG', desc: 'Lossless & transparent' },
                    { route: 'pdf-to-webp', label: 'PDF to WEBP', desc: 'Modern small size' },
                    { route: 'pdf-to-tiff', label: 'PDF to TIFF', desc: 'Print & archival' },
                    { route: 'pdf-to-bmp', label: 'PDF to BMP', desc: 'Raw bitmap format' },
                  ].map((item) => (
                    <button
                      key={item.route}
                      id={`nav-${item.route}`}
                      onClick={() => {
                        onNavigate(item.route as AppRoute);
                        setIsPdfDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{item.label}</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">{item.desc}</div>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                        600 DPI
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Image Tools Dropdown */}
            <div className="relative" ref={imgRef}>
              <button
                id="nav-image-tools-btn"
                onClick={() => setIsImageDropdownOpen(!isImageDropdownOpen)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentRoute.includes('image-') || currentRoute.includes('jpg-') || currentRoute.includes('png-')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Image Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isImageDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isImageDropdownOpen && (
                <div className="absolute left-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Image to PDF & Conversions
                  </div>
                  {[
                    { route: 'image-to-pdf', label: 'Image to PDF (Multi)', desc: 'Combine JPG/PNG/WEBP into 1 PDF' },
                    { route: 'jpg-to-pdf', label: 'JPG to PDF', desc: 'Custom page sizing & margins' },
                    { route: 'png-to-pdf', label: 'PNG to PDF', desc: 'Preserves sharp graphic lines' },
                    { route: 'image-to-image', label: 'Image ↔ Image Converter', desc: 'JPG, PNG, WEBP, BMP, SVG' },
                    { route: 'jpg-to-png', label: 'JPG to PNG', desc: 'Lossless conversion' },
                    { route: 'png-to-jpg', label: 'PNG to JPG', desc: 'Compressed smaller size' },
                  ].map((item) => (
                    <button
                      key={item.route}
                      id={`nav-${item.route}`}
                      onClick={() => {
                        onNavigate(item.route as AppRoute);
                        setIsImageDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/60 flex flex-col text-xs"
                    >
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{item.label}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">{item.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Batch Converter */}
            <button
              id="nav-batch-btn"
              onClick={() => onNavigate('batch-converter')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentRoute === 'batch-converter'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Batch Converter</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-full">
                Bulk
              </span>
            </button>

            {/* History Link */}
            <button
              id="nav-history-btn"
              onClick={() => onNavigate('history')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentRoute === 'history'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>History</span>
            </button>

            {/* Dashboard Link */}
            {user && (
              <button
                id="nav-dashboard-btn"
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentRoute === 'dashboard'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Dashboard</span>
              </button>
            )}

            {/* Admin Panel Link */}
            {user?.role === 'ADMIN' && (
              <button
                id="nav-admin-btn"
                onClick={() => onNavigate('admin')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentRoute === 'admin'
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50/60 dark:bg-purple-950/40'
                    : 'text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Section: Theme Toggle, Sample Buttons, Auth / User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Sample Trigger */}
          <div className="hidden xl:flex items-center gap-1 bg-gray-100/70 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
            <span className="px-2 py-0.5 text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              Samples:
            </span>
            <button
              id="sample-doc-btn"
              onClick={() => onLoadSample('invoice')}
              disabled={isLoadingSample}
              className="px-2 py-1 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-xs transition-all flex items-center gap-1 text-[11px] font-semibold disabled:opacity-50"
              title="Load 2-page Invoice sample PDF"
            >
              <FileText className="w-3 h-3 text-indigo-500" />
              <span>Invoice</span>
            </button>
            <button
              id="sample-vector-btn"
              onClick={() => onLoadSample('vector')}
              disabled={isLoadingSample}
              className="px-2 py-1 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-xs transition-all flex items-center gap-1 text-[11px] font-semibold disabled:opacity-50"
              title="Load High-DPI Vector Benchmark"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Vector</span>
            </button>
          </div>

          {/* Theme Selector */}
          <div className="relative" ref={themeRef}>
            <button
              id="theme-toggle-btn"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
              title="Switch Theme (Light, Dark, System)"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Monitor className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50">
                <button
                  id="theme-light-btn"
                  onClick={() => {
                    onToggleTheme('light');
                    setIsThemeMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  id="theme-dark-btn"
                  onClick={() => {
                    onToggleTheme('dark');
                    setIsThemeMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark</span>
                </button>
                <button
                  id="theme-system-btn"
                  onClick={() => {
                    onToggleTheme('system');
                    setIsThemeMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                >
                  <Monitor className="w-3.5 h-3.5 text-gray-500" />
                  <span>System</span>
                </button>
              </div>
            )}
          </div>

          {/* User Auth Section */}
          {user ? (
            <div className="relative" ref={userRef}>
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-gray-900 dark:text-white leading-none">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">
                    {user.role === 'ADMIN' ? 'Administrator' : 'Free Member'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="font-bold text-xs text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{user.email}</div>
                  </div>

                  <button
                    id="menu-dashboard-btn"
                    onClick={() => {
                      onNavigate('dashboard');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/60 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                    <span>My Dashboard</span>
                  </button>

                  <button
                    id="menu-history-btn"
                    onClick={() => {
                      onNavigate('history');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/60 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <History className="w-4 h-4 text-indigo-500" />
                    <span>Conversion History</span>
                  </button>

                  <button
                    id="menu-settings-btn"
                    onClick={() => {
                      onNavigate('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/60 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <Settings className="w-4 h-4 text-indigo-500" />
                    <span>Account Settings</span>
                  </button>

                  {user.role === 'ADMIN' && (
                    <button
                      id="menu-admin-btn"
                      onClick={() => {
                        onNavigate('admin');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/60 flex items-center gap-2 text-purple-700 dark:text-purple-300"
                    >
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>Admin Panel</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>

                  <button
                    id="menu-logout-btn"
                    onClick={() => {
                      onLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="header-login-btn"
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
              <button
                id="header-register-btn"
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all"
              >
                Free Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-2 animate-in slide-in-from-top-4">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">PDF Tools</div>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => { onNavigate('pdf-to-jpg'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              PDF to JPG
            </button>
            <button
              onClick={() => { onNavigate('pdf-to-png'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              PDF to PNG
            </button>
            <button
              onClick={() => { onNavigate('pdf-to-webp'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              PDF to WEBP
            </button>
            <button
              onClick={() => { onNavigate('pdf-to-tiff'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              PDF to TIFF
            </button>
          </div>

          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 pt-2">Image Tools</div>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => { onNavigate('image-to-pdf'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              Image to PDF
            </button>
            <button
              onClick={() => { onNavigate('image-to-image'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              Image ↔ Image
            </button>
            <button
              onClick={() => { onNavigate('batch-converter'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              Batch Converter
            </button>
            <button
              onClick={() => { onNavigate('history'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              History
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
