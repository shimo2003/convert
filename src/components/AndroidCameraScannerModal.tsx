import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  RefreshCw, 
  Check, 
  Trash2, 
  FileText, 
  Layers, 
  Sparkles, 
  Sliders, 
  ArrowRight,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

interface AndroidCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScannedPages: (files: File[], targetToolId?: 'image-to-pdf' | 'ai-ocr') => void;
}

export const AndroidCameraScannerModal: React.FC<AndroidCameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScannedPages,
}) => {
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'normal' | 'bw' | 'grayscale'>('normal');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(err.message || 'Could not access camera. Please allow camera permissions.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedPages([]);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply document filter if B&W or Grayscale
    if (selectedFilter !== 'normal') {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        if (selectedFilter === 'bw') {
          // Document High-contrast B&W threshold
          v = v > 125 ? 255 : Math.max(0, v * 0.4);
        }

        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPages((prev) => [...prev, dataUrl]);

    // Android tactile haptic vibration feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  const handleRemovePage = (index: number) => {
    setCapturedPages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleFallbackFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files) as File[];
      fileList.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (re) => {
          if (re.target?.result) {
            setCapturedPages((prev) => [...prev, re.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleFinishScanning = (targetToolId: 'image-to-pdf' | 'ai-ocr' = 'image-to-pdf') => {
    if (capturedPages.length === 0) return;
    const files = capturedPages.map((dataUrl, idx) =>
      dataURLtoFile(dataUrl, `scanned_page_${idx + 1}.jpg`)
    );
    stopCamera();
    onScannedPages(files, targetToolId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl max-w-2xl w-full max-h-[96vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-white">Android Document Scanner</h3>
              <p className="text-[11px] text-slate-400">Scan physical receipts, pages, or forms directly to PDF</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwitchCamera}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Switch Camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder Container */}
        <div className="flex-1 bg-black relative flex items-center justify-center min-h-[300px] overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-4 max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Camera Access Blocked or Unavailable</h4>
                <p className="text-xs text-slate-400 mt-1">{cameraError}</p>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFallbackFileInput}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Choose / Snap via Native Android Camera</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Document Border Overlay */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-red-500/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-md" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-md" />
                </div>
                <div className="text-center">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-bold text-slate-200 border border-white/10 shadow-sm">
                    Align document inside frame
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-md" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-white rounded-br-md" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filter Selection Controls */}
        <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scan Filter:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedFilter('normal')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'normal'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Full Color
            </button>
            <button
              onClick={() => setSelectedFilter('bw')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'bw'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              B&amp;W Document
            </button>
            <button
              onClick={() => setSelectedFilter('grayscale')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'grayscale'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Grayscale
            </button>
          </div>
        </div>

        {/* Thumbnails of captured pages */}
        {capturedPages.length > 0 && (
          <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center gap-3 overflow-x-auto shrink-0">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
              {capturedPages.length} {capturedPages.length === 1 ? 'Page' : 'Pages'} Scanned:
            </span>
            {capturedPages.map((src, i) => (
              <div key={i} className="relative group shrink-0 w-12 h-16 rounded-lg overflow-hidden border border-slate-700">
                <img src={src} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemovePage(i)}
                  className="absolute inset-0 bg-red-950/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 right-0 px-1 bg-black/70 text-[9px] text-white font-bold">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Shutter and Action Buttons */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              ref={fileInputRef}
              onChange={handleFallbackFileInput}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Upload file or use native android camera"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Upload / Gallery</span>
            </button>
          </div>

          {/* Shutter Button */}
          <button
            onClick={handleCapture}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white flex items-center justify-center p-1.5 shadow-xl shadow-red-600/40 border-4 border-slate-900 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
          </button>

          {/* Complete Scanning Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFinishScanning('image-to-pdf')}
              disabled={capturedPages.length === 0}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>To PDF ({capturedPages.length})</span>
            </button>

            <button
              onClick={() => handleFinishScanning('ai-ocr')}
              disabled={capturedPages.length === 0}
              className="px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Scan and extract text with Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI OCR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
