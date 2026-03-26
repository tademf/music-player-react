import React, { useEffect, useRef, useState } from 'react';
import { useMusicStore } from '../../store/useMusicStore';

interface WaveformProps {
  audioBuffer: AudioBuffer | null;
  onSeek: (time: number) => void;
}

export const Waveform: React.FC<WaveformProps> = ({ audioBuffer, onSeek }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTime, duration, theme } = useMusicStore();
  const [hoverX, setHoverX] = useState<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !audioBuffer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const step = Math.ceil(channelData.length / width);
    const amp = height / 2;

    ctx.beginPath();
    ctx.moveTo(0, amp);

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      
      for (let j = 0; j < step; j++) {
        const datum = channelData[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      ctx.lineTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }

    ctx.lineTo(width, amp);
    
    // Draw base waveform
    ctx.fillStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
    ctx.fill();

    // Draw progress overlay
    const progressX = (currentTime / duration) * width;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, progressX, height);
    ctx.clip();
    
    // Redraw path for progress
    ctx.beginPath();
    ctx.moveTo(0, amp);
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = channelData[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.lineTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.lineTo(width, amp);
    
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#6366f1'); // indigo-500
    gradient.addColorStop(0.5, '#a855f7'); // purple-500
    gradient.addColorStop(1, '#ec4899'); // pink-500
    
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    // Draw hover line
    if (hoverX !== null) {
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, height);
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

  }, [audioBuffer, currentTime, duration, theme, hoverX]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current || !duration) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX = 0;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }
    
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = x / rect.width;
    onSeek(percent * duration);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverX(x);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
  };

  if (!audioBuffer) {
    return (
      <div className="w-full h-16 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center animate-pulse">
        <span className="text-xs text-gray-500 dark:text-white/50">Generating waveform...</span>
      </div>
    );
  }

  return (
    <div className="w-full mt-4 mb-2">
      <canvas
        ref={canvasRef}
        width={800}
        height={64}
        className="w-full h-16 cursor-pointer rounded-lg"
        onClick={handleInteraction}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleInteraction}
        onTouchMove={handleInteraction}
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-white/70 font-mono mt-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
