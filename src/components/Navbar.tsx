import React from 'react';
import { 
  FileText, 
  Clock, 
  Sparkles, 
  Search, 
  Layers, 
  ShieldCheck, 
  HelpCircle,
  X,
  Smartphone,
  Camera
} from 'lucide-react';
import { ToolCategory } from '../types';

interface NavbarProps {
  selectedCategory: ToolCategory;
  onSelectCategory: (cat: ToolCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenQuickAI: () => void;
  onOpenPlayStore: () => void;
  onOpenScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  historyCount,
  onOpenHistory,
  onOpenQuickAI,
  onOpenPlayStore,
  onOpenScanner,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              onSelectCategory('all');
              onSearchChange('');
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">PDF</span>
                <span className="font-bold text-xl bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Suite</span>
              </div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1 hidden sm:block">
                Android &amp; Web Converter
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-tools-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tools (e.g. merge, compress, word, split, sign)..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 rounded-full border border-transparent focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <button
              id="camera-scan-btn"
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full transition-colors cursor-pointer"
              title="Camera Document Scanner"
            >
              <Camera className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden lg:inline">Scan Doc</span>
            </button>

            <button
              id="quick-ai-btn"
              onClick={onOpenQuickAI}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-full transition-colors cursor-pointer"
              title="AI OCR & Document Intelligence"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">AI OCR</span>
            </button>

            <button
              id="play-store-btn"
              onClick={onOpenPlayStore}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors cursor-pointer"
              title="Google Play Store & Android Integration"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Play Store</span>
            </button>

            <button
              id="history-drawer-btn"
              onClick={onOpenHistory}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Recent Downloads & Processed Files"
            >
              <Clock className="w-5 h-5" />
              {historyCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full flex items-center justify-center">
                  {historyCount > 9 ? '9+' : historyCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100 text-slate-800 placeholder-slate-400 rounded-lg border border-transparent focus:border-red-500 focus:bg-white outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

