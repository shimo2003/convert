import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  Sparkles, 
  Layers, 
  Scissors, 
  Minimize2, 
  FileText, 
  Image as ImageIcon,
  ArrowRight,
  X,
  Camera
} from 'lucide-react';
import { ToolId } from '../types';

interface UniversalDropzoneProps {
  onFilesSelected: (files: File[], recommendedToolId?: ToolId) => void;
  onOpenScanner?: () => void;
}

export const UniversalDropzone: React.FC<UniversalDropzoneProps> = ({ onFilesSelected, onOpenScanner }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      processFiles(droppedFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files) as File[];
      processFiles(selected);
    }
  };

  const processFiles = (files: File[]) => {
    setStagedFiles(files);
  };

  // Determine smart recommendations based on staged files
  const getRecommendations = (files: File[]): Array<{ id: ToolId; label: string; icon: any; color: string }> => {
    if (files.length === 0) return [];

    const first = files[0];
    const ext = '.' + first.name.split('.').pop()?.toLowerCase();
    const isMultiple = files.length > 1;

    if (ext === '.pdf') {
      if (isMultiple) {
        return [
          { id: 'merge', label: 'Merge All PDFs', icon: Layers, color: 'bg-red-500 hover:bg-red-600' },
          { id: 'compress', label: 'Compress PDFs', icon: Minimize2, color: 'bg-emerald-600 hover:bg-emerald-700' },
        ];
      }
      return [
        { id: 'compress', label: 'Compress PDF', icon: Minimize2, color: 'bg-emerald-600 hover:bg-emerald-700' },
        { id: 'split', label: 'Split Pages', icon: Scissors, color: 'bg-orange-500 hover:bg-orange-600' },
        { id: 'rotate-organize', label: 'Organize / Rotate', icon: Layers, color: 'bg-indigo-600 hover:bg-indigo-700' },
        { id: 'sign-pdf', label: 'Sign Document', icon: FileCheck, color: 'bg-purple-600 hover:bg-purple-700' },
        { id: 'ai-summarize', label: 'AI Summarize', icon: Sparkles, color: 'bg-rose-600 hover:bg-rose-700' },
      ];
    }

    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return [
        { id: 'image-to-pdf', label: isMultiple ? `Convert ${files.length} Images to PDF` : 'Convert Image to PDF', icon: ImageIcon, color: 'bg-purple-600 hover:bg-purple-700' },
        { id: 'ai-ocr', label: 'AI OCR Text Extract', icon: Sparkles, color: 'bg-rose-600 hover:bg-rose-700' },
      ];
    }

    if (['.docx', '.doc'].includes(ext)) {
      return [
        { id: 'word-to-pdf', label: 'Convert Word to PDF', icon: FileText, color: 'bg-blue-600 hover:bg-blue-700' },
        { id: 'ai-summarize', label: 'AI Summary & Insights', icon: Sparkles, color: 'bg-rose-600 hover:bg-rose-700' },
      ];
    }

    if (['.csv', '.tsv', '.xlsx'].includes(ext)) {
      return [
        { id: 'excel-to-pdf', label: 'Convert Spreadsheet to PDF Table', icon: FileText, color: 'bg-emerald-600 hover:bg-emerald-700' },
      ];
    }

    if (['.txt', '.md', '.markdown'].includes(ext)) {
      return [
        { id: 'text-to-pdf', label: 'Convert Text/Markdown to PDF', icon: FileText, color: 'bg-cyan-600 hover:bg-cyan-700' },
        { id: 'ai-translate', label: 'AI Translate Document', icon: Sparkles, color: 'bg-blue-600 hover:bg-blue-700' },
      ];
    }

    // Generic fallback
    return [
      { id: 'compress', label: 'Compress File', icon: Minimize2, color: 'bg-slate-800 hover:bg-slate-900' },
    ];
  };

  const recommendations = getRecommendations(stagedFiles);

  return (
    <div className="relative w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp,.txt,.md,.csv,.tsv"
      />

      {stagedFiles.length === 0 ? (
        /* Standard Universal Drop Area */
        <div
          id="universal-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-3xl border-2 border-dashed p-8 md:p-10 text-center transition-all cursor-pointer overflow-hidden ${
            isDragging
              ? 'border-red-500 bg-red-50/70 scale-[1.01] shadow-xl'
              : 'border-slate-300 hover:border-red-400 bg-gradient-to-b from-white to-slate-50/60 shadow-xs hover:shadow-md'
          }`}
        >
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center gap-3 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Drop your documents or PDF files here
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Supports <span className="font-medium text-slate-700">PDF, Word (.docx), JPG/PNG Images, Text, Markdown, and CSV tables</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <button
                type="button"
                id="select-files-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                Select Files to Convert
              </button>

              {onOpenScanner && (
                <button
                  type="button"
                  id="scan-camera-dropzone-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenScanner();
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-full shadow-md shadow-slate-900/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Scan with Camera</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mt-1">
              <span className="flex items-center gap-1">🔒 100% Private Client & Secure AI Processing</span>
              <span>•</span>
              <span>⚡ Fast Conversion</span>
            </div>
          </div>
        </div>
      ) : (
        /* Staged File Smart Suggestions Panel */
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setStagedFiles([])}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {stagedFiles.length === 1
                    ? stagedFiles[0].name
                    : `${stagedFiles.length} files selected`}
                </h3>
                <p className="text-xs text-slate-500">
                  Total Size: {(stagedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Recommendation</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Choose what you want to do with this file:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recommendations.map((rec) => {
                const Icon = rec.icon;
                return (
                  <button
                    key={rec.id}
                    id={`action-rec-${rec.id}`}
                    onClick={() => onFilesSelected(stagedFiles, rec.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl text-white text-sm font-semibold transition-transform active:scale-95 shadow-sm cursor-pointer ${rec.color}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{rec.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-80" />
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
              >
                + Add or change files
              </button>
              <button
                onClick={() => setStagedFiles([])}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
