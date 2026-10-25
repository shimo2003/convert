import React from 'react';
import { 
  Grid, 
  Camera, 
  Sparkles, 
  History, 
  Smartphone,
  Layers
} from 'lucide-react';

interface MobileBottomNavProps {
  onGoHome: () => void;
  onOpenScanner: () => void;
  onOpenAI: () => void;
  onOpenHistory: () => void;
  onOpenPlayStore: () => void;
  historyCount: number;
  isHomeActive: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onGoHome,
  onOpenScanner,
  onOpenAI,
  onOpenHistory,
  onOpenPlayStore,
  historyCount,
  isHomeActive,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 safe-area-pb shadow-lg">
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        {/* Home / Tools */}
        <button
          onClick={onGoHome}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            isHomeActive ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Tools</span>
        </button>

        {/* Scan Camera */}
        <button
          onClick={onOpenScanner}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 hover:text-red-600 transition-all cursor-pointer"
        >
          <div className="relative">
            <Camera className="w-5 h-5 text-slate-700" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] mt-0.5">Scan</span>
        </button>

        {/* AI OCR / Hub */}
        <button
          onClick={onOpenAI}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-rose-600 hover:text-rose-700 transition-all cursor-pointer font-semibold"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-500/20 -mt-3 border-2 border-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">AI OCR</span>
        </button>

        {/* History */}
        <button
          onClick={onOpenHistory}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
        >
          <div className="relative">
            <History className="w-5 h-5" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1.5 px-1 min-w-[14px] h-[14px] rounded-full bg-red-600 text-white text-[8px] font-black flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">History</span>
        </button>

        {/* Play Store & Android */}
        <button
          onClick={onOpenPlayStore}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
        >
          <div className="relative">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <span className="absolute -top-1 -right-1.5 px-1 bg-emerald-100 text-emerald-700 border border-emerald-300 text-[7px] font-black rounded-full">
              APK
            </span>
          </div>
          <span className="text-[10px] mt-0.5">Play Store</span>
        </button>
      </div>
    </div>
  );
};
