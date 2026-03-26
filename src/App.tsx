import React, { useEffect, useRef, useState } from 'react';
import { Layout } from './components/UI/Layout';
import { GlassCard } from './components/UI/GlassCard';
import { AudioVisualizer } from './components/Player/AudioVisualizer';
import { Controls } from './components/Player/Controls';
import { SoundEffects } from './components/Player/SoundEffects';
import { LibraryView } from './components/Library/LibraryView';
import { SettingsView } from './components/Settings/SettingsView';
import { useFileSystem } from './hooks/useFileSystem';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useSleepTimer } from './hooks/useSleepTimer';
import { useMusicStore } from './store/useMusicStore';
import { Music, Upload, Trash2, ListMusic, Play, Pause, Disc, Mic2, Settings, PlayCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LockScreen } from './components/Player/LockScreen';

type ViewType = 'songs' | 'player' | 'playlists' | 'albums' | 'artists' | 'settings';

export default function App() {
  const { loadTracksFromDB, handleFiles, handleDeleteTrack, scanFolder, reScanFolders, isScanning } = useFileSystem();
  const { audioRef, analyserRef, seek, initAudioContext, setEq, isNormalizing, currentAudioBuffer } = useAudioPlayer();
  const { isSleepTimerActive, toggleSleepTimer, sleepTimerMinutes, setSleepTimerMinutes, timeRemaining } = useSleepTimer(audioRef);
  const { playlist, currentTrackIndex, isPlaying, setIsPlaying, nextTrack, prevTrack, setVolume, playTrack, theme, toggleTheme, hwPlus, hwPlusLevel, lockScreenEnabled } = useMusicStore();
  const [currentView, setCurrentView] = useState<ViewType>('songs');
  const [isLocked, setIsLocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanStorage = () => {
    scanFolder();
  };

  useEffect(() => {
    loadTracksFromDB();
    reScanFolders();
  }, [loadTracksFromDB, reScanFolders]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchEndY(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (currentView !== 'player') return;
    
    // Don't trigger swipe if user was interacting with a range input or a button
    const target = e.target as HTMLElement;
    const isInteractive = target.tagName === 'BUTTON' || 
                         target.closest('button') ||
                         (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'range');
    
    if (isInteractive) return;

    if (touchStartX === null || touchEndX === null || touchStartY === null || touchEndY === null) return;
    
    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;
    
    // Strict horizontal check: horizontal movement must be at least twice the vertical movement
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 2;
    // Increased threshold for deliberate action
    const isSignificantSwipe = Math.abs(deltaX) > 100;

    if (isHorizontalSwipe && isSignificantSwipe) {
      if (deltaX > 0) {
        nextTrack();
      } else {
        prevTrack();
      }
    }
  };

  return (
    <Layout>
      <GlassCard 
        className="overflow-hidden relative h-[100dvh] sm:h-[85vh] sm:max-h-[800px] flex flex-col shadow-2xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 flex justify-between items-center z-10 shrink-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Music className="text-gray-600 dark:text-white/70" size={20} /> Tadesse music player2
          </h1>
          <div className="flex items-center gap-2">
            {lockScreenEnabled && (
              <button
                onClick={() => setIsLocked(true)}
                className="p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition-colors"
                title="Lock Screen"
              >
                <Lock className="text-gray-900 dark:text-white" size={20} />
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition-colors"
              title="Upload Music"
            >
              <Upload className="text-gray-900 dark:text-white" size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="audio/*"
              multiple
              className="hidden"
            />
          </div>
        </div>

        {/* Top Navigation */}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 p-2 flex items-center z-20 shrink-0 gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'songs', icon: Music, label: 'Songs' },
            { id: 'player', icon: PlayCircle, label: 'Player' },
            { id: 'playlists', icon: ListMusic, label: 'Playlists' },
            { id: 'albums', icon: Disc, label: 'Albums' },
            { id: 'artists', icon: Mic2, label: 'Artists' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as ViewType)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-[60px] ${
                  isActive 
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-500/10' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Icon size={18} className="mb-0.5" />
                <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {currentView === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col z-10 overflow-hidden"
            >
              <SettingsView 
                isSleepTimerActive={isSleepTimerActive}
                toggleSleepTimer={toggleSleepTimer}
                sleepTimerMinutes={sleepTimerMinutes}
                setSleepTimerMinutes={setSleepTimerMinutes}
                timeRemaining={timeRemaining}
                onEqChange={setEq}
                onScanStorage={handleScanStorage}
                isScanning={isScanning}
              />
            </motion.div>
          ) : currentView !== 'player' ? (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col z-10 overflow-hidden"
            >
              <LibraryView 
                viewType={currentView as any}
                onPlayTrack={(index) => {
                  initAudioContext();
                  playTrack(index);
                  setCurrentView('player');
                }}
                onDeleteTrack={handleDeleteTrack}
              />
            </motion.div>
          ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col md:flex-row p-4 sm:p-6 z-10 overflow-y-auto gap-4 sm:gap-8"
            >
              {currentTrack ? (
                <>
                  {/* Left Side: Album Art & Visualizer */}
                  <div className="flex-1 flex flex-col items-center justify-center min-w-0">
                    <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden shadow-2xl group shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      {currentTrack.coverArt ? (
                        <img
                          src={currentTrack.coverArt}
                          alt="Album Art"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Music size={64} className="text-gray-300 dark:text-white/20" />
                        </div>
                      )}
                      
                      {/* Visualizer Overlay */}
                      {isPlaying && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-end">
                          <AudioVisualizer analyser={analyserRef.current} className="w-full h-full opacity-90 pointer-events-none" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Track Info & Controls */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="text-center md:text-left mb-6 shrink-0">
                      <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white truncate">{currentTrack.title}</h2>
                      <p className="text-gray-600 dark:text-white/60 text-sm md:text-lg mt-1 truncate">
                        {currentTrack.artist}
                        {isNormalizing && <span className="ml-2 text-[10px] bg-purple-500/20 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">Normalizing...</span>}
                        {hwPlus && <span className="ml-2 text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">HW+ {Math.round(hwPlusLevel * 100)}%</span>}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="shrink-0">
                      <Controls
                        onPlayPause={() => {
                          initAudioContext();
                          setIsPlaying(!isPlaying);
                        }}
                        onNext={nextTrack}
                        onPrev={prevTrack}
                        onVolumeChange={setVolume}
                        onSeek={seek}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <Music size={48} className="text-purple-500/50" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No track selected</h2>
                  <p className="text-gray-500 dark:text-white/50 text-sm mb-6">Upload some music or select a track from the library.</p>
                  <button
                    onClick={() => setCurrentView('songs')}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
                  >
                    Open Library
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Now Playing Bar */}
        {currentTrack && currentView !== 'player' && (
          <div 
            className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-black/5 dark:border-white/10 p-3 flex items-center gap-3 shrink-0 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" 
            onClick={() => setCurrentView('player')}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 overflow-hidden shrink-0">
              {currentTrack.coverArt ? (
                <img src={currentTrack.coverArt} className="w-full h-full object-cover" alt="Cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music size={20} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentTrack.title}</p>
              <p className="text-xs text-gray-500 dark:text-white/60 truncate">{currentTrack.artist}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} 
              className="p-2 text-gray-900 dark:text-white"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>
        )}
      </GlassCard>

      {/* Lock Screen Overlay */}
      <AnimatePresence>
        {isLocked && (
          <LockScreen onUnlock={() => setIsLocked(false)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}
