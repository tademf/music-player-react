import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Track } from '../types/music';

interface TadesseMusicPlayerDB extends DBSchema {
  tracks: {
    key: string;
    value: Track;
    indexes: { 'by-title': string };
  };
  folders: {
    key: string;
    value: { id: string; handle: FileSystemDirectoryHandle; path: string };
  };
}

let dbPromise: Promise<IDBPDatabase<TadesseMusicPlayerDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<TadesseMusicPlayerDB>('tadesse-music-player-db', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const trackStore = db.createObjectStore('tracks', {
            keyPath: 'id',
          });
          trackStore.createIndex('by-title', 'title');
        }
        if (oldVersion < 2) {
          db.createObjectStore('folders', {
            keyPath: 'id',
          });
        }
      },
    });
  }
  return dbPromise;
};

export const saveTrack = async (track: Track) => {
  const db = await initDB();
  await db.put('tracks', track);
};

export const getAllTracks = async (): Promise<Track[]> => {
  const db = await initDB();
  return db.getAll('tracks');
};

export const deleteTrack = async (id: string) => {
  const db = await initDB();
  await db.delete('tracks', id);
};

export const saveFolder = async (folder: { id: string; handle: FileSystemDirectoryHandle; path: string }) => {
  const db = await initDB();
  await db.put('folders', folder);
};

export const getFolders = async () => {
  const db = await initDB();
  return db.getAll('folders');
};
