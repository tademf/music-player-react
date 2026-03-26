import React, { useState, useEffect } from 'react';
import { useMusicStore } from '../../store/useMusicStore';
import { Play, Pause, SkipBack, SkipForward, Unlock, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { playlist, currentTrackIndex, isPlaying, setIsPlaying, nextTrack, prevTrack } = useMusicStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-between p-8 text-white overflow-hidden"
    >
      {/* Background Blur */}
      {currentTrack?.coverArt && (
        <div 
          className="absolute inset-0 opacity-40 blur-3xl scale-110"
          style={{ 
            backgroundImage: `url(${currentTrack.coverArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      <div className="relative z-10 w-full max-w-md flex flex-col items-center h-full">
        {/* Clock */}
        <div className="mt-12 text-center">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-7xl font-light tracking-tighter"
          >
            {formatTime(time)}
          </motion.h1>
          <motion.p 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/60 font-medium mt-2"
          >
            {formatDate(time)}
          </motion.p>
        </div>

        {/* Player Card */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full aspect-square max-w-[280px] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 bg-white/5 border border-white/10 flex items-center justify-center mb-8"
          >
            {currentTrack?.coverArt ? (
              <img 
                src={currentTrack.coverArt} 
                alt={currentTrack.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Music size={80} className="text-white/20" />
            )}
          </motion.div>

          <div className="text-center space-y-2 mb-8 px-4 w-full">
            <motion.h2 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold truncate"
            >
              {currentTrack?.title || 'No Track Selected'}
            </motion.h2>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/60 truncate"
            >
              {currentTrack?.artist || 'Unknown Artist'}
            </motion.p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={prevTrack}
              className="p-3 hover:bg-white/10 rounded-full transition-colors"
            >
              <SkipBack size={32} fill="currentColor" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 flex items-center justify-center bg-white text-black rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
            </button>
            <button 
              onClick={nextTrack}
              className="p-3 hover:bg-white/10 rounded-full transition-colors"
            >
              <SkipForward size={32} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Unlock Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onUnlock}
          className="mb-8 flex flex-col items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
            <Unlock size={24} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Unlock</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
