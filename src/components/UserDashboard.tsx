import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Zap, 
  Download, 
  Sparkles, 
  ArrowRight, 
  HardDrive, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Settings,
  ArrowRightLeft
} from 'lucide-react';
import { User, AppRoute, ConversionRecord } from '../types';
import { getHistoryStats, getConversionHistory } from '../utils/historyStorage';

interface UserDashboardProps {
  user: User;
  onNavigate: (route: AppRoute) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, onNavigate }) => {
  const stats = getHistoryStats(user.id);
  const recentConversions = getConversionHistory(user.id).slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ConvertPro Free Member</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.name}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
            Your personal workspace for high-DPI document conversions, image compilation, and local batch processing. All rendering happens securely inside your browser.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <Zap className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Conversions</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.total}</span>
            <span className="text-[11px] text-gray-400 ml-1.5">files processed</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">PDFs Converted</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.pdfToImg}</span>
            <span className="text-[11px] text-gray-400 ml-1.5">to high-res image</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Images to PDF</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.imgToPdf}</span>
            <span className="text-[11px] text-gray-400 ml-1.5">documents compiled</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Data Processed</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {(stats.totalInputBytes / 1024 / 1024).toFixed(1)} MB
            </span>
            <span className="text-[11px] text-emerald-600 font-bold ml-1.5">100% private</span>
          </div>
        </div>

      </div>

      {/* Quick Converter Launch Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
            Quick Converter Tools
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'PDF to JPG',
              desc: 'Convert PDF pages to high-res JPG images up to 600 DPI',
              route: 'pdf-to-jpg' as AppRoute,
              icon: FileText,
              color: 'text-indigo-600',
              bg: 'bg-indigo-50 dark:bg-indigo-950/50',
            },
            {
              title: 'PDF to PNG',
              desc: 'Lossless crisp vector rendering with transparency',
              route: 'pdf-to-png' as AppRoute,
              icon: Sparkles,
              color: 'text-violet-600',
              bg: 'bg-violet-50 dark:bg-violet-950/50',
            },
            {
              title: 'Image to PDF',
              desc: 'Merge multiple JPG, PNG, WEBP images into one clean PDF',
              route: 'image-to-pdf' as AppRoute,
              icon: ImageIcon,
              color: 'text-blue-600',
              bg: 'bg-blue-50 dark:bg-blue-950/50',
            },
            {
              title: 'PDF to WEBP',
              desc: 'Modern web image compression with small file sizes',
              route: 'pdf-to-webp' as AppRoute,
              icon: Zap,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50 dark:bg-emerald-950/50',
            },
            {
              title: 'Image ↔ Image',
              desc: 'Convert format between JPG, PNG, WEBP, BMP, SVG',
              route: 'image-to-image' as AppRoute,
              icon: ArrowRightLeft,
              color: 'text-amber-600',
              bg: 'bg-amber-50 dark:bg-amber-950/50',
            },
            {
              title: 'Batch Converter',
              desc: 'Process up to 20 files simultaneously with progress meters',
              route: 'batch-converter' as AppRoute,
              icon: Layers,
              color: 'text-purple-600',
              bg: 'bg-purple-50 dark:bg-purple-950/50',
            },
          ].map((card) => (
            <button
              key={card.title}
              onClick={() => onNavigate(card.route)}
              className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left shadow-2xs hover:shadow-md group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  {card.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Open Converter</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
              Recent Conversions
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Your latest converted files ready for inspection or download.
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentConversions.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">No conversion history yet. Start converting now!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700/80 text-[11px] font-bold text-gray-400 uppercase">
                  <th className="pb-3">File Name</th>
                  <th className="pb-3">Conversion</th>
                  <th className="pb-3">Size</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {recentConversions.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="py-3 font-semibold text-gray-800 dark:text-gray-200 truncate max-w-xs">
                      {rec.originalFilename}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold uppercase text-[10px]">
                        {rec.inputFormat} → {rec.outputFormat}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {(rec.inputSize / 1024).toFixed(0)} KB
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onNavigate('home')}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-semibold transition-colors"
                      >
                        Convert Again
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
