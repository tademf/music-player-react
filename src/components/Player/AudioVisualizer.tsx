import React, { useEffect, useRef } from 'react';
import { useMusicStore } from '../../store/useMusicStore';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, className = "w-full h-24 rounded-b-2xl opacity-80 pointer-events-none" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useMusicStore();

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      const time = Date.now() / 20;

      for (let i = 0; i < bufferLength; i++) {
        // Scale bar height relative to canvas height
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        const hue = ((i / bufferLength) * 360 + time) % 360;
        ctx.fillStyle = `hsla(${hue}, 80%, ${theme === 'dark' ? 65 : 55}%, 0.8)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyser, theme]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={500}
      height={500}
    />
  );
};
