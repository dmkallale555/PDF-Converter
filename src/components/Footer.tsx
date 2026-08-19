import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  FileText, 
  Image as ImageIcon, 
  Heart, 
  Lock, 
  Cpu, 
  Globe2 
} from 'lucide-react';
import { AppRoute, ThemeMode } from '../types';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, theme, onToggleTheme }) => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand & Security Statement */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white">
                Convert<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
              Free, professional-grade online file converter. Converts PDF files to high-resolution JPG, PNG, WEBP, TIFF, BMP (up to 600 DPI) and combines images into clean, standard PDF documents.
            </p>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% In-Browser Privacy • Zero Watermark</span>
            </div>
          </div>

          {/* PDF Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              PDF Converters
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('pdf-to-jpg')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  PDF to JPG (High-Res)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pdf-to-png')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  PDF to PNG (Lossless)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pdf-to-webp')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  PDF to WEBP (Compact)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pdf-to-tiff')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  PDF to TIFF (Print Quality)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pdf-to-bmp')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  PDF to BMP (Bitmap)
                </button>
              </li>
            </ul>
          </div>

          {/* Image Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Image Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('image-to-pdf')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Image to PDF (Multi-Page)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('jpg-to-pdf')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  JPG to PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('png-to-pdf')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  PNG to PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('image-to-image')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Image ↔ Image Converter
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('batch-converter')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Bulk Batch Converter
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & About */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              About & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  About ConvertPro
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('security')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Security Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cookie-policy')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Cookie Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 dark:border-gray-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 dark:text-gray-500">
          <div>
            © {new Date().getFullYear()} ConvertPro. All rights reserved. Client-Side High-Precision Rendering Engine.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>Hardware-Accelerated WebAssembly</span>
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>End-to-End Private</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
