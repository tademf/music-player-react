import { useEffect, useRef, useState, RefObject } from 'react';
import { useMusicStore } from '../store/useMusicStore';

export const useSleepTimer = (audioRef: RefObject<HTMLAudioElement | null>) => {
  const { isPlaying, setIsPlaying } = useMusicStore();
  const [isSleepTimerActive, setIsSleepTimerActive] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(30);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const fadeOutIntervalRef = useRef<number | null>(null);

  const startFadeOut = () => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    const initialVolume = audio.volume;
    const fadeDuration = 30000; // 30 seconds fade out
    const steps = 30;
    const stepTime = fadeDuration / steps;
    const volumeStep = initialVolume / steps;

    let currentStep = 0;

    if (fadeOutIntervalRef.current) {
      clearInterval(fadeOutIntervalRef.current);
    }

    fadeOutIntervalRef.current = window.setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        if (fadeOutIntervalRef.current) clearInterval(fadeOutIntervalRef.current);
        audio.volume = 0;
        setIsPlaying(false);
        audio.pause();
        // Reset volume for next play
        setTimeout(() => {
          audio.volume = initialVolume;
        }, 1000);
      } else {
        audio.volume = Math.max(0, initialVolume - (volumeStep * currentStep));
      }
    }, stepTime);
  };

  useEffect(() => {
    if (!isSleepTimerActive || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (fadeOutIntervalRef.current) clearInterval(fadeOutIntervalRef.current);
      setTimeRemaining(null);
      return;
    }

    const endTime = Date.now() + sleepTimerMinutes * 60 * 1000;
    setTimeRemaining(sleepTimerMinutes * 60);

    timerRef.current = window.setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        startFadeOut();
        setIsSleepTimerActive(false); // Disable after triggering
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (fadeOutIntervalRef.current) clearInterval(fadeOutIntervalRef.current);
    };
  }, [isSleepTimerActive, isPlaying, sleepTimerMinutes]);

  const toggleSleepTimer = () => {
    setIsSleepTimerActive(!isSleepTimerActive);
  };

  return { isSleepTimerActive, toggleSleepTimer, sleepTimerMinutes, setSleepTimerMinutes, timeRemaining };
};
