export type ReadyNotificationAudioRef = {
  current: AudioContext | null;
};

type WindowWithWebkitAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export async function playReadyNotification(
  audioContextRef: ReadyNotificationAudioRef
) {
  const AudioContextConstructor =
    window.AudioContext ??
    (window as WindowWithWebkitAudio).webkitAudioContext;

  if (!AudioContextConstructor) {
    return true;
  }

  try {
    const audioContext =
      audioContextRef.current ?? new AudioContextConstructor();
    audioContextRef.current = audioContext;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const startTime = audioContext.currentTime;
    const masterGain = audioContext.createGain();
    const notes = [
      { frequency: 659.25, startOffset: 0, duration: 0.34, peak: 0.13 },
      { frequency: 880, startOffset: 0.13, duration: 0.38, peak: 0.11 },
      { frequency: 1174.66, startOffset: 0.28, duration: 0.48, peak: 0.08 }
    ];

    masterGain.gain.setValueAtTime(0.82, startTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.86);
    masterGain.connect(audioContext.destination);

    notes.forEach(({ frequency, startOffset, duration, peak }) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const noteStart = startTime + startOffset;
      const noteEnd = noteStart + duration;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * 0.985,
        noteEnd
      );
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(peak, noteStart + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

      oscillator.connect(gain);
      gain.connect(masterGain);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd + 0.02);
    });

    return true;
  } catch {
    return false;
  }
}
