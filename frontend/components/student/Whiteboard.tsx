/**
 * Whiteboard.tsx - Interactive HTML5 Canvas Drawing Board
 * 
 * Features:
 * - Freehand drawing with mouse/touch
 * - Color picker (Black, Red, Blue, Green)
 * - Eraser tool
 * - Brush size adjustment
 * - Clear board
 * - Save as image (PNG)
 * - Full-screen modal
 */

import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { 
  X, Download, Trash2, PenTool, Eraser, 
  Minus, Plus, Palette, Circle
} from 'lucide-react';

// --- TYPES ---
interface WhiteboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DrawingState {
  isDrawing: boolean;
  lastX: number;
  lastY: number;
}

// --- CONSTANTS ---
const COLORS = [
  { name: 'Siyah', value: '#1e293b' },
  { name: 'Kirmizi', value: '#ef4444' },
  { name: 'Mavi', value: '#3b82f6' },
  { name: 'Yesil', value: '#22c55e' },
  { name: 'Mor', value: '#a855f7' },
  { name: 'Turuncu', value: '#f97316' },
];

const BRUSH_SIZES = [2, 4, 8, 12, 20];

// --- WHITEBOARD COMPONENT ---
export const Whiteboard: React.FC<WhiteboardProps> = memo(({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState(COLORS[0].value);
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
  });

  // Initialize canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Save current drawing
      const imageData = canvas.toDataURL();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      const context = canvas.getContext('2d');
      if (context) {
        context.scale(dpr, dpr);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        // Fill with white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, rect.width, rect.height);
        
        // Restore previous drawing if exists
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, 0, 0, rect.width, rect.height);
        };
        img.src = imageData;
        
        setCtx(context);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isOpen]);

  // Get coordinates from event
  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // Start drawing
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    setDrawingState({
      isDrawing: true,
      lastX: x,
      lastY: y,
    });
  }, [getCoordinates]);

  // Draw
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawingState.isDrawing || !ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(drawingState.lastX, drawingState.lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? brushSize * 3 : brushSize;
    ctx.stroke();

    setDrawingState(prev => ({
      ...prev,
      lastX: x,
      lastY: y,
    }));
  }, [drawingState, ctx, color, brushSize, isEraser, getCoordinates]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    setDrawingState(prev => ({ ...prev, isDrawing: false }));
  }, []);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (!ctx || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [ctx]);

  // Save as image
  const saveAsImage = useCallback(() => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'whiteboard-' + Date.now() + '.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }, []);

  // Select color
  const selectColor = useCallback((newColor: string) => {
    setColor(newColor);
    setIsEraser(false);
  }, []);

  // Toggle eraser
  const toggleEraser = useCallback(() => {
    setIsEraser(prev => !prev);
  }, []);

  // Adjust brush size
  const adjustBrushSize = useCallback((delta: number) => {
    setBrushSize(prev => {
      const currentIndex = BRUSH_SIZES.indexOf(prev);
      const newIndex = Math.max(0, Math.min(BRUSH_SIZES.length - 1, currentIndex + delta));
      return BRUSH_SIZES[newIndex];
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Beyaz Tahta</h2>
            <p className="text-sm text-slate-500">Serbest cizim alani</p>
          </div>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-6">
          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-400" />
            <div className="flex gap-1">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => selectColor(c.value)}
                  className={'w-8 h-8 rounded-full border-2 transition-all ' + (
                    color === c.value && !isEraser
                      ? 'border-indigo-500 scale-110 shadow-lg'
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
            <button
              onClick={() => adjustBrushSize(-1)}
              className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
              disabled={brushSize === BRUSH_SIZES[0]}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center w-8">
              <Circle 
                className="text-slate-600" 
                style={{ width: brushSize + 8, height: brushSize + 8 }}
                fill="currentColor"
              />
            </div>
            <button
              onClick={() => adjustBrushSize(1)}
              className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
              disabled={brushSize === BRUSH_SIZES[BRUSH_SIZES.length - 1]}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Eraser */}
          <button
            onClick={toggleEraser}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg transition-all ' + (
              isEraser
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            <Eraser className="w-4 h-4" />
            Silgi
          </button>

          {/* Clear */}
          <button
            onClick={clearCanvas}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Temizle
          </button>

          {/* Save */}
          <button
            onClick={saveAsImage}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Kaydet
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 m-4 bg-white rounded-2xl shadow-2xl overflow-hidden cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="touch-none"
        />
      </div>

      {/* Footer Hint */}
      <div className="text-center py-3 text-slate-400 text-sm">
        Cizmek icin fareyi surukle - Silgi ile hatalari duzelt - Kaydet butonu ile PNG olarak indir
      </div>
    </div>
  );
});

Whiteboard.displayName = 'Whiteboard';

export default Whiteboard;




