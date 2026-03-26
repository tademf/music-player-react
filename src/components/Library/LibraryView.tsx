import React, { useMemo, useState } from 'react';
import { Track } from '../../types/music';
import { useMusicStore } from '../../store/useMusicStore';
import { Music, Disc, Mic2, Play, Trash2, ChevronRight, ChevronLeft, Search, ArrowUpDown, CheckSquare, Square } from 'lucide-react';
import { TrackMenu } from './TrackMenu';
import { translations } from '../../lib/translations';

interface LibraryViewProps {
  viewType: 'songs' | 'playlists' | 'albums' | 'artists';
  onPlayTrack: (index: number) => void;
  onDeleteTrack: (id: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ viewType, onPlayTrack, onDeleteTrack }) => {
  const { 
    playlist, 
    currentTrackIndex, 
    searchQuery, 
    setSearchQuery, 
    sortBy, 
    setSortBy, 
    sortOrder,
    setSortOrder,
    selectedTracks, 
    toggleTrackSelection,
    language,
    playlists,
    createPlaylist,
    viewMode
  } = useMusicStore();
  const t = translations[language];
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const filteredAndSortedPlaylist = useMemo(() => {
    let result = [...playlist];
    
    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query));
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'title') comparison = a.title.localeCompare(b.title);
      else if (sortBy === 'fileName') {
        const nameA = a.file?.name || a.title;
        const nameB = b.file?.name || b.title;
        comparison = nameA.localeCompare(nameB);
      }
      else if (sortBy === 'duration') comparison = a.duration - b.duration;
      else if (sortBy === 'date') comparison = (a.dateAdded || 0) - (b.dateAdded || 0);
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [playlist, searchQuery, sortBy, sortOrder]);

  const groupedData = useMemo(() => {
    const groups: Record<string, Track[]> = {};
    
    if (viewType === 'songs') {
      return { 'All Tracks': filteredAndSortedPlaylist };
    }

    if (viewType === 'playlists') {
      const playlistGroups: Record<string, Track[]> = {};
      
      // Built-in playlists
      playlistGroups['Favourite'] = filteredAndSortedPlaylist.filter(t => t.isFavourite);
      playlistGroups['Recently Added'] = [...filteredAndSortedPlaylist].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 10);
      playlistGroups['Most Played'] = [...filteredAndSortedPlaylist].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 10);
      
      // Custom playlists
      playlists.forEach(p => {
        playlistGroups[p.name] = p.trackIds.map(id => filteredAndSortedPlaylist.find(t => t.id === id)).filter(Boolean) as Track[];
      });
      
      return playlistGroups;
    }

    filteredAndSortedPlaylist.forEach(track => {
      let key = 'Unknown';
      if (viewType === 'albums') key = track.album || 'Unknown Album';
      if (viewType === 'artists') key = track.artist || 'Unknown Artist';
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(track);
    });
    
    return groups;
  }, [filteredAndSortedPlaylist, viewType]);

  // If we are in 'songs' view, just show the list directly
  if (viewType === 'songs') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search and Sort */}
        <div className="p-4 flex flex-col sm:flex-row gap-2 border-b border-black/5 dark:border-white/10">
          <div className="flex-1 flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="Find songs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm w-full outline-none text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 sm:flex-none bg-black/5 dark:bg-white/5 rounded-lg px-2 py-2 text-sm text-gray-900 dark:text-white outline-none"
            >
              <option value="title">{t.title}</option>
              <option value="fileName">{t.fileName}</option>
              <option value="duration">{t.duration}</option>
              <option value="date">{t.dateAdded}</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-black/5 dark:bg-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none"
            >
              {sortOrder === 'asc' ? t.asc : t.desc}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {filteredAndSortedPlaylist.map((track, mapIndex) => {
                const index = playlist.findIndex(t => t.id === track.id);
                return (
                  <div
                    key={`${viewType}-${track.id}-${mapIndex}`}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors flex-nowrap ${
                      currentTrackIndex === index ? 'bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border border-purple-500/20' : 'hover:bg-black/5 dark:hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {track.coverArt ? (
                          <img src={track.coverArt} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Music size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div
                        className="flex-1 cursor-pointer truncate"
                        onClick={() => onPlayTrack(index)}
                      >
                        <p className="text-gray-900 dark:text-white font-medium truncate">{track.title}</p>
                        <p className="text-gray-500 dark:text-white/50 text-xs truncate">{track.artist}</p>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      <TrackMenu track={track} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 content-start">
              {filteredAndSortedPlaylist.map((track, mapIndex) => {
                const index = playlist.findIndex(t => t.id === track.id);
                return (
                  <div
                    key={`${viewType}-grid-${track.id}-${mapIndex}`}
                    className={`relative group bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all ${
                      currentTrackIndex === index ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                    }`}
                  >
                    <div 
                      className="aspect-square rounded-lg bg-black/5 dark:bg-white/10 overflow-hidden mb-3 flex items-center justify-center relative"
                      onClick={() => onPlayTrack(index)}
                    >
                      {track.coverArt ? (
                        <img src={track.coverArt} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Music size={32} className="text-gray-400" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play size={32} className="text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0" onClick={() => onPlayTrack(index)}>
                        <h3 className="text-gray-900 dark:text-white font-medium text-sm truncate">{track.title}</h3>
                        <p className="text-gray-500 dark:text-white/50 text-xs truncate">{track.artist}</p>
                      </div>
                      <div className="shrink-0">
                        <TrackMenu track={track} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {filteredAndSortedPlaylist.length === 0 && (
            <p className="text-center text-gray-500 dark:text-white/50 text-sm mt-8">{t.noTracksFound}</p>
          )}
        </div>
      </div>
    );
  }

  // For Albums, Artists
  if (selectedGroup) {
    const tracks = groupedData[selectedGroup] || [];
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
          <button 
            onClick={() => setSelectedGroup(null)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="text-gray-900 dark:text-white" size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{selectedGroup}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {tracks.map((track, mapIndex) => {
            const index = playlist.findIndex(t => t.id === track.id);
            const isSelected = selectedTracks.includes(track.id);
            return (
              <div
                key={`${viewType}-${selectedGroup}-${track.id}-${mapIndex}`}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors flex-nowrap ${
                  currentTrackIndex === index ? 'bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border border-purple-500/20' : 'hover:bg-black/5 dark:hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {track.coverArt ? (
                      <img src={track.coverArt} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Music size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div
                    className="flex-1 cursor-pointer truncate"
                    onClick={() => onPlayTrack(index)}
                  >
                    <p className="text-gray-900 dark:text-white font-medium truncate">{track.title}</p>
                    <p className="text-gray-500 dark:text-white/50 text-xs truncate">{track.artist}</p>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  <TrackMenu track={track} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 content-start">
      {viewType === 'playlists' && (
        <div 
          onClick={() => {
            const name = prompt('Enter playlist name:');
            if (name) createPlaylist(name);
          }}
          className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex flex-col items-center text-center gap-3"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-pink-500/20 flex items-center justify-center text-purple-500">
            <Music size={32} />
          </div>
          <h3 className="text-gray-900 dark:text-white font-medium text-sm">Create New Playlist</h3>
        </div>
      )}
      {Object.keys(groupedData).map(group => (
        <div 
          key={group}
          onClick={() => setSelectedGroup(group)}
          className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex flex-col items-center text-center gap-3"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-pink-500/20 flex items-center justify-center text-purple-500">
            {viewType === 'albums' && <Disc size={32} />}
            {viewType === 'artists' && <Mic2 size={32} />}
            {viewType === 'playlists' && <Music size={32} />}
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium text-sm line-clamp-2">{group}</h3>
            <p className="text-gray-500 dark:text-white/50 text-xs mt-1">{groupedData[group].length} {t.tracks}</p>
          </div>
        </div>
      ))}
      {Object.keys(groupedData).length === 0 && viewType !== 'playlists' && (
        <div className="col-span-2 text-center text-gray-500 dark:text-white/50 text-sm mt-8">
          {t.no} {viewType} {t.found}.
        </div>
      )}
    </div>
  );
};
