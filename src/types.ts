export type ToolCategory = 'all' | 'convert-to-pdf' | 'convert-from-pdf' | 'organize' | 'optimize-secure' | 'ai-smart';

export type ToolId =
  | 'merge'
  | 'split'
  | 'compress'
  | 'word-to-pdf'
  | 'image-to-pdf'
  | 'pdf-to-image'
  | 'pdf-to-text'
  | 'text-to-pdf'
  | 'excel-to-pdf'
  | 'rotate-organize'
  | 'watermark'
  | 'page-numbers'
  | 'sign-pdf'
  | 'protect-pdf'
  | 'ai-ocr'
  | 'ai-summarize'
  | 'ai-translate';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  shortDesc: string;
  category: ToolCategory;
  badge?: string;
  iconName: string;
  color: string;
  accentBg: string;
  acceptedFileTypes: string[];
  acceptedExtensions: string[];
  supportsMultiple: boolean;
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  textPreview?: string;
  pageCount?: number;
  rotation?: number;
  selected?: boolean;
}

export interface ProcessedResult {
  id: string;
  toolId: ToolId;
  toolName: string;
  date: string;
  originalFileName: string;
  outputName: string;
  fileBlob: Blob;
  downloadUrl: string;
  fileSize: number;
  originalSize?: number;
  compressionRatio?: string;
  multipleFiles?: Array<{ name: string; downloadUrl: string; blob: Blob; size: number }>;
  textContent?: string;
}

export interface ConversionSettings {
  // Compress
  compressionLevel: 'extreme' | 'recommended' | 'low';
  // Image to PDF
  orientation: 'portrait' | 'landscape' | 'auto';
  margin: number;
  pageSize: 'a4' | 'letter' | 'fit';
  fitMode: 'contain' | 'cover' | 'fill';
  // Split
  splitMode: 'range' | 'extract' | 'chunk';
  pageRanges: string;
  chunkSize: number;
  selectedPages: number[];
  // Watermark
  watermarkText: string;
  watermarkOpacity: number;
  watermarkRotation: number;
  watermarkFontSize: number;
  watermarkColor: string;
  watermarkPosition: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal';
  // Page Numbers
  pageNumberFormat: 'page-of-total' | 'page-only' | 'page-custom';
  pageNumberCustom: string;
  pageNumberPosition: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center';
  pageNumberStart: number;
  // Sign
  signatureType: 'draw' | 'type';
  signatureText: string;
  signatureFont: string;
  signatureDate: string;
  signerName: string;
  // Password / Protect
  passwordProtection: string;
  // AI
  aiPrompt: string;
  aiLanguage: string;
  aiTask: 'ocr' | 'summarize' | 'translate' | 'extract-table' | 'qa';
}
