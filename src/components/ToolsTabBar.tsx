import React from 'react';
import { 
  FileText, 
  Sparkles, 
  Zap, 
  Printer, 
  Grid, 
  Layers, 
  Image as ImageIcon, 
  ArrowRightLeft, 
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { AppRoute } from '../types';

interface ToolsTabBarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

interface ToolDef {
  route: AppRoute;
  name: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
  desc: string;
}

export const ToolsTabBar: React.FC<ToolsTabBarProps> = ({ currentRoute, onNavigate }) => {
  const pdfTools: ToolDef[] = [
    {
      route: 'pdf-to-jpg',
      name: 'PDF to JPG',
      badge: 'High-Res',
      icon: FileText,
      desc: 'Standard & high-DPI JPG images',
    },
    {
      route: 'pdf-to-png',
      name: 'PDF to PNG',
      badge: 'Lossless',
      icon: Sparkles,
      desc: 'Crisp vector lines & transparency',
    },
    {
      route: 'pdf-to-webp',
      name: 'PDF to WEBP',
      badge: 'Compact',
      icon: Zap,
      desc: 'Modern small web image sizes',
    },
    {
      route: 'pdf-to-tiff',
      name: 'PDF to TIFF',
      badge: 'Print Quality',
      icon: Printer,
      desc: 'Archival & high-precision print',
    },
    {
      route: 'pdf-to-bmp',
      name: 'PDF to BMP',
      badge: 'Bitmap',
      icon: Grid,
      desc: 'Raw uncompressed raster bitmap',
    },
  ];

  const imageTools: ToolDef[] = [
    {
      route: 'image-to-pdf',
      name: 'Image to PDF',
      badge: 'Multi-Page',
      icon: Layers,
      desc: 'Combine multiple images to 1 PDF',
    },
    {
      route: 'jpg-to-pdf',
      name: 'JPG to PDF',
      badge: 'Photos',
      icon: ImageIcon,
      desc: 'Convert JPG images to PDF document',
    },
    {
      route: 'png-to-pdf',
      name: 'PNG to PDF',
      badge: 'Sharp',
      icon: FileCheck,
      desc: 'Convert PNG graphics to PDF',
    },
    {
      route: 'image-to-image',
      name: 'Image ↔ Image',
      badge: 'Converter',
      icon: ArrowRightLeft,
      desc: 'JPG, PNG, WEBP, BMP, SVG, TIFF',
    },
    {
      route: 'batch-converter',
      name: 'Bulk Batch',
      badge: 'Multi-File',
      icon: Layers,
      desc: 'Convert up to 20 files in parallel',
    },
  ];

  // Helper to check if a tool is active
  const isToolActive = (route: AppRoute) => {
    if (currentRoute === 'home' && route === 'pdf-to-jpg') return true;
    return currentRoute === route;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-2xs mb-8 transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700/80">
        
        {/* Group 1: PDF CONVERTERS */}
        <div className="space-y-3 lg:pr-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                PDF Converters
              </h3>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
              Up to 600 DPI
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {pdfTools.map((tool) => {
              const active = isToolActive(tool.route);
              const Icon = tool.icon;
              return (
                <button
                  key={tool.route}
                  id={`tab-${tool.route}`}
                  onClick={() => onNavigate(tool.route)}
                  className={`p-3 rounded-2xl text-left transition-all relative flex flex-col justify-between group ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-600 dark:ring-indigo-500'
                      : 'bg-gray-50/80 dark:bg-gray-900/60 hover:bg-indigo-50/60 dark:hover:bg-gray-700/60 border border-gray-200/60 dark:border-gray-700/60 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`p-1.5 rounded-xl ${active ? 'bg-white/20 text-white' : 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      active ? 'bg-white/25 text-white' : 'bg-indigo-100/70 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    }`}>
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <div className="font-extrabold text-xs tracking-tight flex items-center gap-1">
                      <span>{tool.name}</span>
                    </div>
                    <div className={`text-[10px] leading-tight mt-0.5 line-clamp-1 ${
                      active ? 'text-indigo-100' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {tool.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Group 2: IMAGE TOOLS */}
        <div className="space-y-3 pt-6 lg:pt-0 lg:pl-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-600"></div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                Image Tools
              </h3>
            </div>
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-full">
              Multi-Format & PDF
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {imageTools.map((tool) => {
              const active = isToolActive(tool.route);
              const Icon = tool.icon;
              return (
                <button
                  key={tool.route}
                  id={`tab-${tool.route}`}
                  onClick={() => onNavigate(tool.route)}
                  className={`p-3 rounded-2xl text-left transition-all relative flex flex-col justify-between group ${
                    active
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20 ring-2 ring-violet-600 dark:ring-violet-500'
                      : 'bg-gray-50/80 dark:bg-gray-900/60 hover:bg-violet-50/60 dark:hover:bg-gray-700/60 border border-gray-200/60 dark:border-gray-700/60 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`p-1.5 rounded-xl ${active ? 'bg-white/20 text-white' : 'bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 shadow-2xs'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      active ? 'bg-white/25 text-white' : 'bg-violet-100/70 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                    }`}>
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <div className="font-extrabold text-xs tracking-tight flex items-center gap-1">
                      <span>{tool.name}</span>
                    </div>
                    <div className={`text-[10px] leading-tight mt-0.5 line-clamp-1 ${
                      active ? 'text-violet-100' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {tool.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
