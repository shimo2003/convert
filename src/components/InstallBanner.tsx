import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  X, 
  Sparkles, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface InstallBannerProps {
  onOpenPlayStoreModal: () => void;
  deferredPrompt: any;
  onTriggerInstall: () => void;
  isInstalled: boolean;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({
  onOpenPlayStoreModal,
  deferredPrompt,
  onTriggerInstall,
  isInstalled,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('pdf_suite_android_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch (e) {}
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('pdf_suite_android_banner_dismissed', 'true');
    } catch (e) {}
  };

  if (isDismissed || isInstalled) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 text-white px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-100">Android &amp; Google Play Store Integration</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                TWA / PWA
              </span>
            </div>
            <p className="text-slate-400 text-[11px] hidden sm:block">
              Install as a standalone Android app with camera scanner or export Google Play Store Bundle (.aab).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {deferredPrompt ? (
            <button
              onClick={onTriggerInstall}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          ) : null}

          <button
            onClick={onOpenPlayStoreModal}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Play Store Hub &amp; Export</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
