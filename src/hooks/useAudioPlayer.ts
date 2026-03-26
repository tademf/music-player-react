import { useEffect, useRef, useCallback, useState } from 'react';
import { useMusicStore } from '../store/useMusicStore';
import { analyzeAudioLoudness } from '../utils/audioProcessor';

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const baseGainRef = useRef<number>(1);
  const bassNodeRef = useRef<BiquadFilterNode | null>(null);
  const midNodeRef = useRef<BiquadFilterNode | null>(null);
  const trebleNodeRef = useRef<BiquadFilterNode | null>(null);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [currentAudioBuffer, setCurrentAudioBuffer] = useState<AudioBuffer | null>(null);
  const nextTrackUrlRef = useRef<string | null>(null);
  const nextTrackIdRef = useRef<string | null>(null);

  const {
    playlist,
    currentTrackIndex,
    isPlaying,
    currentTime, // Add currentTime here
    volume,
    playbackRate,
    repeatMode,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    nextTrack,
    gaplessPlayback,
    hwPlus,
    hwPlusLevel,
    eqSettings,
    setEqSettings,
  } = useMusicStore();

  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;
  const isFirstLoadRef = useRef(true); // Track if it's the first load

  // Initialize Audio Element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      const audio = audioRef.current;
      if (!audio) return;
      
      setCurrentTime(audio.currentTime);
      
      // Handle endTime
      if (currentTrack?.endTime && audio.currentTime >= currentTrack.endTime) {
        handleEnded();
      }
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (repeatMode === 'off' && currentTrackIndex === playlist.length - 1) {
        setIsPlaying(false);
      } else {
        nextTrack();
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [setCurrentTime, setDuration, nextTrack, setIsPlaying, repeatMode, currentTrackIndex, playlist.length, currentTrack]);

  // Pre-load next track for gapless playback
  useEffect(() => {
    if (!gaplessPlayback || currentTrackIndex === null || playlist.length < 2) return;

    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    const nextTrackItem = playlist[nextIndex];
    if (!nextTrackItem) return;

    let objectUrl: string | null = null;

    const preLoad = async () => {
      try {
        let file = nextTrackItem.file;
        if (nextTrackItem.handle) {
          file = await (nextTrackItem.handle as any).getFile();
        }
        if (file) {
          objectUrl = URL.createObjectURL(file);
          nextTrackUrlRef.current = objectUrl;
          nextTrackIdRef.current = nextTrackItem.id;
        }
      } catch (e) {
        console.error('Pre-load failed', e);
      }
    };

    preLoad();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      nextTrackUrlRef.current = null;
      nextTrackIdRef.current = null;
    };
  }, [currentTrackIndex, playlist, gaplessPlayback]);

  // Handle Track Change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    let objectUrl: string | null = null;

    const loadAndPlay = async () => {
      try {
        let file = currentTrack.file;
        
        // If track has a handle (PC), we need to get the file from it
        if (currentTrack.handle) {
          // Check for permission if needed
          const permission = await (currentTrack.handle as any).queryPermission({ mode: 'read' });
          if (permission !== 'granted') {
            const request = await (currentTrack.handle as any).requestPermission({ mode: 'read' });
            if (request !== 'granted') {
              console.error('Permission denied for file handle');
              return;
            }
          }
          file = await currentTrack.handle.getFile();
        }

        if (!file && !nextTrackUrlRef.current) {
          console.error('No file or handle found for track');
          return;
        }

        if (nextTrackIdRef.current === currentTrack.id && nextTrackUrlRef.current) {
          audio.src = nextTrackUrlRef.current;
        } else {
          objectUrl = URL.createObjectURL(file!);
          audio.src = objectUrl;
        }

        // Restore currentTime on first load or use startTime
        if (isFirstLoadRef.current && currentTime > 0) {
          audio.currentTime = currentTime;
          isFirstLoadRef.current = false;
        } else if (currentTrack.startTime) {
          audio.currentTime = currentTrack.startTime;
        }
        
        // Normalize loudness
        if (audioContextRef.current && gainNodeRef.current) {
          setIsNormalizing(true);
          setCurrentAudioBuffer(null);
          analyzeAudioLoudness(file, audioContextRef.current).then(({ gain, audioBuffer }) => {
            baseGainRef.current = gain;
            if (gainNodeRef.current) {
              const finalGain = hwPlus ? gain * hwPlusLevel : gain;
              gainNodeRef.current.gain.setTargetAtTime(finalGain, audioContextRef.current!.currentTime, 0.1);
            }
            setCurrentAudioBuffer(audioBuffer);
            setIsNormalizing(false);
          });
        }
        
        if (isPlaying) {
          audio.play().catch(console.error);
        }
      } catch (error) {
        console.error('Failed to load track file', error);
      }
    };

    loadAndPlay();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [currentTrack]); // Only re-run when track changes

  // Handle Play/Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying && audio.paused) {
      audio.play().catch(console.error);
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle Volume and Playback Rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);
  
  // Handle HW+ Boost
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const finalGain = hwPlus ? baseGainRef.current * hwPlusLevel : baseGainRef.current;
      gainNodeRef.current.gain.setTargetAtTime(finalGain, audioContextRef.current!.currentTime, 0.1);
    }
  }, [hwPlus, hwPlusLevel]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [setCurrentTime]);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current && audioRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      gainNodeRef.current = audioContextRef.current.createGain();
      
      // Setup EQ Nodes
      bassNodeRef.current = audioContextRef.current.createBiquadFilter();
      bassNodeRef.current.type = 'lowshelf';
      bassNodeRef.current.frequency.value = 250;
      bassNodeRef.current.gain.value = eqSettings.bass;

      midNodeRef.current = audioContextRef.current.createBiquadFilter();
      midNodeRef.current.type = 'peaking';
      midNodeRef.current.frequency.value = 1000;
      midNodeRef.current.Q.value = 1;
      midNodeRef.current.gain.value = eqSettings.mid;

      trebleNodeRef.current = audioContextRef.current.createBiquadFilter();
      trebleNodeRef.current.type = 'highshelf';
      trebleNodeRef.current.frequency.value = 4000;
      trebleNodeRef.current.gain.value = eqSettings.treble;
      
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      
      // Connect graph: Source -> Gain -> Bass -> Mid -> Treble -> Analyser -> Destination
      sourceRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(bassNodeRef.current);
      bassNodeRef.current.connect(midNodeRef.current);
      midNodeRef.current.connect(trebleNodeRef.current);
      trebleNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      // Initial normalization if track is already loaded
      if (currentTrack) {
        setIsNormalizing(true);
        setCurrentAudioBuffer(null);
        analyzeAudioLoudness(currentTrack.file, audioContextRef.current).then(({ gain, audioBuffer }) => {
          baseGainRef.current = gain;
          if (gainNodeRef.current) {
            const finalGain = hwPlus ? gain * hwPlusLevel : gain;
            gainNodeRef.current.gain.setTargetAtTime(finalGain, audioContextRef.current!.currentTime, 0.1);
          }
          setCurrentAudioBuffer(audioBuffer);
          setIsNormalizing(false);
        });
      }
    }
    
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [currentTrack]);

  const setEq = useCallback((band: 'bass' | 'mid' | 'treble', value: number) => {
    const newSettings = { ...eqSettings, [band]: value };
    setEqSettings(newSettings);

    if (band === 'bass' && bassNodeRef.current) {
      bassNodeRef.current.gain.value = value;
    } else if (band === 'mid' && midNodeRef.current) {
      midNodeRef.current.gain.value = value;
    } else if (band === 'treble' && trebleNodeRef.current) {
      trebleNodeRef.current.gain.value = value;
    }
  }, [eqSettings, setEqSettings]);

  return {
    audioRef,
    analyserRef,
    seek,
    initAudioContext,
    setEq,
    isNormalizing,
    currentAudioBuffer
  };
};
