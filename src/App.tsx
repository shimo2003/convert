import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ToolWorkspace } from './components/ToolWorkspace';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AndroidPlayStoreModal } from './components/AndroidPlayStoreModal';
import { AndroidCameraScannerModal } from './components/AndroidCameraScannerModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { InstallBanner } from './components/InstallBanner';
import { TOOLS_LIST } from './data/toolsData';
import { ToolDefinition, ToolCategory, ProcessedResult } from './types';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);
  const [initialFiles, setInitialFiles] = useState<File[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<ProcessedResult[]>([]);

  // Android & PWA Integration State
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Catch PWA beforeinstallprompt on Android / Chromium
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if launched as standalone PWA / TWA on Android
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger Android native installation prompt
  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setIsPlayStoreModalOpen(true);
    }
  };

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pdf_suite_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (e) {
      console.warn('Could not read history from localStorage');
    }
  }, []);

  // Save history to localStorage
  const handleSaveHistory = (newResult: ProcessedResult) => {
    setHistory((prev) => {
      const cleanHistory = [newResult, ...prev.slice(0, 19)];
      try {
        const serializable = cleanHistory.map(({ fileBlob, ...rest }) => rest);
        localStorage.setItem('pdf_suite_history', JSON.stringify(serializable));
      } catch (e) {
        console.warn('Could not save history to localStorage');
      }
      return cleanHistory;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('pdf_suite_history');
    } catch (e) {}
  };

  const handleSelectTool = (tool: ToolDefinition, stagedFiles?: File[]) => {
    setActiveTool(tool);
    setInitialFiles(stagedFiles || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setActiveTool(null);
    setInitialFiles([]);
  };

  const handleOpenQuickAI = () => {
    const aiTool = TOOLS_LIST.find((t) => t.id === 'ai-ocr') || TOOLS_LIST[0];
    handleSelectTool(aiTool);
  };

  // Handle Scanned pages from Android Camera
  const handleScannedPages = (scannedFiles: File[], targetToolId: 'image-to-pdf' | 'ai-ocr' = 'image-to-pdf') => {
    const targetTool = TOOLS_LIST.find((t) => t.id === targetToolId) || TOOLS_LIST.find((t) => t.id === 'image-to-pdf') || TOOLS_LIST[0];
    handleSelectTool(targetTool, scannedFiles);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white pb-16 md:pb-0">
      {/* Android / Play Store Banner */}
      <InstallBanner
        onOpenPlayStoreModal={() => setIsPlayStoreModalOpen(true)}
        deferredPrompt={deferredPrompt}
        onTriggerInstall={handleTriggerInstall}
        isInstalled={isInstalled}
      />

      {/* Top Navigation */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenQuickAI={handleOpenQuickAI}
        onOpenPlayStore={() => setIsPlayStoreModalOpen(true)}
        onOpenScanner={() => setIsScannerModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1">
        {activeTool ? (
          <ToolWorkspace
            tool={activeTool}
            initialFiles={initialFiles}
            onBack={handleBackToDashboard}
            onSaveHistory={handleSaveHistory}
            onOpenScanner={() => setIsScannerModalOpen(true)}
          />
        ) : (
          <Dashboard
            tools={TOOLS_LIST}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSelectTool={handleSelectTool}
            onOpenScanner={() => setIsScannerModalOpen(true)}
            onOpenPlayStore={() => setIsPlayStoreModalOpen(true)}
          />
        )}
      </main>

      {/* Conversion History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
      />

      {/* Android & Google Play Store Integration Modal */}
      <AndroidPlayStoreModal
        isOpen={isPlayStoreModalOpen}
        onClose={() => setIsPlayStoreModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onTriggerInstall={handleTriggerInstall}
        isInstalled={isInstalled}
      />

      {/* Android Camera Document Scanner Modal */}
      <AndroidCameraScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onScannedPages={handleScannedPages}
      />

      {/* Mobile Android Bottom Navigation Bar */}
      <MobileBottomNav
        onGoHome={handleBackToDashboard}
        onOpenScanner={() => setIsScannerModalOpen(true)}
        onOpenAI={handleOpenQuickAI}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPlayStore={() => setIsPlayStoreModalOpen(true)}
        historyCount={history.length}
        isHomeActive={activeTool === null}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 mt-12 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">PDF Suite</span>
            <span>•</span>
            <span>All-in-One Document &amp; PDF Converter (Android &amp; Web)</span>
          </div>
          <div className="flex items-center gap-4">
            <span onClick={() => setIsPlayStoreModalOpen(true)} className="hover:text-red-600 font-semibold cursor-pointer">
              Google Play Store APK
            </span>
            <span>•</span>
            <span onClick={() => setIsScannerModalOpen(true)} className="hover:text-slate-900 cursor-pointer">
              Camera Scanner
            </span>
            <span onClick={() => handleSelectTool(TOOLS_LIST[0])} className="hover:text-slate-900 cursor-pointer">
              Merge PDF
            </span>
            <span onClick={() => handleSelectTool(TOOLS_LIST[2])} className="hover:text-slate-900 cursor-pointer">
              Compress PDF
            </span>
            <span onClick={() => handleSelectTool(TOOLS_LIST[3])} className="hover:text-slate-900 cursor-pointer">
              Word to PDF
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
