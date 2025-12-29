let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

export const initAudio = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.connect(audioCtx.destination);
      masterGain.gain.value = 0.3; // Default volume 30%
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const setMute = (muted: boolean) => {
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : 0.3;
  }
};

const playTone = (
  freq: number, 
  type: OscillatorType, 
  duration: number, 
  startTime: number = 0, 
  vol: number = 0.1,
  slideFreq?: number
) => {
  if (!audioCtx || !masterGain) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t + startTime);
  if (slideFreq) {
    osc.frequency.exponentialRampToValueAtTime(slideFreq, t + startTime + duration);
  }
  
  gain.gain.setValueAtTime(vol, t + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, t + startTime + duration);
  
  osc.connect(gain);
  gain.connect(masterGain);
  
  osc.start(t + startTime);
  osc.stop(t + startTime + duration);
};

export const playClick = () => {
  initAudio();
  // Wood block / high tick
  playTone(800, 'sine', 0.05, 0, 0.1);
};

export const playCorrect = () => {
  initAudio();
  // Magical chime (C major arpeggio)
  const now = 0;
  playTone(523.25, 'sine', 0.3, now, 0.1);       // C5
  playTone(659.25, 'sine', 0.3, now + 0.08, 0.1); // E5
  playTone(783.99, 'sine', 0.6, now + 0.16, 0.1); // G5
  playTone(1046.50, 'sine', 0.8, now + 0.24, 0.05); // C6
};

export const playWrong = () => {
  initAudio();
  // Discordant low buzz/slide
  playTone(150, 'sawtooth', 0.4, 0, 0.15, 80);
};

export const playWin = () => {
  initAudio();
  // Victory fanfare
  const now = 0;
  playTone(523.25, 'square', 0.15, now, 0.1); // C5
  playTone(523.25, 'square', 0.15, now + 0.15, 0.1); // C5
  playTone(523.25, 'square', 0.15, now + 0.30, 0.1); // C5
  playTone(783.99, 'square', 0.6, now + 0.45, 0.15); // G5
};

export const playBossHit = () => {
  initAudio();
  // Impact noise (Synthesis)
  if (!audioCtx || !masterGain) return;
  const t = audioCtx.currentTime;
  
  const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 seconds
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.3, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(800, t);
  noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.2);
  
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  
  noise.start(t);
};

export const playGameOver = () => {
  initAudio();
  // Sad descending slide
  playTone(400, 'triangle', 0.8, 0, 0.2, 200);
  playTone(380, 'triangle', 0.8, 0.1, 0.2, 180);
};

export const playLevelUp = () => {
   initAudio();
   const now = 0;
   playTone(440, 'sine', 0.1, now, 0.1);
   playTone(554, 'sine', 0.1, now + 0.1, 0.1);
   playTone(659, 'sine', 0.4, now + 0.2, 0.1);
};