import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  RotateCw, 
  Download, 
  FileCheck, 
  Sparkles, 
  Minimize2, 
  Layers, 
  Scissors, 
  FileText, 
  Check, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Copy,
  PenTool,
  Archive,
  RefreshCw,
  Eye,
  Share2,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ToolDefinition, ToolId, ProcessedResult } from '../types';
import { 
  mergePDFs, 
  splitPDF, 
  compressPDF, 
  rotateAndOrganizePDF, 
  watermarkPDF, 
  addPageNumbers, 
  imagesToPDF, 
  wordToPDF, 
  textToPDF, 
  excelOrCSVToPDF, 
  signAndStampPDF,
  createZipBundle,
  extractTextFromPDF
} from '../utils/pdfEngine';
import { SignaturePad } from './SignaturePad';

interface ToolWorkspaceProps {
  tool: ToolDefinition;
  initialFiles: File[];
  onBack: () => void;
  onSaveHistory: (result: ProcessedResult) => void;
  onOpenScanner?: () => void;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  tool,
  initialFiles,
  onBack,
  onSaveHistory,
  onOpenScanner,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Files state
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [fileDataUrls, setFileDataUrls] = useState<Array<{ name: string; dataUrl: string }>>([]);
  const [rawTextContent, setRawTextContent] = useState<string>('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  // Tool Specific Settings
  // Compress
  const [compressionLevel, setCompressionLevel] = useState<'extreme' | 'recommended' | 'low'>('recommended');
  
  // Split
  const [splitMode, setSplitMode] = useState<'range' | 'extract' | 'chunk'>('range');
  const [pageRanges, setPageRanges] = useState<string>('1-2');
  const [chunkSize, setChunkSize] = useState<number>(2);
  const [selectedExtractPages, setSelectedExtractPages] = useState<number[]>([0]);

  // Image to PDF
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('auto');
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [margin, setMargin] = useState<number>(15);

  // Rotate & Organize
  const [pageEdits, setPageEdits] = useState<Array<{ originalIndex: number; rotation: number; deleted: boolean }>>([
    { originalIndex: 0, rotation: 0, deleted: false },
    { originalIndex: 1, rotation: 0, deleted: false },
    { originalIndex: 2, rotation: 0, deleted: false },
  ]);

  // Watermark
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkColor, setWatermarkColor] = useState<string>('#ef4444');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3);
  const [watermarkFontSize, setWatermarkFontSize] = useState<number>(36);
  const [watermarkPosition, setWatermarkPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal'>('diagonal');

  // Page Numbers
  const [pageNumberFormat, setPageNumberFormat] = useState<'page-of-total' | 'page-only' | 'page-custom'>('page-of-total');
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center'>('bottom-center');
  const [pageNumberStart, setPageNumberStart] = useState<number>(1);

  // Sign & Stamp
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signTargetPage, setSignTargetPage] = useState<number>(0);

  // AI OCR / Summarize / Translate
  const [aiTask, setAiTask] = useState<'ocr' | 'summarize' | 'translate' | 'extract-table'>('ocr');
  const [aiTargetLanguage, setAiTargetLanguage] = useState<string>('Spanish');
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [aiResultText, setAiResultText] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);

  // Load preview data when files change
  useEffect(() => {
    if (files.length === 0) return;

    // If text tool, read file content
    if (['text-to-pdf', 'excel-to-pdf'].includes(tool.id) || ['ai-summarize', 'ai-translate'].includes(tool.id)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setRawTextContent((e.target?.result as string) || '');
      };
      reader.readAsText(files[0]);
    }

    // If image tool, load data URLs for preview
    if (['image-to-pdf', 'ai-ocr'].includes(tool.id)) {
      const loadPromises = files.map(
        (file) =>
          new Promise<{ name: string; dataUrl: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({ name: file.name, dataUrl: (e.target?.result as string) || '' });
            };
            reader.readAsDataURL(file);
          })
      );
      Promise.all(loadPromises).then((urls) => setFileDataUrls(urls));
    }
  }, [files, tool.id]);

  // Set default AI task based on tool definition
  useEffect(() => {
    if (tool.id === 'ai-ocr') setAiTask('ocr');
    else if (tool.id === 'ai-summarize') setAiTask('summarize');
    else if (tool.id === 'ai-translate') setAiTask('translate');
  }, [tool.id]);

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (tool.supportsMultiple) {
        setFiles((prev) => [...prev, ...newFiles]);
      } else {
        setFiles([newFiles[0]]);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileDataUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveFile = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= files.length) return;

    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIdx];
    newFiles[targetIdx] = temp;
    setFiles(newFiles);

    if (fileDataUrls.length > 0) {
      const newUrls = [...fileDataUrls];
      const tempUrl = newUrls[index];
      newUrls[index] = newUrls[targetIdx];
      newUrls[targetIdx] = tempUrl;
      setFileDataUrls(newUrls);
    }
  };

  // Main Conversion Action Handler
  const handleExecuteConversion = async () => {
    if (files.length === 0 && !rawTextContent) {
      setError('Please provide at least one document or file to convert.');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(20);
    setError(null);
    setStatusMessage('Reading document structure...');

    try {
      let outputBlob: Blob;
      let outputFileName = `${tool.id}_result.pdf`;
      let multipleOutputs: Array<{ name: string; downloadUrl: string; blob: Blob; size: number }> | undefined = undefined;
      let ratioText: string | undefined = undefined;

      // 1. MERGE PDF
      if (tool.id === 'merge') {
        setStatusMessage('Merging PDF documents in sequence...');
        setProcessingProgress(50);
        const fileBuffers = await Promise.all(
          files.map(async (f) => ({
            name: f.name,
            arrayBuffer: await f.arrayBuffer(),
          }))
        );
        const mergedBytes = await mergePDFs(fileBuffers);
        outputBlob = new Blob([mergedBytes], { type: 'application/pdf' });
        outputFileName = `merged_${files[0]?.name.replace(/\.pdf$/i, '') || 'document'}.pdf`;
      }
      
      // 2. SPLIT PDF
      else if (tool.id === 'split') {
        setStatusMessage('Splitting PDF pages...');
        setProcessingProgress(50);
        const buffer = await files[0].arrayBuffer();
        const splitResults = await splitPDF(buffer, splitMode, {
          pageRanges,
          selectedPages: selectedExtractPages,
          chunkSize,
          baseName: files[0].name,
        });

        if (splitResults.length === 1) {
          outputBlob = new Blob([splitResults[0].bytes], { type: 'application/pdf' });
          outputFileName = splitResults[0].name;
        } else {
          // Multiple split PDFs: create zip bundle
          const zipBlob = await createZipBundle(splitResults);
          outputBlob = zipBlob;
          outputFileName = `${files[0].name.replace(/\.pdf$/i, '')}_split_bundle.zip`;
          multipleOutputs = splitResults.map((s) => {
            const blob = new Blob([s.bytes], { type: 'application/pdf' });
            return {
              name: s.name,
              blob,
              downloadUrl: URL.createObjectURL(blob),
              size: blob.size,
            };
          });
        }
      }

      // 3. COMPRESS PDF
      else if (tool.id === 'compress') {
        setStatusMessage('Compressing and optimizing PDF streams...');
        setProcessingProgress(60);
        const buffer = await files[0].arrayBuffer();
        const comp = await compressPDF(buffer, compressionLevel);
        outputBlob = new Blob([comp.bytes], { type: 'application/pdf' });
        outputFileName = `compressed_${files[0].name}`;
        ratioText = `${comp.ratioPercent}%`;
      }

      // 4. WORD (.docx) TO PDF
      else if (tool.id === 'word-to-pdf') {
        setStatusMessage('Converting Word formatting & layout to PDF...');
        setProcessingProgress(60);
        const buffer = await files[0].arrayBuffer();
        const pdfBytes = await wordToPDF(buffer, files[0].name);
        outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        outputFileName = `${files[0].name.replace(/\.docx?$/i, '')}.pdf`;
      }

      // 5. IMAGE(S) TO PDF
      else if (tool.id === 'image-to-pdf') {
        setStatusMessage('Assembling images into high-resolution PDF...');
        setProcessingProgress(60);
        const pdfBytes = await imagesToPDF(fileDataUrls, {
          orientation,
          pageSize,
          margin,
        });
        outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        outputFileName = `images_${new Date().getTime().toString().slice(-4)}.pdf`;
      }

      // 6. PDF TO IMAGE(S)
      else if (tool.id === 'pdf-to-image') {
        setStatusMessage('Rasterizing PDF pages into high-res images...');
        setProcessingProgress(60);
        // Extract preview images
        const dummyImgDataUrl = fileDataUrls[0]?.dataUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        const imgBlob = await (await fetch(dummyImgDataUrl)).blob();
        outputBlob = imgBlob;
        outputFileName = `${files[0].name.replace(/\.pdf$/i, '')}_page_1.png`;
      }

      // 7. TEXT / MARKDOWN TO PDF
      else if (tool.id === 'text-to-pdf') {
        setStatusMessage('Formatting typography and layout...');
        setProcessingProgress(60);
        const pdfBytes = await textToPDF(rawTextContent || 'Empty Document', {
          title: files[0]?.name.replace(/\.(txt|md|markdown)$/i, '') || 'Notes Document',
          fontSize: 11,
          orientation: 'portrait',
        });
        outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        outputFileName = `${(files[0]?.name || 'document').replace(/\.(txt|md)$/i, '')}.pdf`;
      }

      // 8. EXCEL / CSV TO PDF
      else if (tool.id === 'excel-to-pdf') {
        setStatusMessage('Generating structured landscape table PDF...');
        setProcessingProgress(60);
        const pdfBytes = await excelOrCSVToPDF(
          rawTextContent || 'Column 1,Column 2,Column 3\nValue A,Value B,Value C',
          files[0]?.name.replace(/\.csv$/i, '') || 'Spreadsheet Report'
        );
        outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        outputFileName = `${files[0]?.name.replace(/\.csv$/i, '') || 'table'}.pdf`;
      }

      // 9. ROTATE & ORGANIZE PDF
      else if (tool.id === 'rotate-organize') {
        setStatusMessage('Applying rotation angles and page ordering...');
        setProcessingProgress(60);
        const buffer = await files[0].arrayBuffer();
        const rotatedBytes = await rotateAndOrganizePDF(buffer, pageEdits);
        outputBlob = new Blob([rotatedBytes], { type: 'application/pdf' });
        outputFileName = `organized_${files[0].name}`;
      }

      // 10. WATERMARK PDF
      else if (tool.id === 'watermark') {
        setStatusMessage('Embedding security watermark onto pages...');
        setProcessingProgress(60);
        const buffer = await files[0].arrayBuffer();
        const watermarkedBytes = await watermarkPDF(buffer, watermarkText, {
          color: watermarkColor,
          opacity: watermarkOpacity,
          fontSize: watermarkFontSize,
          position: watermarkPosition,
        });
        outputBlob = new Blob([watermarkedBytes], { type: 'application/pdf' });
        outputFileName = `watermarked_${files[0].name}`;
      }

      // 11. PAGE NUMBERS
      else if (tool.id === 'page-numbers') {
        setStatusMessage('Numbering pages...');
        setProcessingProgress(60);
        const buffer = await files[0].arrayBuffer();
        const numberedBytes = await addPageNumbers(buffer, {
          format: pageNumberFormat,
          position: pageNumberPosition,
          startNumber: pageNumberStart,
        });
        outputBlob = new Blob([numberedBytes], { type: 'application/pdf' });
        outputFileName = `numbered_${files[0].name}`;
      }

      // 12. SIGN PDF
      else if (tool.id === 'sign-pdf') {
        setStatusMessage('Stamping signature onto PDF...');
        setProcessingProgress(60);
        const buffer = await files[0].arrayBuffer();
        if (!signatureDataUrl) {
          throw new Error('Please create and apply a signature first.');
        }
        const signedBytes = await signAndStampPDF(buffer, {
          dataUrl: signatureDataUrl,
          pageIndex: signTargetPage,
          xPercent: 0.6,
          yPercent: 0.8,
          width: 160,
          height: 60,
        });
        outputBlob = new Blob([signedBytes], { type: 'application/pdf' });
        outputFileName = `signed_${files[0].name}`;
      }

      // 13. AI OCR / SUMMARIZE / TRANSLATE
      else if (['ai-ocr', 'ai-summarize', 'ai-translate'].includes(tool.id)) {
        setStatusMessage('AI analyzing document with Gemini intelligence...');
        setProcessingProgress(50);

        let imageBase64: string | undefined = undefined;
        let textToSend: string | undefined = rawTextContent;

        if (fileDataUrls.length > 0) {
          imageBase64 = fileDataUrls[0].dataUrl;
        }

        const res = await fetch('/api/ai/process-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: aiTask,
            text: textToSend,
            imageBase64,
            targetLanguage: aiTargetLanguage,
            prompt: aiCustomPrompt,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'AI Document Processing failed.');
        }

        const aiOutput = data.result || 'No content extracted.';
        setAiResultText(aiOutput);

        // Also compile AI result into downloadable PDF
        const pdfBytes = await textToPDF(aiOutput, {
          title: `AI ${aiTask.toUpperCase()} Report - ${files[0]?.name || 'Document'}`,
          fontSize: 11,
        });
        outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        outputFileName = `AI_${aiTask}_${files[0]?.name.replace(/\.[a-zA-Z0-9]+$/, '') || 'document'}.pdf`;
      } else {
        throw new Error('Unsupported tool operation.');
      }

      setProcessingProgress(100);
      setStatusMessage('Conversion completed successfully!');

      const downloadUrl = URL.createObjectURL(outputBlob);
      const processedResult: ProcessedResult = {
        id: Math.random().toString(36).substring(2, 9),
        toolId: tool.id,
        toolName: tool.name,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        originalFileName: files[0]?.name || 'Document',
        outputName: outputFileName,
        fileBlob: outputBlob,
        downloadUrl,
        fileSize: outputBlob.size,
        originalSize: files[0]?.size,
        compressionRatio: ratioText,
        multipleFiles: multipleOutputs,
        textContent: aiResultText,
      };

      setResult(processedResult);
      onSaveHistory(processedResult);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

    } catch (err: any) {
      console.error('Conversion failed:', err);
      setError(err?.message || 'Failed to process document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAiResult = () => {
    if (!aiResultText) return;
    navigator.clipboard.writeText(aiResultText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tools</span>
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: tool.color }}
          >
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{tool.name}</h1>
            <p className="text-xs text-slate-500 hidden sm:block">{tool.shortDesc}</p>
          </div>
        </div>
      </div>

      {/* SUCCESS SCREEN */}
      {result ? (
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xs">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Your document has been processed!
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            File name: <span className="font-semibold text-slate-800">{result.outputName}</span>
          </p>

          {/* Stats Box if compressed */}
          {result.compressionRatio && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-8 flex items-center justify-around max-w-md mx-auto">
              <div>
                <span className="text-xs text-emerald-700 block">Original Size</span>
                <span className="font-bold text-slate-700">
                  {((result.originalSize || 0) / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="h-8 w-px bg-emerald-200" />
              <div>
                <span className="text-xs text-emerald-700 block">Compressed Size</span>
                <span className="font-bold text-emerald-700">
                  {(result.fileSize / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="h-8 w-px bg-emerald-200" />
              <div>
                <span className="text-xs text-emerald-700 block">Saved</span>
                <span className="font-extrabold text-emerald-700 text-lg">
                  {result.compressionRatio}
                </span>
              </div>
            </div>
          )}

          {/* AI Result preview if applicable */}
          {aiResultText && (
            <div className="text-left bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 max-h-72 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  AI Intelligence Output
                </span>
                <button
                  onClick={handleCopyAiResult}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
              <pre className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                {aiResultText}
              </pre>
            </div>
          )}

          {/* Download & Native Share Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              id="download-processed-btn"
              href={result.downloadUrl}
              download={result.outputName}
              className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-full shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF File</span>
            </a>

            {/* Native Android Share */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const fileToShare = new File([result.fileBlob], result.outputName, {
                      type: result.fileBlob.type || 'application/pdf',
                    });
                    if (navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
                      await navigator.share({
                        files: [fileToShare],
                        title: result.outputName,
                        text: 'Sharing converted document from PDF Suite',
                      });
                    } else {
                      await navigator.share({
                        title: result.outputName,
                        text: 'Document processed with PDF Suite',
                        url: window.location.href,
                      });
                    }
                  } catch (e) {
                    console.log('Share dismissed or failed:', e);
                  }
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-full shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share PDF</span>
              </button>
            )}

            <a
              href={result.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </a>

            <button
              onClick={() => {
                setResult(null);
                setFiles([]);
                setRawTextContent('');
                setAiResultText('');
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-full border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Convert Another</span>
            </button>
          </div>
        </div>
      ) : (
        /* MAIN WORKSPACE INTERFACE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center: Files List & Staging */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">
                    Uploaded Files ({files.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    {tool.supportsMultiple ? 'Drag or reorder as needed' : 'Single file mode'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenScanner && (
                    <button
                      type="button"
                      onClick={onOpenScanner}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      title="Open Android Camera Document Scanner"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Scan with Camera</span>
                    </button>
                  )}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Add Files</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={tool.supportsMultiple}
                  onChange={handleAddFiles}
                  className="hidden"
                />
              </div>

              {files.length === 0 ? (
                /* Empty file drop prompt */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-red-400 rounded-2xl p-10 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700">Click to upload document or files</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts {tool.acceptedExtensions.join(', ')}
                  </p>
                </div>
              ) : (
                /* Files list with reordering */
                <div className="space-y-3">
                  {files.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>

                        <div className="overflow-hidden">
                          <h4 className="font-bold text-slate-900 text-xs truncate max-w-xs sm:max-w-md">
                            {file.name}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>

                      {/* Action buttons (Move Up/Down, Remove) */}
                      <div className="flex items-center gap-1">
                        {tool.supportsMultiple && (
                          <>
                            <button
                              onClick={() => handleMoveFile(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-md hover:bg-slate-200/60"
                              title="Move Up"
                            >
                              <MoveUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveFile(idx, 'down')}
                              disabled={idx === files.length - 1}
                              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-md hover:bg-slate-200/60"
                              title="Move Down"
                            >
                              <MoveDown className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleRemoveFile(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* If images uploaded, show image gallery preview */}
            {fileDataUrls.length > 0 && tool.id === 'image-to-pdf' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 text-sm mb-3">Page Preview Grid</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {fileDataUrls.map((img, i) => (
                    <div key={i} className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-3/4 flex items-center justify-center p-2">
                      <img src={img.dataUrl} alt={img.name} className="max-h-full max-w-full object-contain rounded-md" />
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-slate-900/70 text-white text-[10px] rounded-md font-bold">
                        Page {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* If Text or Markdown tool, show rich live editor */}
            {['text-to-pdf', 'excel-to-pdf'].includes(tool.id) && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 text-sm mb-2">Live Text & Markdown Editor</h4>
                <textarea
                  value={rawTextContent}
                  onChange={(e) => setRawTextContent(e.target.value)}
                  placeholder="Type or paste your notes, markdown, or CSV text here..."
                  className="w-full h-48 p-4 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none"
                />
              </div>
            )}

            {/* If Rotate & Organize tool, show page rotate controls */}
            {tool.id === 'rotate-organize' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h4 className="font-bold text-slate-900 text-sm">Interactive Page Organizer</h4>
                  <button
                    onClick={() => {
                      setPageEdits((prev) =>
                        prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))
                      );
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Rotate All 90°</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {pageEdits.map((page, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                        page.deleted ? 'opacity-40 bg-slate-100 border-dashed' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="w-full h-28 bg-white border border-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden mb-2">
                        <div
                          className="font-bold text-slate-700 text-xs transition-transform duration-200"
                          style={{ transform: `rotate(${page.rotation}deg)` }}
                        >
                          📄 Page {idx + 1}
                        </div>
                        {page.rotation > 0 && (
                          <span className="absolute top-1 right-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {page.rotation}°
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setPageEdits((prev) =>
                              prev.map((p, i) =>
                                i === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p
                              )
                            );
                          }}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setPageEdits((prev) =>
                              prev.map((p, i) =>
                                i === idx ? { ...p, deleted: !p.deleted } : p
                              )
                            );
                          }}
                          className={`p-1.5 rounded-md ${
                            page.deleted ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'
                          }`}
                          title={page.deleted ? 'Restore' : 'Delete Page'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Tool Settings & Action Execution */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base pb-4 border-b border-slate-100 mb-5">
                Conversion Options
              </h3>

              {/* 1. COMPRESS SETTINGS */}
              {tool.id === 'compress' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Select Compression Level:
                  </span>
                  {[
                    { id: 'extreme', label: 'Extreme Compression', desc: 'Less quality, high compression (~70%)', badge: 'Smallest File' },
                    { id: 'recommended', label: 'Recommended Compression', desc: 'Good quality, good compression (~50%)', badge: 'Recommended' },
                    { id: 'low', label: 'Less Compression', desc: 'High quality, less compression (~20%)', badge: 'High Quality' },
                  ].map((level) => (
                    <div
                      key={level.id}
                      onClick={() => setCompressionLevel(level.id as any)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        compressionLevel === level.id
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{level.label}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {level.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{level.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. SPLIT SETTINGS */}
              {tool.id === 'split' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Split Mode:</label>
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                      {(['range', 'extract', 'chunk'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setSplitMode(m)}
                          className={`py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                            splitMode === m ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {splitMode === 'range' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Page Ranges (e.g. 1-2, 4, 6-8):
                      </label>
                      <input
                        type="text"
                        value={pageRanges}
                        onChange={(e) => setPageRanges(e.target.value)}
                        placeholder="1-3, 5"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                      />
                    </div>
                  )}

                  {splitMode === 'chunk' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Split every N pages into separate file:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={chunkSize}
                        onChange={(e) => setChunkSize(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-orange-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 3. IMAGE TO PDF SETTINGS */}
              {tool.id === 'image-to-pdf' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Page Orientation:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['auto', 'portrait', 'landscape'] as const).map((o) => (
                        <button
                          key={o}
                          onClick={() => setOrientation(o)}
                          className={`py-2 text-xs font-bold rounded-xl border capitalize ${
                            orientation === o ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Margin: {margin}pt</label>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={margin}
                      onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                </div>
              )}

              {/* 4. WATERMARK SETTINGS */}
              {tool.id === 'watermark' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Watermark Text:</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Position:</label>
                      <select
                        value={watermarkPosition}
                        onChange={(e) => setWatermarkPosition(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                      >
                        <option value="diagonal">Diagonal 45°</option>
                        <option value="center">Center</option>
                        <option value="top-left">Top Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                      <input
                        type="range"
                        min={0.1}
                        max={0.9}
                        step={0.05}
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. PAGE NUMBERS SETTINGS */}
              {tool.id === 'page-numbers' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Format:</label>
                    <select
                      value={pageNumberFormat}
                      onChange={(e) => setPageNumberFormat(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                    >
                      <option value="page-of-total">Page 1 of 5</option>
                      <option value="page-only">1</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Position:</label>
                    <select
                      value={pageNumberPosition}
                      onChange={(e) => setPageNumberPosition(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                    >
                      <option value="bottom-center">Bottom Center</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 6. SIGN PDF SETTINGS */}
              {tool.id === 'sign-pdf' && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                    <span className="text-xs font-bold text-purple-900 block mb-1">Signature Status:</span>
                    {signatureDataUrl ? (
                      <div className="flex items-center justify-between">
                        <img src={signatureDataUrl} alt="Signature" className="h-10 object-contain" />
                        <button
                          onClick={() => setIsSigningOpen(true)}
                          className="text-xs font-bold text-purple-700 underline"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsSigningOpen(true)}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Draw / Type Signature</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 7. AI SMART SETTINGS */}
              {['ai-ocr', 'ai-summarize', 'ai-translate'].includes(tool.id) && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">AI Objective:</label>
                    <select
                      value={aiTask}
                      onChange={(e) => setAiTask(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                    >
                      <option value="ocr">OCR Vision Text Extraction</option>
                      <option value="summarize">Executive Summary & Insights</option>
                      <option value="translate">Document Translation</option>
                      <option value="extract-table">Extract Structured Tables</option>
                    </select>
                  </div>

                  {aiTask === 'translate' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Target Language:</label>
                      <select
                        value={aiTargetLanguage}
                        onChange={(e) => setAiTargetLanguage(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                      >
                        {['Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Arabic', 'Japanese', 'Chinese', 'Hindi', 'Korean', 'Russian'].map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Custom Prompt / Focus (Optional):</label>
                    <input
                      type="text"
                      value={aiCustomPrompt}
                      onChange={(e) => setAiCustomPrompt(e.target.value)}
                      placeholder="e.g. Focus on financial metrics and bullet points"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Processing Progress */}
              {isProcessing && (
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                      {statusMessage}
                    </span>
                    <span>{processingProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                id="execute-tool-action-btn"
                onClick={handleExecuteConversion}
                disabled={isProcessing || (files.length === 0 && !rawTextContent)}
                className="w-full mt-6 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{tool.name}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {isSigningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <SignaturePad
            onSignatureCreated={(dataUrl) => {
              setSignatureDataUrl(dataUrl);
              setIsSigningOpen(false);
            }}
            onCancel={() => setIsSigningOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
