import React from 'react';
import { 
  X, 
  Trash2, 
  Download, 
  FileText, 
  ArrowDown, 
  Clock, 
  CheckCircle2,
  ExternalLink 
} from 'lucide-react';
import { ProcessedResult } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ProcessedResult[];
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Conversion History</h2>
                <p className="text-xs text-slate-400">{history.length} processed files</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Clear All History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-3">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-slate-700 text-sm">No recent conversions</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Your converted, compressed, or merged PDFs will appear here for easy re-downloading.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col gap-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-semibold text-slate-900 text-xs truncate" title={item.outputName}>
                          {item.outputName}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.toolName} • {item.date}
                        </span>
                      </div>
                    </div>

                    <a
                      href={item.downloadUrl}
                      download={item.outputName}
                      className="p-2 bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 rounded-lg shadow-xs transition-colors shrink-0"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Size & Compression metric */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60">
                    <span className="text-slate-500">
                      Size: <span className="font-medium text-slate-700">{formatBytes(item.fileSize)}</span>
                    </span>

                    {item.compressionRatio && (
                      <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <ArrowDown className="w-3 h-3" />
                        <span>Saved {item.compressionRatio}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Note */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500">
              Files are stored locally in your browser cache.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
