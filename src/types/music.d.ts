export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  size: number;
  coverArt?: string;
  file?: File;
  handle?: FileSystemFileHandle;
  dominantColor?: string;
  palette?: string[];
  isFavourite?: boolean;
  dateAdded: number;
  playCount: number;
  startTime?: number;
  endTime?: number;
}
