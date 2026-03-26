import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track } from '../types/music';

interface MusicStore {
  playlist: Track[];
  currentTrackIndex: number | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  repeatMode: 'off' | 'one' | 'all';
  isShuffle: boolean;
  theme: 'light' | 'dark';
  themeColor: 'indigo' | 'rose' | 'emerald' | 'amber' | 'violet' | 'fuchsia' | 'cyan' | 'teal' | 'orange';
  searchQuery: string;
  sortBy: 'title' | 'fileName' | 'duration' | 'date';
  sortOrder: 'asc' | 'desc';
  selectedTracks: string[];
  trash: Track[];
  language: 'en' | 'am' | 'or';
  fontStyle: 'sans' | 'serif' | 'mono' | 'rounded' | 'display' | 'italic';
  viewMode: 'list' | 'grid';
  gaplessPlayback: boolean;
  wallpaper: string | null;
  hwPlus: boolean;
  hwPlusLevel: number;
  playlists: { name: string, trackIds: string[] }[];
  eqSettings: { bass: number, mid: number, treble: number };
  lockScreenEnabled: boolean;
  toggleFavourite: (id: string) => void;
  renameTrack: (id: string, newTitle: string) => void;
  incrementPlayCount: (id: string) => void;
  playNext: (id: string) => void;
  playLater: (id: string) => void;
  setPlaylist: (tracks: Track[]) => void;
  addTrack: (track: Track) => void;
  removeTrack: (id: string) => void;
  moveToTrash: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  emptyTrash: () => void;
  playTrack: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  setRepeatMode: (mode: 'off' | 'one' | 'all') => void;
  toggleShuffle: () => void;
  toggleTheme: () => void;
  setThemeColor: (color: 'indigo' | 'rose' | 'emerald' | 'amber' | 'violet' | 'fuchsia' | 'cyan' | 'teal' | 'orange') => void;
  setWallpaper: (wallpaper: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'title' | 'fileName' | 'duration' | 'date') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  toggleTrackSelection: (id: string) => void;
  clearSelection: () => void;
  setLanguage: (lang: 'en' | 'am' | 'or') => void;
  setFontStyle: (font: 'sans' | 'serif' | 'mono' | 'rounded' | 'display' | 'italic') => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  toggleGaplessPlayback: () => void;
  toggleHwPlus: () => void;
  setHwPlusLevel: (level: number) => void;
  createPlaylist: (name: string) => void;
  addTrackToPlaylist: (playlistName: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistName: string, trackId: string) => void;
  deletePlaylist: (name: string) => void;
  setEqSettings: (settings: { bass: number, mid: number, treble: number }) => void;
  toggleLockScreen: () => void;
  updateTrackCover: (id: string, coverArt: string) => void;
  trimTrack: (id: string, startTime: number, endTime: number) => void;
}

export const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      playlist: [],
      currentTrackIndex: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      playbackRate: 1,
      repeatMode: 'off',
      isShuffle: false,
      theme: 'light',
      themeColor: 'indigo',
      searchQuery: '',
      sortBy: 'title',
      sortOrder: 'asc',
      selectedTracks: [],
      trash: [],
      language: 'en',
      fontStyle: 'sans',
      viewMode: 'list',
      gaplessPlayback: false,
      wallpaper: null,
      hwPlus: false,
      hwPlusLevel: 1.5,
      playlists: [],
      eqSettings: { bass: 0, mid: 0, treble: 0 },
      lockScreenEnabled: false,

      toggleFavourite: (id) => set((state) => ({
        playlist: state.playlist.map(t => t.id === id ? { ...t, isFavourite: !t.isFavourite } : t)
      })),
      renameTrack: (id, newTitle) => set((state) => ({
        playlist: state.playlist.map(t => t.id === id ? { ...t, title: newTitle } : t)
      })),
      updateTrackCover: (id, coverArt) => set((state) => ({
        playlist: state.playlist.map(t => t.id === id ? { ...t, coverArt } : t)
      })),
      trimTrack: (id, startTime, endTime) => set((state) => ({
        playlist: state.playlist.map(t => t.id === id ? { ...t, startTime, endTime } : t)
      })),
      incrementPlayCount: (id) => set((state) => ({
        playlist: state.playlist.map(t => t.id === id ? { ...t, playCount: (t.playCount || 0) + 1 } : t)
      })),
      playNext: (id) => set((state) => {
        const track = state.playlist.find(t => t.id === id);
        if (!track) return state;
        if (state.currentTrackIndex === null) {
          return { playlist: [...state.playlist, track] };
        }
        const newPlaylist = [...state.playlist];
        newPlaylist.splice(state.currentTrackIndex + 1, 0, track);
        return { playlist: newPlaylist };
      }),
      playLater: (id) => set((state) => {
        const track = state.playlist.find(t => t.id === id);
        if (!track) return state;
        return { playlist: [...state.playlist, track] };
      }),
      setPlaylist: (tracks) => set({ playlist: tracks }),
      
      addTrack: (track) => set((state) => ({ playlist: [...state.playlist, track] })),
      
      removeTrack: (id) => set((state) => {
        const newPlaylist = state.playlist.filter((t) => t.id !== id);
        let newIndex = state.currentTrackIndex;
        if (state.currentTrackIndex !== null) {
          const currentTrack = state.playlist[state.currentTrackIndex];
          if (currentTrack.id === id) {
            newIndex = newPlaylist.length > 0 ? 0 : null;
          } else {
            newIndex = newPlaylist.findIndex(t => t.id === currentTrack.id);
          }
        }
        return { playlist: newPlaylist, currentTrackIndex: newIndex };
      }),

      playTrack: (index) => {
        const track = get().playlist[index];
        if (track) {
          get().incrementPlayCount(track.id);
        }
        set({ currentTrackIndex: index, isPlaying: true });
      },

      nextTrack: () => set((state) => {
        if (state.playlist.length === 0 || state.currentTrackIndex === null) return state;
        if (state.isShuffle) {
          const nextIndex = Math.floor(Math.random() * state.playlist.length);
          const track = state.playlist[nextIndex];
          if (track) get().incrementPlayCount(track.id);
          return { currentTrackIndex: nextIndex, isPlaying: true };
        }
        const nextIndex = (state.currentTrackIndex + 1) % state.playlist.length;
        const track = state.playlist[nextIndex];
        if (track) get().incrementPlayCount(track.id);
        return { currentTrackIndex: nextIndex, isPlaying: true };
      }),

      prevTrack: () => set((state) => {
        if (state.playlist.length === 0 || state.currentTrackIndex === null) return state;
        if (state.isShuffle) {
          const prevIndex = Math.floor(Math.random() * state.playlist.length);
          const track = state.playlist[prevIndex];
          if (track) get().incrementPlayCount(track.id);
          return { currentTrackIndex: prevIndex, isPlaying: true };
        }
        const prevIndex = (state.currentTrackIndex - 1 + state.playlist.length) % state.playlist.length;
        const track = state.playlist[prevIndex];
        if (track) get().incrementPlayCount(track.id);
        return { currentTrackIndex: prevIndex, isPlaying: true };
      }),

      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume }),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
      setRepeatMode: (repeatMode) => set({ repeatMode }),
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setThemeColor: (themeColor) => set({ themeColor }),
      setWallpaper: (wallpaper) => set({ wallpaper }),
      moveToTrash: (id) => set((state) => {
        const trackToTrash = state.playlist.find(t => t.id === id);
        if (!trackToTrash) return state;
        const newPlaylist = state.playlist.filter((t) => t.id !== id);
        return { 
          playlist: newPlaylist, 
          trash: [...state.trash, trackToTrash],
          currentTrackIndex: state.currentTrackIndex !== null && state.playlist[state.currentTrackIndex].id === id ? null : state.currentTrackIndex
        };
      }),
      restoreFromTrash: (id) => set((state) => {
        const trackToRestore = state.trash.find(t => t.id === id);
        if (!trackToRestore) return state;
        return {
          trash: state.trash.filter(t => t.id !== id),
          playlist: [...state.playlist, trackToRestore]
        };
      }),
      emptyTrash: () => set({ trash: [] }),
      setLanguage: (language) => set({ language }),
      setFontStyle: (fontStyle) => set({ fontStyle }),
      setViewMode: (viewMode) => set({ viewMode }),
      toggleGaplessPlayback: () => set((state) => ({ gaplessPlayback: !state.gaplessPlayback })),
      toggleHwPlus: () => set((state) => ({ hwPlus: !state.hwPlus })),
      setHwPlusLevel: (hwPlusLevel) => set({ hwPlusLevel }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      toggleTrackSelection: (id) => set((state) => {
        const isSelected = state.selectedTracks.includes(id);
        return {
          selectedTracks: isSelected
            ? state.selectedTracks.filter((trackId) => trackId !== id)
            : [...state.selectedTracks, id],
        };
      }),
      clearSelection: () => set({ selectedTracks: [] }),
      createPlaylist: (name) => set((state) => ({
        playlists: [...state.playlists, { name, trackIds: [] }]
      })),
      addTrackToPlaylist: (playlistName, trackId) => set((state) => ({
        playlists: state.playlists.map(p => p.name === playlistName ? { ...p, trackIds: [...p.trackIds, trackId] } : p)
      })),
      removeTrackFromPlaylist: (playlistName, trackId) => set((state) => ({
        playlists: state.playlists.map(p => p.name === playlistName ? { ...p, trackIds: p.trackIds.filter(id => id !== trackId) } : p)
      })),
      deletePlaylist: (name) => set((state) => ({
        playlists: state.playlists.filter(p => p.name !== name)
      })),
      setEqSettings: (eqSettings) => set({ eqSettings }),
      toggleLockScreen: () => set((state) => ({ lockScreenEnabled: !state.lockScreenEnabled })),
    }),
    {
      name: 'music-player-storage',
      partialize: (state) => ({
        currentTrackIndex: state.currentTrackIndex,
        volume: state.volume,
        playbackRate: state.playbackRate,
        repeatMode: state.repeatMode,
        isShuffle: state.isShuffle,
        theme: state.theme,
        themeColor: state.themeColor,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        language: state.language,
        fontStyle: state.fontStyle,
        viewMode: state.viewMode,
        gaplessPlayback: state.gaplessPlayback,
        wallpaper: state.wallpaper,
        hwPlus: state.hwPlus,
        hwPlusLevel: state.hwPlusLevel,
        playlists: state.playlists,
        currentTime: state.currentTime,
        eqSettings: state.eqSettings,
        lockScreenEnabled: state.lockScreenEnabled,
      }),
    }
  )
);
