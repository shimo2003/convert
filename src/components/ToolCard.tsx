import React from 'react';
import { 
  Layers, 
  Scissors, 
  Minimize2, 
  FileText, 
  Image as ImageIcon, 
  Images, 
  FileCode, 
  Table, 
  RotateCw, 
  Stamp, 
  Hash, 
  PenTool, 
  Sparkles, 
  Bot, 
  Languages, 
  ArrowRight
} from 'lucide-react';
import { ToolDefinition } from '../types';

interface ToolCardProps {
  tool: ToolDefinition;
  onClick: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Scissors,
  Minimize2,
  FileText,
  Image: ImageIcon,
  Images,
  FileCode,
  Table,
  RotateCw,
  Stamp,
  Hash,
  PenTool,
  Sparkles,
  Bot,
  Languages,
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const IconComponent = ICON_MAP[tool.iconName] || FileText;

  return (
    <div
      id={`tool-card-${tool.id}`}
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer overflow-hidden"
    >
      {/* Top Accent Light Glow */}
      <div 
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-xl pointer-events-none"
        style={{ backgroundColor: tool.color }}
      />

      <div>
        {/* Header with Icon & Badge */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs"
            style={{ backgroundColor: tool.accentBg, color: tool.color }}
          >
            <IconComponent className="w-6 h-6" />
          </div>

          {tool.badge && (
            <span 
              className="px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider"
              style={{ 
                backgroundColor: tool.accentBg, 
                color: tool.color 
              }}
            >
              {tool.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-slate-900 group-hover:text-red-600 transition-colors mb-1.5 flex items-center gap-1">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {tool.shortDesc}
        </p>
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-red-600 transition-colors">
        <span>Use Tool</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
