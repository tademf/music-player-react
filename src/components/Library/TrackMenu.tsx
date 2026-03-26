import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Play, Clock, ListPlus, Heart, Bell, Share2, FileDown, Pencil, Info, Trash2, Image as ImageIcon } from 'lucide-react';
import { Track } from '../../types/music';
import { useMusicStore } from '../../store/useMusicStore';
import { translations } from '../../lib/translations';

interface TrackMenuProps {
  track: Track;
}

export const TrackMenu: React.FC<TrackMenuProps> = ({ track }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newTitle, setNewTitle] = useState(track.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toggleFavourite, renameTrack, updateTrackCover, playNext, playLater, moveToTrash, language, addTrackToPlaylist, playTrack, playlist } = useMusicStore();
  const t = translations[language];

  const index = playlist.findIndex(t => t.id === track.id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateTrackCover(track.id, result);
      };
      reader.readAsDataURL(file);
    }
    setIsOpen(false);
  };

  const actions = [
    { label: 'Play', icon: Play, action: () => playTrack(index) },
    { label: t.playNext, icon: Play, action: () => playNext(track.id) },
    { label: t.playLater, icon: Clock, action: () => playLater(track.id) },
    { label: t.addToPlaylist, icon: ListPlus, action: () => {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName) addTrackToPlaylist(playlistName, track.id);
    }},
    { label: track.isFavourite ? t.unfavourite : t.favourite, icon: Heart, action: () => toggleFavourite(track.id) },
    { label: 'Change Cover Photo', icon: ImageIcon, action: () => fileInputRef.current?.click() },
    { label: t.setAsRingtone, icon: Bell, action: () => {} },
    { label: t.share, icon: Share2, action: () => navigator.share?.({ title: track.title, url: window.location.href }) },
    { label: t.fileTransfer, icon: FileDown, action: () => {} },
    { label: t.rename, icon: Pencil, action: () => setShowRenameModal(true) },
    { label: t.properties, icon: Info, action: () => setShowProperties(true) },
    { label: t.delete, icon: Trash2, action: () => moveToTrash(track.id) },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full">
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 max-w-[90vw] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-black/10 dark:border-white/10 z-50 py-2">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { action.action(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 text-sm text-gray-900 dark:text-white"
            >
              <action.icon size={16} className="shrink-0" />
              <span className="truncate">{action.label}</span>
            </button>
          ))}
        </div>
      )}
      {showProperties && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{t.properties}</h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Title:</strong> {track.title}</p>
              <p><strong>Artist:</strong> {track.artist}</p>
              <p><strong>Album:</strong> {track.album}</p>
              <p><strong>Duration:</strong> {Math.round(track.duration)}s</p>
            </div>
            <button 
              onClick={() => setShowProperties(false)}
              className="mt-6 w-full py-2 bg-purple-500 text-white rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showRenameModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{t.rename}</h3>
            <input 
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2 rounded-lg bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white mb-6"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setShowRenameModal(false)}
                className="flex-1 py-2 bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  renameTrack(track.id, newTitle);
                  setShowRenameModal(false);
                }}
                className="flex-1 py-2 bg-purple-500 text-white rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
