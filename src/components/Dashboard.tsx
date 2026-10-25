import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Layers, 
  FileText, 
  ArrowRight,
  Star,
  Smartphone,
  Camera,
  Play,
  CheckCircle2
} from 'lucide-react';
import { ToolDefinition, ToolCategory, ToolId } from '../types';
import { CategoryTabs } from './CategoryTabs';
import { ToolCard } from './ToolCard';
import { UniversalDropzone } from './UniversalDropzone';

interface DashboardProps {
  tools: ToolDefinition[];
  selectedCategory: ToolCategory;
  onSelectCategory: (cat: ToolCategory) => void;
  searchQuery: string;
  onSelectTool: (tool: ToolDefinition, stagedFiles?: File[]) => void;
  onOpenScanner?: () => void;
  onOpenPlayStore?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tools,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSelectTool,
  onOpenScanner,
  onOpenPlayStore,
}) => {
  // Filter tools by category and search query
  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' ? true : tool.category === selectedCategory;

    const matchesSearch = searchQuery.trim() === ''
      ? true
      : tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleUniversalFiles = (files: File[], recommendedToolId?: ToolId) => {
    const targetTool =
      tools.find((t) => t.id === recommendedToolId) ||
      tools.find((t) => t.id === 'merge') ||
      tools[0];

    onSelectTool(targetTool, files);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero & Universal Dropzone Area */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 rounded-full text-xs font-bold text-red-600 shadow-2xs">
          <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
          <span>Every tool you need to work with PDFs and Documents</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Convert, Merge, Split &amp; Compress{' '}
          <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
            Documents to PDF
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
          Fast, 100% private document converter for Web &amp; Android. Turn Word, images, sheets, and text into PDF, organize pages, and use AI OCR with one click.
        </p>
      </div>

      {/* Dropzone */}
      <div className="max-w-4xl mx-auto">
        <UniversalDropzone 
          onFilesSelected={handleUniversalFiles}
          onOpenScanner={onOpenScanner}
        />
      </div>

      {/* Android Play Store Quick Card */}
      {onOpenPlayStore && (
        <div className="max-w-4xl mx-auto p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h3 className="font-extrabold text-sm sm:text-base text-white">Google Play Store &amp; Android Ready</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  TWA Compliant
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Download ready-to-publish Google Play App Bundle (.aab), Digital Asset Links, and install as native Android APK.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenPlayStore}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Play Store Hub &amp; APK</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
        <CategoryTabs
          activeCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />

        <div className="text-xs font-semibold text-slate-400">
          Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <p className="font-bold text-slate-700 text-base">No tools matched your search</p>
          <p className="text-xs text-slate-400 mt-1">Try searching for &quot;merge&quot;, &quot;compress&quot;, &quot;word&quot;, or &quot;sign&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onClick={() => onSelectTool(tool)}
            />
          ))}
        </div>
      )}

      {/* Value Badges Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-200/80">
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">100% Secure &amp; Private</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Documents are processed directly in your browser without sensitive storage.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Gemini AI Intelligence</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Extract OCR text, summarize multi-page files, and translate in 30+ languages.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Lightning Fast Conversions</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Compress up to 70% file size reduction with high structural precision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
