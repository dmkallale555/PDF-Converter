import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  ArrowUpDown,
  DownloadCloud,
  FileSpreadsheet,
  CloudCheck
} from 'lucide-react';
import { ConversionRecord, AppRoute } from '../types';
import { 
  getConversionHistory, 
  deleteConversionRecord, 
  clearUserHistory,
  subscribeToUserRecords 
} from '../utils/historyStorage';

interface HistoryViewProps {
  userId?: string;
  onNavigate: (route: AppRoute) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ userId, onNavigate }) => {
  const [records, setRecords] = useState<ConversionRecord[]>(() => getConversionHistory(userId));
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setRecords(getConversionHistory(userId));

    if (userId) {
      const unsubscribe = subscribeToUserRecords(userId, (liveRecords) => {
        setRecords(liveRecords);
      });
      return () => unsubscribe();
    }
  }, [userId]);

  const handleDelete = (id: string) => {
    deleteConversionRecord(id, userId);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your entire conversion history?')) {
      clearUserHistory(userId);
      setRecords([]);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'ConvertPro_Conversion_History.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch = r.originalFilename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat =
      formatFilter === 'all' ||
      r.inputFormat.toLowerCase() === formatFilter ||
      r.outputFormat.toLowerCase() === formatFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesFormat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Conversion History</span>
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Detailed log of all files converted in this browser session and account.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            disabled={records.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleClearAll}
            disabled={records.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by file name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="all">All Formats</option>
            <option value="pdf">PDF</option>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WEBP</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xs">
        {filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No conversion history found</p>
            <p className="text-xs text-gray-400 mt-1">Convert documents or images to see them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 text-gray-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">File Name</th>
                  <th className="py-3.5 px-4">Format</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">DPI / Quality</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white truncate max-w-xs">
                      {r.originalFilename}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold uppercase text-[10px]">
                        {r.inputFormat} → {r.outputFormat}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 dark:text-gray-400">
                      {(r.inputSize / 1024).toFixed(0)} KB
                    </td>
                    <td className="py-4 px-4 text-gray-500 dark:text-gray-400">
                      {r.dpi ? `${r.dpi} DPI` : 'Vector / High'}
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => onNavigate('home')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold hover:bg-indigo-100 transition-colors"
                      >
                        Convert Again
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
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
