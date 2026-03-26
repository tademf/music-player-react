import React from 'react';
import { useMusicStore } from '../../store/useMusicStore';
import { SoundEffects } from '../Player/SoundEffects';
import { Sun, Moon, Timer, SlidersHorizontal, Palette, Languages, Trash2, Share2, FolderSearch, Image as ImageIcon, Upload, Star, MessageSquare, Megaphone, Info, Copy, X, Lock, LayoutGrid, List, PlayCircle, Scissors } from 'lucide-react';
import { translations } from '../../lib/translations';
import { Track } from '../../types/music';

interface SettingsViewProps {
  isSleepTimerActive: boolean;
  toggleSleepTimer: () => void;
  sleepTimerMinutes: number;
  setSleepTimerMinutes: (minutes: number) => void;
  timeRemaining: number | null;
  onEqChange: (band: 'bass' | 'mid' | 'treble', value: number) => void;
  onScanStorage: () => void;
  isScanning?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  isSleepTimerActive, 
  toggleSleepTimer, 
  sleepTimerMinutes,
  setSleepTimerMinutes,
  timeRemaining,
  onEqChange,
  onScanStorage,
  isScanning = false
}) => {
  const { playlist, theme, toggleTheme, themeColor, setThemeColor, language, setLanguage, fontStyle, setFontStyle, viewMode, setViewMode, gaplessPlayback, toggleGaplessPlayback, trash, emptyTrash, restoreFromTrash, wallpaper, setWallpaper, moveToTrash, lockScreenEnabled, toggleLockScreen, trimTrack } = useMusicStore();
  const t = translations[language];
  const wallpaperInputRef = React.useRef<HTMLInputElement>(null);
  const [duplicates, setDuplicates] = React.useState<Track[]>([]);
  const [showDuplicatesModal, setShowDuplicatesModal] = React.useState(false);
  const [selectedTrackId, setSelectedTrackId] = React.useState<string | null>(null);
  const [trimStart, setTrimStart] = React.useState<number>(0);
  const [trimEnd, setTrimEnd] = React.useState<number>(0);

  const selectedTrack = playlist.find(t => t.id === selectedTrackId);

  React.useEffect(() => {
    if (selectedTrack) {
      setTrimStart(selectedTrack.startTime || 0);
      setTrimEnd(selectedTrack.endTime || selectedTrack.duration);
    }
  }, [selectedTrackId, selectedTrack]);

  const handleSaveTrim = () => {
    if (selectedTrackId) {
      trimTrack(selectedTrackId, trimStart, trimEnd);
    }
  };

  const handleResetTrim = () => {
    if (selectedTrackId && selectedTrack) {
      setTrimStart(0);
      setTrimEnd(selectedTrack.duration);
      trimTrack(selectedTrackId, 0, selectedTrack.duration);
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const findDuplicates = () => {
    const seen = new Map<string, Track>();
    const found: Track[] = [];

    playlist.forEach(track => {
      const key = `${track.title.toLowerCase().trim()}-${(track.artist || '').toLowerCase().trim()}`;
      if (seen.has(key)) {
        found.push(track);
      } else {
        seen.set(key, track);
      }
    });

    setDuplicates(found);
    setShowDuplicatesModal(true);
  };

  const colors = [
    { name: 'indigo', class: 'bg-indigo-500' },
    { name: 'rose', class: 'bg-rose-500' },
    { name: 'emerald', class: 'bg-emerald-500' },
    { name: 'amber', class: 'bg-amber-500' },
    { name: 'violet', class: 'bg-violet-500' },
    { name: 'fuchsia', class: 'bg-fuchsia-500' },
    { name: 'cyan', class: 'bg-cyan-500' },
    { name: 'teal', class: 'bg-teal-500' },
    { name: 'orange', class: 'bg-orange-500' },
  ];

  const wallpapers = [
    { name: 'None', url: null },
    { name: 'Abstract 1', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80' },
    { name: 'Nature 1', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80' },
    { name: 'Space 1', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },
    { name: 'City 1', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setWallpaper(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRateUs = () => {
    // Mock rating logic
    alert("Thank you for your rating! We appreciate your support.");
  };

  const handleFeedback = () => {
    window.location.href = "mailto:tademf2023@gmail.com?subject=Feedback for Tadesse Music Player";
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">{t.appearance}</h3>
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg">
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">{t.theme}</p>
                  <p className="text-gray-500 dark:text-white/50 text-xs">{t.toggleDarkMode}</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 rounded-lg text-sm font-medium text-gray-900 dark:text-white transition-colors"
              >
                {theme === 'dark' ? 'Dark' : 'Light'}
              </button>
            </div>

            {/* Theme Color Picker */}
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg">
                  <Palette size={20} />
                </div>
                <p className="text-gray-900 dark:text-white font-medium">{t.theme}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setThemeColor(color.name as any)}
                    className={`w-8 h-8 rounded-full ${color.class} ${themeColor === color.name ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-purple-500' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Wallpaper Picker */}
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg">
                    <ImageIcon size={20} />
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">Wallpaper</p>
                </div>
                <button
                  onClick={() => wallpaperInputRef.current?.click()}
                  className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors"
                  title="Upload Custom Wallpaper"
                >
                  <Upload size={18} />
                </button>
                <input
                  type="file"
                  ref={wallpaperInputRef}
                  onChange={handleWallpaperUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="flex overflow-x-auto gap-3 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {wallpapers.map((wp) => (
                  <button
                    key={wp.name}
                    onClick={() => setWallpaper(wp.url)}
                    className={`flex-shrink-0 w-20 h-12 rounded-lg border-2 transition-all ${
                      wallpaper === wp.url ? 'border-purple-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    } overflow-hidden bg-gray-200 dark:bg-gray-800`}
                  >
                    {wp.url ? (
                      <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                        DEFAULT
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg">
                  <Languages size={20} />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">{t.language}</p>
                </div>
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-black/10 dark:bg-white/10 rounded-lg px-2 py-1 text-sm text-gray-900 dark:text-white outline-none"
              >
                <option value="en">English</option>
                <option value="am">Amharic</option>
                <option value="or">Oromo</option>
              </select>
            </div>

            {/* Font Style */}
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg">
                  <Palette size={20} />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">{t.fontStyle}</p>
                </div>
              </div>
              <select 
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value as any)}
                className="bg-black/10 dark:bg-white/10 rounded-lg px-2 py-1 text-sm text-gray-900 dark:text-white outline-none"
              >
                <option value="sans">{t.fonts.sans}</option>
                <option value="serif">{t.fonts.serif}</option>
                <option value="mono">{t.fonts.mono}</option>
                <option value="rounded">{t.fonts.rounded}</option>
                <option value="display">{t.fonts.display}</option>
                <option value="italic">{t.fonts.italic}</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg">
                  {viewMode === 'grid' ? <LayoutGrid size={20} /> : <List size={20} />}
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">{t.viewMode}</p>
                </div>
              </div>
              <div className="flex bg-black/10 dark:bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'list' 
                      ? 'bg-purple-500 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white'
                  }`}
                >
                  {t.list}
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-purple-500 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white'
                  }`}
                >
                  {t.grid}
                </button>
              </div>
            </div>

            {/* Lock Screen Toggle */}
            <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg">
                  <Lock size={20} />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">{t.lockScreen}</p>
                  <p className="text-gray-500 dark:text-white/50 text-xs">{t.lockScreenDesc}</p>
                </div>
              </div>
              <button
                onClick={toggleLockScreen}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  lockScreenEnabled 
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' 
                    : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-900 dark:text-white'
                }`}
              >
                {lockScreenEnabled ? t.active : t.enable}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">Storage & Tools</h3>
            
            {/* Scan Storage */}
            <button
              onClick={onScanStorage}
              disabled={isScanning}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                isScanning 
                  ? 'bg-purple-500/20 border-purple-500/40 cursor-wait' 
                  : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20'
              }`}
            >
              <div className={`p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg ${isScanning ? 'animate-spin' : ''}`}>
                <FolderSearch size={20} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-purple-900 dark:text-purple-100 font-medium">
                  {isScanning ? 'Scanning Folders...' : t.scanStorage}
                </p>
                {isScanning && <p className="text-[10px] text-purple-600 dark:text-purple-400">This may take a moment</p>}
              </div>
            </button>

            {/* Find Duplicates */}
            <button
              onClick={findDuplicates}
              className="w-full flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-black/10 dark:border-white/10 transition-colors"
            >
              <div className="p-2 bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded-lg">
                <Copy size={20} />
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{t.findDuplicates}</p>
            </button>

            {/* Trash */}
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 text-red-600 dark:text-red-300 rounded-lg">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{t.trash} ({trash.length})</p>
                  </div>
                </div>
                {trash.length > 0 && (
                  <button
                    onClick={emptyTrash}
                    className="text-xs text-red-500 hover:text-red-400"
                  >
                    {t.emptyTrash}
                  </button>
                )}
              </div>
              {trash.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {trash.map((track, index) => (
                    <div key={`${track.id}-${index}`} className="flex justify-between items-center text-sm p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                      <span className="truncate">{track.title}</span>
                      <button onClick={() => restoreFromTrash(track.id)} className="text-xs text-purple-500">{t.restore}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">{t.playback}</h3>
            <div className="flex flex-col gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg">
                    <Timer size={20} />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{t.sleepTimer}</p>
                    <p className="text-gray-500 dark:text-white/50 text-xs">{t.stopPlayback}</p>
                  </div>
                </div>
                <button
                  onClick={toggleSleepTimer}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSleepTimerActive 
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' 
                      : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-900 dark:text-white'
                  }`}
                >
                  {isSleepTimerActive ? t.active : t.enable}
                </button>
              </div>

              {isSleepTimerActive && timeRemaining !== null && (
                <div className="text-center text-sm font-medium text-purple-600 dark:text-purple-400">
                  {t.timeRemaining}: {formatTimeRemaining(timeRemaining)}
                </div>
              )}

              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 dark:text-white/50 w-12">5 min</span>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={sleepTimerMinutes}
                  onChange={(e) => setSleepTimerMinutes(Number(e.target.value))}
                  disabled={isSleepTimerActive}
                  className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 cursor-pointer disabled:opacity-50"
                />
                <span className="text-xs text-gray-500 dark:text-white/50 w-12 text-right">{sleepTimerMinutes} min</span>
              </div>
            </div>

            {/* Gapless Playback */}
            <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg">
                  <PlayCircle size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">{t.gaplessPlayback}</p>
                  <p className="text-gray-500 dark:text-white/50 text-xs leading-tight mt-0.5">{t.gaplessPlaybackDesc}</p>
                </div>
              </div>
              <button
                onClick={toggleGaplessPlayback}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ml-4 ${
                  gaplessPlayback 
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' 
                    : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-900 dark:text-white'
                }`}
              >
                {gaplessPlayback ? t.active : t.enable}
              </button>
            </div>

            {/* Audio Trim */}
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg">
                  <Scissors size={20} />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">{t.audioTrim}</p>
                  <p className="text-gray-500 dark:text-white/50 text-xs">{t.audioTrimDesc}</p>
                </div>
              </div>

              <div className="space-y-3">
                <select
                  value={selectedTrackId || ''}
                  onChange={(e) => setSelectedTrackId(e.target.value)}
                  className="w-full bg-black/10 dark:bg-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none border border-black/5 dark:border-white/5"
                >
                  <option value="">{t.selectTrackToTrim}</option>
                  {playlist.map(track => (
                    <option key={track.id} value={track.id}>{track.title}</option>
                  ))}
                </select>

                {selectedTrack && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-white/40 ml-1">{t.startTime}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={trimEnd - 1}
                            value={Math.floor(trimStart)}
                            onChange={(e) => setTrimStart(Number(e.target.value))}
                            className="w-full bg-black/10 dark:bg-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none border border-black/5 dark:border-white/5"
                          />
                          <span className="text-xs text-gray-500 font-mono whitespace-nowrap">{formatTimeRemaining(Math.floor(trimStart))}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-white/40 ml-1">{t.endTime}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={trimStart + 1}
                            max={selectedTrack.duration}
                            value={Math.floor(trimEnd)}
                            onChange={(e) => setTrimEnd(Number(e.target.value))}
                            className="w-full bg-black/10 dark:bg-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none border border-black/5 dark:border-white/5"
                          />
                          <span className="text-xs text-gray-500 font-mono whitespace-nowrap">{formatTimeRemaining(Math.floor(trimEnd))}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTrim}
                        className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-purple-500/25 transition-all"
                      >
                        {t.saveTrim}
                      </button>
                      <button
                        onClick={handleResetTrim}
                        className="px-4 py-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-all"
                      >
                        {t.resetTrim}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">{t.audio}</h3>
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
              <SoundEffects onEqChange={onEqChange} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">Community & Support</h3>
            
            {/* Share */}
            <button
              onClick={() => navigator.share?.({ title: 'Tadesse Music Player', url: window.location.href })}
              className="w-full flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-black/10 dark:border-white/10 transition-colors"
            >
              <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg">
                <Share2 size={20} />
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{t.shareApp}</p>
            </button>

            {/* Rate Us */}
            <button
              onClick={handleRateUs}
              className="w-full flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-black/10 dark:border-white/10 transition-colors"
            >
              <div className="p-2 bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 rounded-lg">
                <Star size={20} />
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{t.rateUs}</p>
            </button>

            {/* Feedback */}
            <button
              onClick={handleFeedback}
              className="w-full flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-black/10 dark:border-white/10 transition-colors"
            >
              <div className="p-2 bg-green-500/20 text-green-600 dark:text-green-300 rounded-lg">
                <MessageSquare size={20} />
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{t.feedback}</p>
            </button>

            {/* Promotion */}
            <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg">
                  <Megaphone size={20} />
                </div>
                <p className="text-gray-900 dark:text-white font-medium">{t.promotion}</p>
              </div>
              <div className="bg-black/10 dark:bg-white/10 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">Check out our new premium features!</p>
                <button className="mt-2 px-4 py-1 bg-purple-500 text-white text-xs rounded-full font-bold uppercase tracking-wider">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* App Version */}
      <div className="flex items-center justify-center gap-2 py-8">
        <Info size={14} className="text-gray-400" />
        <p className="text-xs text-gray-400 font-medium">{t.version}: 1.2.0</p>
      </div>

      {/* Duplicates Modal */}
      {showDuplicatesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-black/10 dark:border-white/10">
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">{t.duplicatesFound}</h3>
              <button onClick={() => setShowDuplicatesModal(false)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {duplicates.length > 0 ? (
                duplicates.map((track, i) => (
                  <div key={`${track.id}-${i}`} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{track.title}</p>
                      <p className="text-xs text-gray-500 dark:text-white/50 truncate">{track.artist}</p>
                    </div>
                    <button
                      onClick={() => {
                        moveToTrash(track.id);
                        setDuplicates(prev => prev.filter(t => t.id !== track.id));
                      }}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">{t.noDuplicates}</p>
              )}
            </div>
            <div className="p-4 bg-black/5 dark:bg-white/5 flex justify-end">
              <button
                onClick={() => setShowDuplicatesModal(false)}
                className="px-6 py-2 bg-purple-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
