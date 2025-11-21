
import React, { useState, useRef, useEffect } from 'react';
import { Check, X, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  aspectRatio: number; // e.g., 1 for square, 3 for cover
  onCrop: (blob: Blob) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, aspectRatio, onCrop, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    imageRef.current.src = imageSrc;
    imageRef.current.onload = () => {
       // Force re-render to ensure canvas draws
       setZoom(1.0001); 
    };
  }, [imageSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    // Calculate height based on aspect ratio relative to container width
    // We want the "crop box" to fit within the container.
    const cropBoxWidth = containerWidth * 0.9; 
    const cropBoxHeight = cropBoxWidth / aspectRatio;

    canvas.width = cropBoxWidth;
    canvas.height = cropBoxHeight;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Image with transformations
    const img = imageRef.current;
    if (!img.width) return;

    // Calculate scaling to "cover" the canvas
    const scaleX = canvas.width / img.width;
    const scaleY = canvas.height / img.height;
    const baseScale = Math.max(scaleX, scaleY);
    const finalScale = baseScale * zoom;

    const drawnWidth = img.width * finalScale;
    const drawnHeight = img.height * finalScale;

    // Center image + offset
    const x = (canvas.width - drawnWidth) / 2 + offset.x;
    const y = (canvas.height - drawnHeight) / 2 + offset.y;

    ctx.drawImage(img, x, y, drawnWidth, drawnHeight);

  }, [zoom, offset, imageSrc, aspectRatio]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling on mobile
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setOffset({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) onCrop(blob);
      }, 'image/jpeg', 0.9);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col items-center justify-center animate-fade-in">
      <div className="w-full px-6 py-4 flex justify-between items-center text-white bg-black/50 absolute top-0 z-10">
        <button onClick={onCancel} className="flex items-center gap-2 text-gray-300 hover:text-white">
            <X size={24} /> Cancel
        </button>
        <span className="font-bold text-lg">Adjust Image</span>
        <button onClick={handleCrop} className="flex items-center gap-2 text-brand-accent font-bold hover:text-white">
            <Check size={24} /> Done
        </button>
      </div>

      <div 
        ref={containerRef}
        className="w-full max-w-lg aspect-square flex items-center justify-center relative overflow-hidden bg-zinc-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <canvas ref={canvasRef} className="shadow-2xl border-2 border-white/20" />
        
        {/* Overlay hint */}
        <div className="absolute pointer-events-none flex items-center justify-center opacity-50">
             <Move className="text-white drop-shadow-md" size={48} />
        </div>
      </div>

      <div className="w-full max-w-md px-8 mt-8 space-y-4">
        <div className="flex items-center gap-4 text-gray-400">
             <ZoomOut size={20}/>
             <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.1" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
             />
             <ZoomIn size={20}/>
        </div>
        <p className="text-center text-gray-500 text-sm">Drag to pan, use slider to zoom</p>
      </div>
    </div>
  );
};

export default ImageCropper;
