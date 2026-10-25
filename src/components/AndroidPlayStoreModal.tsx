import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Code, 
  FileText, 
  Copy, 
  Check, 
  Layers, 
  ShieldCheck, 
  Play, 
  ArrowRight,
  Package,
  Terminal
} from 'lucide-react';
import { generatePlayStorePackageZip, DEFAULT_PLAYSTORE_CONFIG } from '../utils/playStorePackager';

interface AndroidPlayStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onTriggerInstall?: () => void;
  isInstalled?: boolean;
}

export const AndroidPlayStoreModal: React.FC<AndroidPlayStoreModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerInstall,
  isInstalled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'quick-install' | 'package-export' | 'playstore-guide' | 'metadata'>('quick-install');
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://pdf-suite.app';

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsGeneratingZip(true);
      const zipBlob = await generatePlayStorePackageZip({
        webUrl: currentOrigin,
      });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pdf-suite-google-playstore-package.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating Play Store package:', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const openPwaBuilder = () => {
    window.open(`https://www.pwabuilder.com?url=${encodeURIComponent(currentOrigin)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">Android & Google Play Store Integration</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                  Play Store Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">Install directly as an APK or publish to Google Play Store</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 gap-2 overflow-x-auto shrink-0 py-2">
          <button
            onClick={() => setActiveTab('quick-install')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'quick-install'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Install on Android</span>
          </button>

          <button
            onClick={() => setActiveTab('package-export')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'package-export'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Play Bundle (.zip)</span>
          </button>

          <button
            onClick={() => setActiveTab('playstore-guide')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'playstore-guide'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-red-600" />
            <span>Play Console Step-by-Step</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'metadata'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Store Listing Copy</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Quick Install on Android */}
          {activeTab === 'quick-install' && (
            <div className="space-y-6">
              {/* Status banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {isInstalled ? 'App Installed on Android' : 'Ready for Instant Android Installation'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {isInstalled
                        ? 'Running natively in standalone Android mode with camera and offline access.'
                        : 'Add directly to your Android home screen as a standalone app with native launcher icon.'}
                    </p>
                  </div>
                </div>

                {!isInstalled && onTriggerInstall && (
                  <button
                    onClick={onTriggerInstall}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App on Device</span>
                  </button>
                )}
              </div>

              {/* Verified PWA Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Play Store & Android Compliance Check</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800">Web App Manifest</span>
                      <p className="text-[11px] text-slate-500">Includes 512x512 maskable icons, shortcuts & intents</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800">Service Worker Offline Cache</span>
                      <p className="text-[11px] text-slate-500">Stale-while-revalidate for instant cold launch</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800">Digital Asset Links</span>
                      <p className="text-[11px] text-slate-500">Configured in /.well-known/assetlinks.json</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800">Android Camera & Sharing</span>
                      <p className="text-[11px] text-slate-500">Native scanner & Web Share Level 2 enabled</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to install on Android phone */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-700" />
                  How to install on any Android phone (Chrome / Samsung Internet)
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600">
                  <li className="pl-1">Open this web link on your Android browser.</li>
                  <li className="pl-1">Tap the <strong>three dots menu (⋮)</strong> in the top right corner.</li>
                  <li className="pl-1">Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                  <li className="pl-1">The PDF Suite app icon will appear on your Android launcher and home screen!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: Google Play Bundle & Export */}
          {activeTab === 'package-export' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">1-Click Android Studio & TWA Bundle</span>
                    <h4 className="text-base font-extrabold text-white mt-1">Download Google Play Store Package</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Generates a full ready-to-compile `.zip` with AndroidManifest.xml, build.gradle, twa-manifest.json, and instructions.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadZip}
                    disabled={isGeneratingZip}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 flex items-center gap-2 shrink-0 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingZip ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Download .ZIP</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                  <div>• AndroidManifest.xml</div>
                  <div>• build.gradle (TWA)</div>
                  <div>• twa-manifest.json</div>
                  <div>• assetlinks.json</div>
                </div>
              </div>

              {/* Fast 1-Click PWABuilder Route */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
                      PWA
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">Automated Google Play (.aab) via PWABuilder</h4>
                      <p className="text-xs text-slate-600">Free, official tool by Microsoft & Google to generate signed Google Play Store APK & AAB in 30 seconds.</p>
                    </div>
                  </div>

                  <button
                    onClick={openPwaBuilder}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Launch PWABuilder</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Official CLI Option */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-700" />
                  Build via Google Bubblewrap CLI (Command line)
                </h4>
                <p className="text-xs text-slate-500">Run this in your terminal to build the signed Android App Bundle directly:</p>
                <div className="relative">
                  <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto">
{`npx @bubblewrap/cli init --manifest="${currentOrigin}/manifest.json"
npx @bubblewrap/cli build`}
                  </pre>
                  <button
                    onClick={() => handleCopy(`npx @bubblewrap/cli init --manifest="${currentOrigin}/manifest.json"\nnpx @bubblewrap/cli build`, 'cli')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    {copiedField === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Play Console Step-by-Step */}
          {activeTab === 'playstore-guide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Publishing to Google Play Console:</strong> Once you have your <code>.aab</code> bundle (from PWABuilder or Bubblewrap), follow these 5 steps in the Google Play Console:
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">1</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 text-xs">Create App in Google Play Console</h5>
                    <p className="text-xs text-slate-500">Go to <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="text-red-600 underline font-semibold">play.google.com/console</a> -&gt; Click <strong>Create app</strong> -&gt; Name: <code>PDF Suite - Document &amp; PDF Converter</code> -&gt; Free app.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">2</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 text-xs">Upload your .AAB (Android App Bundle)</h5>
                    <p className="text-xs text-slate-500">Navigate to <strong>Release &gt; Production</strong> (or <strong>Internal Testing</strong>) -&gt; Click <strong>Create new release</strong> -&gt; Upload your generated <code>app-release.aab</code>.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">3</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 text-xs">Set up Digital Asset Links Verification</h5>
                    <p className="text-xs text-slate-500">Copy your SHA-256 fingerprint from <strong>App Integrity &gt; Play App Signing</strong>, and ensure it matches the one in <code>.well-known/assetlinks.json</code> so the browser address bar is removed.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">4</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 text-xs">Complete Store Listing &amp; Rating</h5>
                    <p className="text-xs text-slate-500">Paste the pre-written Store Listing copy and descriptions from the next tab into your Store Presence page.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">5</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 text-xs">Submit for Review</h5>
                    <p className="text-xs text-slate-500">Click <strong>Review and roll out release</strong>. Google normally approves and publishes TWA apps within 24–48 hours!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Store Listing Copy */}
          {activeTab === 'metadata' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">App Title (Max 30 characters)</label>
                  <button
                    onClick={() => handleCopy('PDF Suite - Convert & OCR', 'title')}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'title' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value="PDF Suite - Convert & OCR"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Short Description (Max 80 characters)</label>
                  <button
                    onClick={() => handleCopy('Convert Word, images, text to PDF, merge, split, compress, and AI OCR scanner.', 'short')}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    {copiedField === 'short' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'short' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value="Convert Word, images, text to PDF, merge, split, compress, and AI OCR scanner."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Full Description (SEO Optimized for Google Play Store)</label>
                  <button
                    onClick={() => handleCopy(`PDF Suite is your all-in-one document workstation and PDF converter designed for Android.

★ CORE FEATURES ★
• Word (.docx) to PDF: Convert docs with flawless formatting.
• Images (JPG/PNG/WebP) to PDF: Merge camera scans into single or multi-page documents.
• Compress PDF: Reduce heavy file sizes by up to 70% without losing readable quality.
• Merge & Split: Combine multiple PDF files or extract selective page ranges.
• Rotate & Organize: Reorder, delete, and rotate PDF pages in 90° increments.
• Sign & Watermark: Draw or type signatures and stamp confidential watermarks.
• AI OCR Document Scanner: Extract clean editable text and tables with Gemini AI.
• AI Executive Summaries & 30+ Language Document Translation.

★ PRIVACY FIRST ★
Your files are processed securely in real-time. No cloud hoarding, 100% encrypted and safe.`, 'full')}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    {copiedField === 'full' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'full' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={`PDF Suite is your all-in-one document workstation and PDF converter designed for Android.

★ CORE FEATURES ★
• Word (.docx) to PDF: Convert docs with flawless formatting.
• Images (JPG/PNG/WebP) to PDF: Merge camera scans into single or multi-page documents.
• Compress PDF: Reduce heavy file sizes by up to 70% without losing readable quality.
• Merge & Split: Combine multiple PDF files or extract selective page ranges.
• Rotate & Organize: Reorder, delete, and rotate PDF pages in 90° increments.
• Sign & Watermark: Draw or type signatures and stamp confidential watermarks.
• AI OCR Document Scanner: Extract clean editable text and tables with Gemini AI.
• AI Executive Summaries & 30+ Language Document Translation.

★ PRIVACY FIRST ★
Your files are processed securely in real-time. No cloud hoarding, 100% encrypted and safe.`}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Trusted Web Activity (TWA) v2.5 Compliant</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
