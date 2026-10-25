import React from 'react';
import { 
  Grid, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Layers, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { ToolCategory } from '../types';

interface CategoryTabsProps {
  activeCategory: ToolCategory;
  onSelectCategory: (cat: ToolCategory) => void;
}

const CATEGORIES: Array<{ id: ToolCategory; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'all', label: 'All Tools', icon: Grid },
  { id: 'convert-to-pdf', label: 'Convert to PDF', icon: ArrowDownToLine },
  { id: 'convert-from-pdf', label: 'Convert from PDF', icon: ArrowUpFromLine },
  { id: 'organize', label: 'Organize & Split', icon: Layers },
  { id: 'optimize-secure', label: 'Compress & Sign', icon: ShieldCheck },
  { id: 'ai-smart', label: 'AI Document Tools', icon: Sparkles },
];

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            id={`category-tab-${cat.id}`}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};
