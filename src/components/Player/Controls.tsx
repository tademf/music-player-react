import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Minus, Plus, Gauge } from 'lucide-react';
import { useMusicStore } from '../../store/useMusicStore';
import { translations } from '../../lib/translations';

interface ControlsProps {
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
}

const formatTime = (time: number) => {
  if (isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const Controls: React.FC<ControlsProps> = ({
  onPlayPause,
  onNext,
  onPrev,
  onVolumeChange,
  onSeek,
}) => {
  const { isPlaying, volume, currentTime, duration, playbackRate, setPlaybackRate, repeatMode, setRepeatMode, isShuffle, toggleShuffle, hwPlus, toggleHwPlus, hwPlusLevel, setHwPlusLevel, language } = useMusicStore();
  const [showVolumeControls, setShowVolumeControls] = React.useState(false);
  const t = translations[language];

  const handleRepeatToggle = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const handleSpeedToggle = () => {
    const rates = [0.5, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  return (
    <div className="flex flex-col w-full mt-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-3 px-2 mb-4">
        <span className="text-xs text-gray-500 dark:text-white/50 w-10 text-right">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 cursor-pointer"
        />
        <span className="text-xs text-gray-500 dark:text-white/50 w-10">
          {formatTime(duration)}
        </span>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${isShuffle ? 'text-purple-500' : 'text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Shuffle size={20} />
          </button>

          <div className="flex items-center gap-6">
            <button
              onClick={onPrev}
              className="p-3 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition-all active:scale-95"
            >
              <SkipBack size={24} className="text-gray-900 dark:text-white" />
            </button>

            <button
              onClick={onPlayPause}
              className="p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 rounded-full shadow-lg shadow-purple-500/30 transition-all active:scale-95"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>

            <button
              onClick={onNext}
              className="p-3 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition-all active:scale-95"
            >
              <SkipForward size={24} className="text-gray-900 dark:text-white" />
            </button>
          </div>

          <button
            onClick={handleRepeatToggle}
            className={`p-2 transition-colors ${repeatMode !== 'off' ? 'text-purple-500' : 'text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* Extra Controls: Volume & Speed */}
        <div className="flex flex-col gap-4 px-4 mt-2">
          {/* Volume Slider (Conditional) */}
          {showVolumeControls && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
                  className="p-1.5 text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-400 dark:bg-white/50 cursor-pointer"
                />
              </div>

              {/* HW+ Slider (only when enabled) */}
              {hwPlus && (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-purple-500 w-8">HW+</span>
                  <input
                    type="range"
                    min={1}
                    max={2}
                    step={0.01}
                    value={hwPlusLevel}
                    onChange={(e) => setHwPlusLevel(Number(e.target.value))}
                    className="flex-1 h-1 bg-purple-500/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-purple-500 w-10 text-right">
                    {Math.round(hwPlusLevel * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowVolumeControls(!showVolumeControls);
                }}
                className={`p-1.5 transition-colors rounded-lg px-2 ${
                  showVolumeControls 
                    ? 'bg-purple-500/10 text-purple-500' 
                    : 'text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Volume2 size={18} />
              </button>
              <button
                onClick={() => onVolumeChange(Math.max(0, volume - 0.1))}
                className="p-1.5 text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={() => onVolumeChange(Math.min(1, volume + 0.1))}
                className="p-1.5 text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toggleHwPlus();
                  if (!hwPlus) setShowVolumeControls(true);
                }}
                className={`flex items-center gap-1 p-1.5 text-[10px] font-bold transition-all rounded-lg px-2 ${
                  hwPlus 
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-500/50' 
                    : 'bg-black/5 dark:bg-white/10 text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={t.hwPlus}
              >
                HW+
              </button>
              <button
                onClick={handleSpeedToggle}
                className="flex items-center gap-1 p-1.5 text-xs font-medium text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/10 rounded-lg px-3"
              >
                <Gauge size={14} />
                {playbackRate}x
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
