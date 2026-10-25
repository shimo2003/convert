import React, { useRef, useState, useEffect } from 'react';
import { Pen, Type, RotateCcw, Check, Calendar, User } from 'lucide-react';

interface SignaturePadProps {
  onSignatureCreated: (dataUrl: string, signerName?: string, dateStamp?: string) => void;
  onCancel: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureCreated, onCancel }) => {
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [fontFamily, setFontFamily] = useState<'cursive' | 'serif' | 'sans-serif'>('cursive');
  const [strokeColor, setStrokeColor] = useState('#0f172a');
  const [includeDate, setIncludeDate] = useState(true);
  const [dateText, setDateText] = useState(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = strokeColor;
  }, [strokeColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSaveSignature = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureCreated(dataUrl, typedName, includeDate ? dateText : undefined);
    } else {
      if (!typedName.trim()) return;
      // Render typed text to a temporary canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 400;
      tempCanvas.height = 150;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.fillStyle = strokeColor;
      
      if (fontFamily === 'cursive') {
        ctx.font = 'italic 38px "Brush Script MT", "Segoe Script", cursive';
      } else if (fontFamily === 'serif') {
        ctx.font = 'italic 34px "Times New Roman", serif';
      } else {
        ctx.font = 'italic 32px Helvetica, Arial, sans-serif';
      }

      ctx.fillText(typedName, 20, 70);

      if (includeDate) {
        ctx.font = '12px Helvetica, Arial, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`Signed: ${dateText}`, 20, 110);
      }

      const dataUrl = tempCanvas.toDataURL('image/png');
      onSignatureCreated(dataUrl, typedName, includeDate ? dateText : undefined);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl max-w-lg mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Create Signature & Stamp</h3>
          <p className="text-xs text-slate-500">Draw or type your signature to place on any document page</p>
        </div>

        {/* Mode selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('draw')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'draw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            <span>Draw</span>
          </button>
          <button
            onClick={() => setMode('type')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'type' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type</span>
          </button>
        </div>
      </div>

      {/* Signature Area */}
      {mode === 'draw' ? (
        <div>
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 overflow-hidden mb-3">
            <canvas
              ref={canvasRef}
              width={460}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-44 cursor-crosshair touch-none"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-sm font-medium">
                Sign here with your mouse or stylus
              </div>
            )}
            <button
              onClick={clearCanvas}
              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-slate-500 hover:text-red-600 rounded-md border border-slate-200 text-xs font-medium flex items-center gap-1 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="e.g. Alexander Hamilton"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Style:</span>
            <button
              onClick={() => setFontFamily('cursive')}
              className={`px-3 py-1 text-xs rounded-md border font-serif italic ${
                fontFamily === 'cursive' ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold' : 'border-slate-200 text-slate-600'
              }`}
            >
              Cursive Script
            </button>
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-3 py-1 text-xs rounded-md border font-serif ${
                fontFamily === 'serif' ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold' : 'border-slate-200 text-slate-600'
              }`}
            >
              Formal Serif
            </button>
          </div>

          {/* Preview of typed signature */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center min-h-[90px] flex items-center justify-center">
            {typedName ? (
              <span
                style={{
                  color: strokeColor,
                  fontFamily: fontFamily === 'cursive' ? 'cursive, "Brush Script MT"' : fontFamily === 'serif' ? 'serif, "Times New Roman"' : 'sans-serif',
                  fontSize: '28px',
                  fontStyle: 'italic',
                }}
              >
                {typedName}
              </span>
            ) : (
              <span className="text-xs text-slate-400">Type your name above to generate preview</span>
            )}
          </div>
        </div>
      )}

      {/* Stroke Color & Date options */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Ink:</span>
          {['#0f172a', '#1d4ed8', '#b91c1c'].map((color) => (
            <button
              key={color}
              onClick={() => setStrokeColor(color)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                strokeColor === color ? 'scale-110 border-slate-800 shadow-xs' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={includeDate}
            onChange={(e) => setIncludeDate(e.target.checked)}
            className="rounded text-purple-600 focus:ring-purple-500"
          />
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Add Date Stamp ({dateText})</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveSignature}
          disabled={mode === 'draw' ? !hasDrawn : !typedName.trim()}
          className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply Signature</span>
        </button>
      </div>
    </div>
  );
};
