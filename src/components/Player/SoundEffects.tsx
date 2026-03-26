import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useMusicStore } from '../../store/useMusicStore';

interface SoundEffectsProps {
  onEqChange: (band: 'bass' | 'mid' | 'treble', value: number) => void;
}

export const SoundEffects: React.FC<SoundEffectsProps> = ({ onEqChange }) => {
  const { eqSettings } = useMusicStore();

  const handleChange = (band: 'bass' | 'mid' | 'treble', value: number) => {
    onEqChange(band, value);
  };

  const presets = {
    Flat: { bass: 0, mid: 0, treble: 0 },
    BassBoost: { bass: 10, mid: -2, treble: 2 },
    Vocal: { bass: -2, mid: 8, treble: 4 },
    Electronic: { bass: 8, mid: -4, treble: 6 },
  };

  const applyPreset = (name: keyof typeof presets) => {
    const preset = presets[name];
    onEqChange('bass', preset.bass);
    onEqChange('mid', preset.mid);
    onEqChange('treble', preset.treble);
  };

  return (
    <div className="flex flex-col items-center mt-6 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-white/50">
        <SlidersHorizontal size={16} />
        <p className="text-xs uppercase tracking-wider font-medium">Sound Effects</p>
      </div>
      
      {/* Presets */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {(Object.keys(presets) as Array<keyof typeof presets>).map(preset => (
          <button
            key={preset}
            onClick={() => applyPreset(preset)}
            className="px-3 py-1 text-xs rounded-full border border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-white/80 transition-colors"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* EQ Sliders */}
      <div className="flex justify-between w-full gap-4 px-4">
        <div className="flex flex-col items-center flex-1">
          <input
            type="range"
            min="-15"
            max="15"
            value={eqSettings.bass}
            onChange={(e) => handleChange('bass', Number(e.target.value))}
            className="h-24 appearance-none bg-transparent [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/10 dark:[&::-webkit-slider-runnable-track]:bg-white/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
          />
          <span className="text-[10px] text-gray-500 dark:text-white/50 mt-2 uppercase">Bass</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <input
            type="range"
            min="-15"
            max="15"
            value={eqSettings.mid}
            onChange={(e) => handleChange('mid', Number(e.target.value))}
            className="h-24 appearance-none bg-transparent [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/10 dark:[&::-webkit-slider-runnable-track]:bg-white/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
          />
          <span className="text-[10px] text-gray-500 dark:text-white/50 mt-2 uppercase">Mid</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <input
            type="range"
            min="-15"
            max="15"
            value={eqSettings.treble}
            onChange={(e) => handleChange('treble', Number(e.target.value))}
            className="h-24 appearance-none bg-transparent [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/10 dark:[&::-webkit-slider-runnable-track]:bg-white/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
          />
          <span className="text-[10px] text-gray-500 dark:text-white/50 mt-2 uppercase">Treble</span>
        </div>
      </div>
    </div>
  );
};
