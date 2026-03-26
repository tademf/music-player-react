import React, { useCallback, useRef } from 'react';
import { useMusicStore } from '../../store/useMusicStore';

interface SeekBarProps {
  onSeek: (time: number) => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const SeekBar: React.FC<SeekBarProps> = ({ onSeek }) => {
  const { currentTime, duration } = useMusicStore();
  const progressRef = useRef<HTMLDivElement>(null);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!progressRef.current || duration === 0) return;

      const rect = progressRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onSeek(percent * duration);
    },
    [duration, onSeek]
  );

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full flex flex-col gap-1 mt-4">
      <div
        ref={progressRef}
        className="h-2 bg-black/10 dark:bg-white/20 rounded-full cursor-pointer relative"
        onMouseDown={handleSeek}
        onTouchStart={handleSeek}
      >
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-purple-500 rounded-full shadow-md scale-0 hover:scale-100 transition-transform" />
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-white/70 font-mono">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
