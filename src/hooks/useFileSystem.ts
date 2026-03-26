import { useState, useCallback } from 'react';
import * as mm from 'music-metadata-browser';
import { FastAverageColor } from 'fast-average-color';
import { getPalette } from 'colorthief';
import { saveTrack, getAllTracks, saveFolder, getFolders } from '../api/database';
import { Track } from '../types/music';
import { useMusicStore } from '../store/useMusicStore';

const fac = new FastAverageColor();

export const useFileSystem = () => {
  const { setPlaylist, addTrack, moveToTrash } = useMusicStore();
  const [isScanning, setIsScanning] = useState(false);

  // Load tracks from IndexedDB
  const loadTracksFromDB = useCallback(async () => {
    try {
      const tracks = await getAllTracks();
      
      // Fix broken cover arts (blob URLs from previous sessions)
      const fixedTracks = await Promise.all(tracks.map(async (track) => {
        if (track.coverArt && track.coverArt.startsWith('blob:')) {
          try {
            let file = track.file;
            if (track.handle) {
              const permission = await (track.handle as any).queryPermission({ mode: 'read' });
              if (permission === 'granted') {
                file = await (track.handle as any).getFile();
              }
            }
            
            if (file) {
              const metadata = await mm.parseBlob(file);
              if (metadata.common.picture && metadata.common.picture.length > 0) {
                const picture = metadata.common.picture[0];
                const blob = new Blob([picture.data], { type: picture.format });
                const base64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
                track.coverArt = base64;
                await saveTrack(track);
              }
            }
          } catch (e) {
            console.error('Failed to recover cover art', e);
          }
        }
        return track;
      }));

      setPlaylist(fixedTracks);
    } catch (error) {
      console.error('Failed to load tracks from DB', error);
    }
  }, [setPlaylist]);

  /**
   * Processes a single file: extracts metadata, generates palette, and saves to DB.
   */
  const processFile = async (file: File, handle?: FileSystemFileHandle): Promise<Track | null> => {
    try {
      const metadata = await mm.parseBlob(file);
      
      let coverArtUrl = undefined;
      let dominantColor = '#1f2937';
      let palette: string[] = [];

      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const blob = new Blob([picture.data], { type: picture.format });
        
        coverArtUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        try {
          const color = await fac.getColorAsync(coverArtUrl);
          dominantColor = color.hex;
          
          const img = new Image();
          img.src = coverArtUrl;
          await new Promise((resolve) => {
            img.onload = async () => {
              try {
                const colors = await getPalette(img, { colorCount: 3 });
                if (colors) {
                  palette = colors.map((c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`);
                }
              } catch (err) {
                console.error("ColorThief error:", err);
              }
              resolve(null);
            };
            img.onerror = resolve;
          });
        } catch (e) {
          console.error("Failed to extract color", e);
        }
      }

      const track: Track = {
        id: crypto.randomUUID(),
        title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ""),
        artist: metadata.common.artist || 'Unknown Artist',
        album: metadata.common.album || 'Unknown Album',
        duration: metadata.format.duration || 0,
        size: file.size,
        coverArt: coverArtUrl,
        file: handle ? undefined : file, // Store file directly if no handle (mobile fallback)
        handle, // Store handle for PC persistence
        dominantColor,
        palette,
        dateAdded: Date.now(),
        playCount: 0,
      };

      await saveTrack(track);
      return track;
    } catch (error) {
      console.error('Error processing file', error);
      return null;
    }
  };

  const scanRecursive = async (handle: FileSystemDirectoryHandle, existingTracks: Track[]) => {
    for await (const entry of (handle as any).values()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        const isAudio = file.name.match(/\.(mp3|wav|m4a|flac|ogg)$/i);
        
        if (isAudio) {
          // Duplicate detection: check if file with same name and size exists
          const isDuplicate = existingTracks.some(t => 
            (t.title === file.name.replace(/\.[^/.]+$/, "") || t.title === file.name) &&
            t.size === file.size
          );

          if (!isDuplicate) {
            const track = await processFile(file, entry);
            if (track) {
              addTrack(track);
            }
          }
        }
      } else if (entry.kind === 'directory') {
        await scanRecursive(entry, existingTracks);
      }
    }
  };

  /**
   * Scans a local folder using showDirectoryPicker.
   * Recursively finds music files and adds them to the library.
   */
  const scanFolder = async () => {
    if (!('showDirectoryPicker' in window)) {
      alert('Your browser does not support the File System Access API. Please use a modern browser on PC.');
      return;
    }

    try {
      setIsScanning(true);
      const dirHandle = await (window as any).showDirectoryPicker();
      
      // Save folder handle for future re-scans
      await saveFolder({ id: crypto.randomUUID(), handle: dirHandle, path: dirHandle.name });

      const existingTracks = await getAllTracks();
      await scanRecursive(dirHandle, existingTracks);
    } catch (error) {
      console.error('Folder scan failed', error);
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Re-scans previously picked folders.
   */
  const reScanFolders = useCallback(async () => {
    if (!('showDirectoryPicker' in window)) return;

    try {
      setIsScanning(true);
      const folders = await getFolders();
      const existingTracks = await getAllTracks();

      for (const folder of folders) {
        // Check for permission
        const permission = await (folder.handle as any).queryPermission({ mode: 'read' });
        if (permission === 'granted') {
          await scanRecursive(folder.handle, existingTracks);
        } else {
          // We could request permission here, but maybe it's better to wait for user interaction
          // or just skip for now.
          console.log(`Permission not granted for folder: ${folder.path}`);
        }
      }
    } catch (error) {
      console.error('Re-scan folders failed', error);
    } finally {
      setIsScanning(false);
    }
  }, [addTrack]);

  /**
   * Handles manual file selection (drag & drop or file input).
   */
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|flac|ogg)$/i)) {
        const track = await processFile(file);
        if (track) {
          addTrack(track);
        }
      }
    }
  }, [addTrack]);

  const handleDeleteTrack = useCallback(async (id: string) => {
    moveToTrash(id);
  }, [moveToTrash]);

  return { loadTracksFromDB, handleFiles, handleDeleteTrack, scanFolder, reScanFolders, isScanning };
};
