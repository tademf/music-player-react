export const analyzeAudioLoudness = async (file: File, audioContext: AudioContext): Promise<{ gain: number, audioBuffer: AudioBuffer | null }> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    let peak = 0;
    for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
      const channelData = audioBuffer.getChannelData(c);
      for (let i = 0; i < channelData.length; i++) {
        const absValue = Math.abs(channelData[i]);
        if (absValue > peak) {
          peak = absValue;
        }
      }
    }
    
    // Target peak is 0.5 (approx -6dB)
    const targetPeak = 0.5;
    if (peak === 0) return { gain: 1, audioBuffer };
    
    // Limit max gain to avoid blowing out speakers
    const gain = Math.min(targetPeak / peak, 3.0);
    return { gain, audioBuffer };
  } catch (error) {
    console.error("Error analyzing loudness:", error);
    return { gain: 1, audioBuffer: null };
  }
};
