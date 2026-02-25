import { useRef, useCallback } from 'react';

// Progressão harmônica premium: Am9 → Fmaj7 → Cmaj9 → Em7 (ciclo de 48 segundos)
const chordProgressions = [
  { // Am9 - melancólico com 9a (B)
    arpeggio: [110, 164.81, 196, 246.94, 329.63, 196], // A, E, G, B, E5, G
    pad: [110, 164.81, 196, 246.94], // A, E, G, B
    shimmer: [659.26, 880], // E5, A5 (oitavas)
    drone: 55
  },
  { // Fmaj7 - caloroso com 7a maior (E)
    arpeggio: [87.31, 130.81, 174.61, 164.81, 261.63, 174.61], // F, C, F4, E, C5, F
    pad: [87.31, 130.81, 174.61, 164.81], // F, C, F4, E
    shimmer: [523.25, 698.46], // C5, F5
    drone: 43.65
  },
  { // Cmaj9 - luminoso com 9a (D)
    arpeggio: [130.81, 196, 261.63, 293.66, 392, 261.63], // C, G, C5, D, G5, C
    pad: [130.81, 196, 246.94, 293.66], // C, G, B, D
    shimmer: [523.25, 784], // C5, G5
    drone: 65.41
  },
  { // Em7 - tensão suave
    arpeggio: [82.41, 123.47, 164.81, 196, 246.94, 164.81], // E, B, E4, G, B, E
    pad: [82.41, 123.47, 164.81, 293.66], // E, B, E4, D
    shimmer: [659.26, 987.77], // E5, B5
    drone: 41.20
  }
];

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const warmthRef = useRef<WaveShaperNode | null>(null);
  const warmthGainRef = useRef<GainNode | null>(null);
  const preDelayRef = useRef<DelayNode | null>(null);
  
  const bgmNodesRef = useRef<OscillatorNode[]>([]);
  const bgmGainsRef = useRef<GainNode[]>([]);
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const arpeggioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chordIndexRef = useRef<number>(0);
  const chordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentArpeggioRef = useRef<number[]>(chordProgressions[0].arpeggio);
  const currentShimmerRef = useRef<number[]>(chordProgressions[0].shimmer);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneOsc2Ref = useRef<OscillatorNode | null>(null);
  const padOscillatorsRef = useRef<OscillatorNode[]>([]);
  const padGainsRef = useRef<GainNode[]>([]);
  const shimmerOscillatorsRef = useRef<OscillatorNode[]>([]);
  const shimmerGainsRef = useRef<GainNode[]>([]);

  // Criar impulse response para reverb premium (4s com early reflections)
  const createReverbImpulse = useCallback((ctx: AudioContext) => {
    const rate = ctx.sampleRate;
    const length = rate * 4; // 4 segundos
    const impulse = ctx.createBuffer(2, length, rate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / rate;
        // Early reflections (primeiros 80ms) - mais definidas
        const early = t < 0.08 ? Math.random() * 0.5 * Math.pow(1 - t / 0.08, 0.5) : 0;
        // Tail com decay exponencial suave
        const tail = Math.random() * Math.pow(1 - i / length, 2.8);
        // Leve diferença L/R para espacialidade
        const stereoOffset = channel === 0 ? 1 : 0.95;
        data[i] = (early + tail * 0.7) * stereoOffset;
      }
    }
    
    return impulse;
  }, []);

  // Criar curva de saturação suave (tape warmth)
  const createWarmthCurve = useCallback(() => {
    const curve = new Float32Array(65536);
    for (let i = 0; i < 65536; i++) {
      const x = (i - 32768) / 32768;
      // Curva de saturação suave estilo tape
      curve[i] = Math.tanh(x * 1.15) * 0.92;
    }
    return curve;
  }, []);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioContextRef.current;
      
      // === MASTER CHAIN PREMIUM ===
      
      // Compressor suave estilo mastering (3:1 ratio)
      compressorRef.current = ctx.createDynamicsCompressor();
      compressorRef.current.threshold.value = -18;
      compressorRef.current.knee.value = 20;
      compressorRef.current.ratio.value = 3;
      compressorRef.current.attack.value = 0.01;
      compressorRef.current.release.value = 0.15;
      
      // Master gain
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.gain.value = 0.35;
      
      // Dry path
      dryGainRef.current = ctx.createGain();
      dryGainRef.current.gain.value = 0.65;
      
      // Reverb com pre-delay
      preDelayRef.current = ctx.createDelay();
      preDelayRef.current.delayTime.value = 0.025; // 25ms pre-delay
      
      reverbNodeRef.current = ctx.createConvolver();
      reverbNodeRef.current.buffer = createReverbImpulse(ctx);
      
      reverbGainRef.current = ctx.createGain();
      reverbGainRef.current.gain.value = 0.25;
      
      // Warmth (saturação suave)
      warmthRef.current = ctx.createWaveShaper();
      warmthRef.current.curve = createWarmthCurve();
      warmthRef.current.oversample = '2x';
      
      warmthGainRef.current = ctx.createGain();
      warmthGainRef.current.gain.value = 0.10;
      
      // Roteamento master chain
      // Dry path: master -> dry -> compressor
      masterGainRef.current.connect(dryGainRef.current);
      dryGainRef.current.connect(compressorRef.current);
      
      // Reverb path: master -> preDelay -> reverb -> reverbGain -> compressor
      masterGainRef.current.connect(preDelayRef.current);
      preDelayRef.current.connect(reverbNodeRef.current);
      reverbNodeRef.current.connect(reverbGainRef.current);
      reverbGainRef.current.connect(compressorRef.current);
      
      // Warmth path: master -> warmth -> warmthGain -> compressor
      masterGainRef.current.connect(warmthRef.current);
      warmthRef.current.connect(warmthGainRef.current);
      warmthGainRef.current.connect(compressorRef.current);
      
      // Output
      compressorRef.current.connect(ctx.destination);
    }
    return audioContextRef.current;
  }, [createReverbImpulse, createWarmthCurve]);

  const startBGM = useCallback(() => {
    const ctx = initAudioContext();
    if (bgmNodesRef.current.length > 0) return;

    const now = ctx.currentTime;
    const BPM = 58; // Mais lento e épico
    const beatDuration = 60 / BPM;
    
    // Reset chord index
    chordIndexRef.current = 0;
    currentArpeggioRef.current = chordProgressions[0].arpeggio;
    currentShimmerRef.current = chordProgressions[0].shimmer;

    // === CAMADA 1: DRONE SUB-BASS (Centro, <80Hz) ===
    const droneOsc = ctx.createOscillator();
    const droneOsc2 = ctx.createOscillator();
    const droneGain = ctx.createGain();
    const droneLFO = ctx.createOscillator();
    const droneLFOGain = ctx.createGain();
    const droneFilter = ctx.createBiquadFilter();
    const droneEQ = ctx.createBiquadFilter();
    const dronePanner = ctx.createStereoPanner();

    droneOsc.type = 'sine';
    droneOsc2.type = 'triangle';
    droneOsc.frequency.value = chordProgressions[0].drone;
    droneOsc2.frequency.value = chordProgressions[0].drone;
    
    droneOscRef.current = droneOsc;
    droneOsc2Ref.current = droneOsc2;

    // LFO muito lento para movimento orgânico
    droneLFO.type = 'sine';
    droneLFO.frequency.value = 0.05;
    droneLFOGain.gain.value = 1.5;
    droneLFO.connect(droneLFOGain);
    droneLFOGain.connect(droneOsc.frequency);

    // EQ: lowshelf boost no sub-bass (sutil para evitar clipping)
    droneEQ.type = 'lowshelf';
    droneEQ.frequency.value = 80;
    droneEQ.gain.value = 1.5; // Reduzido de 3 para evitar acúmulo

    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 120;

    // Centro (âncora grave)
    dronePanner.pan.value = 0;

    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.07, now + 5); // Reduzido de 0.12

    droneOsc.connect(droneFilter);
    droneOsc2.connect(droneFilter);
    droneFilter.connect(droneEQ);
    droneEQ.connect(droneGain);
    droneGain.connect(dronePanner);
    dronePanner.connect(masterGainRef.current!);

    droneOsc.start();
    droneOsc2.start();
    droneLFO.start();

    bgmNodesRef.current.push(droneOsc, droneOsc2, droneLFO);
    bgmGainsRef.current.push(droneGain);

    // === CAMADA 2: HEARTBEAT SWELL (Centro, 40-100Hz) ===
    const playHeartbeat = () => {
      const heartbeatOsc = ctx.createOscillator();
      const heartbeatGain = ctx.createGain();
      const heartbeatFilter = ctx.createBiquadFilter();
      const heartbeatEQ = ctx.createBiquadFilter();

      heartbeatOsc.type = 'sine';
      heartbeatOsc.frequency.setValueAtTime(42, ctx.currentTime);
      heartbeatOsc.frequency.exponentialRampToValueAtTime(22, ctx.currentTime + 0.5);

      // EQ: bandpass para isolar do drone
      heartbeatEQ.type = 'bandpass';
      heartbeatEQ.frequency.value = 55;
      heartbeatEQ.Q.value = 1.2;

      heartbeatFilter.type = 'lowpass';
      heartbeatFilter.frequency.value = 90;

      // Envelope de swell suave (níveis controlados)
      heartbeatGain.gain.setValueAtTime(0, ctx.currentTime);
      heartbeatGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.2); // Reduzido de 0.07
      heartbeatGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      heartbeatOsc.connect(heartbeatFilter);
      heartbeatFilter.connect(heartbeatEQ);
      heartbeatEQ.connect(heartbeatGain);
      heartbeatGain.connect(masterGainRef.current!);

      heartbeatOsc.start();
      heartbeatOsc.stop(ctx.currentTime + 0.9);
    };

    pulseIntervalRef.current = setInterval(playHeartbeat, beatDuration * 2 * 1000);

    // === CAMADA 3: ARPEJO PREMIUM (Ping-pong stereo, 300Hz-3kHz) ===
    let arpeggioIndex = 0;
    const arpeggioSpeed = 320; // Mais lento, mais contemplativo

    const playArpeggioNote = () => {
      const freq = currentArpeggioRef.current[arpeggioIndex];
      
      // Timbres suaves: triangle + sine + detuned sine
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const arpeggioEQ = ctx.createBiquadFilter();
      const arpPanner = ctx.createStereoPanner();
      const arpDelay = ctx.createDelay();
      const arpDelayGain = ctx.createGain();

      osc.type = 'triangle'; // Suave, quente
      osc2.type = 'sine';    // Puro, limpo
      osc3.type = 'sine';    // Chorus sutil
      osc.frequency.value = freq;
      osc2.frequency.value = freq;
      osc3.frequency.value = freq * 1.003; // Detuning para chorus

      // EQ: highpass para limpar baixos
      arpeggioEQ.type = 'highpass';
      arpeggioEQ.frequency.value = 200;

      filter.type = 'lowpass';
      filter.frequency.value = 2200;
      filter.Q.value = 2;

      // Ping-pong stereo
      arpPanner.pan.value = (arpeggioIndex % 2 === 0) ? -0.5 : 0.5;

      // Delay sutil para eco
      arpDelay.delayTime.value = 0.18;
      arpDelayGain.gain.value = 0.25;

      const noteNow = ctx.currentTime;
      gain.gain.setValueAtTime(0, noteNow);
      gain.gain.linearRampToValueAtTime(0.028, noteNow + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.008, noteNow + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, noteNow + 0.25);

      osc.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(arpeggioEQ);
      arpeggioEQ.connect(arpPanner);
      arpPanner.connect(gain);
      
      // Delay path
      arpPanner.connect(arpDelay);
      arpDelay.connect(arpDelayGain);
      arpDelayGain.connect(masterGainRef.current!);
      
      gain.connect(masterGainRef.current!);

      osc.start();
      osc2.start();
      osc3.start();
      osc.stop(noteNow + 0.35);
      osc2.stop(noteNow + 0.35);
      osc3.stop(noteNow + 0.35);

      arpeggioIndex = (arpeggioIndex + 1) % currentArpeggioRef.current.length;
    };

    arpeggioIntervalRef.current = setInterval(playArpeggioNote, arpeggioSpeed);

    // === CAMADA 4: PAD ATMOSFÉRICO WIDE STEREO (200-800Hz) ===
    const createWidePad = (freqs: number[]) => {
      padOscillatorsRef.current = [];
      padGainsRef.current = [];
      
      freqs.forEach((freq, idx) => {
        // Par estéreo com detuning
        const leftOsc = ctx.createOscillator();
        const rightOsc = ctx.createOscillator();
        const leftGain = ctx.createGain();
        const rightGain = ctx.createGain();
        const leftPan = ctx.createStereoPanner();
        const rightPan = ctx.createStereoPanner();
        const padFilter = ctx.createBiquadFilter();
        const padEQ = ctx.createBiquadFilter();
        const padFilterLFO = ctx.createOscillator();
        const padFilterLFOGain = ctx.createGain();

        leftOsc.type = 'sine';
        rightOsc.type = 'sine';
        leftOsc.frequency.value = freq * 0.997; // Leve detune L
        rightOsc.frequency.value = freq * 1.003; // Leve detune R

        // EQ: cut mud frequencies
        padEQ.type = 'peaking';
        padEQ.frequency.value = 400;
        padEQ.Q.value = 1.5;
        padEQ.gain.value = -2;

        padFilter.type = 'lowpass';
        padFilter.frequency.value = 600;

        // LFO muito lento no filtro para "respiração"
        padFilterLFO.type = 'sine';
        padFilterLFO.frequency.value = 0.025;
        padFilterLFOGain.gain.value = 150;
        padFilterLFO.connect(padFilterLFOGain);
        padFilterLFOGain.connect(padFilter.frequency);

        // Wide stereo
        leftPan.pan.value = -0.4;
        rightPan.pan.value = 0.4;

        const targetGain = 0.022 - idx * 0.004;
        leftGain.gain.setValueAtTime(0, ctx.currentTime);
        rightGain.gain.setValueAtTime(0, ctx.currentTime);
        leftGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 6);
        rightGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 6);

        leftOsc.connect(padFilter);
        rightOsc.connect(padFilter);
        padFilter.connect(padEQ);
        
        padEQ.connect(leftGain);
        padEQ.connect(rightGain);
        leftGain.connect(leftPan);
        rightGain.connect(rightPan);
        leftPan.connect(masterGainRef.current!);
        rightPan.connect(masterGainRef.current!);

        leftOsc.start();
        rightOsc.start();
        padFilterLFO.start();

        bgmNodesRef.current.push(leftOsc, rightOsc, padFilterLFO);
        padOscillatorsRef.current.push(leftOsc, rightOsc);
        padGainsRef.current.push(leftGain, rightGain);
        bgmGainsRef.current.push(leftGain, rightGain);
      });
    };

    createWidePad(chordProgressions[0].pad);

    // === CAMADA 5: SHIMMER TEXTURE (>4kHz, direita) ===
    const createShimmer = (freqs: number[]) => {
      shimmerOscillatorsRef.current = [];
      shimmerGainsRef.current = [];
      
      freqs.forEach((freq, idx) => {
        const shimmerOsc = ctx.createOscillator();
        const shimmerOsc2 = ctx.createOscillator();
        const shimmerGain = ctx.createGain();
        const shimmerFilter = ctx.createBiquadFilter();
        const shimmerPanner = ctx.createStereoPanner();
        const shimmerLFO = ctx.createOscillator();
        const shimmerLFOGain = ctx.createGain();

        shimmerOsc.type = 'sine';
        shimmerOsc2.type = 'sine';
        shimmerOsc.frequency.value = freq;
        shimmerOsc2.frequency.value = freq * 1.005; // Leve detuning

        shimmerFilter.type = 'bandpass';
        shimmerFilter.frequency.value = 5000;
        shimmerFilter.Q.value = 1.5;

        // Tremolo sutil
        shimmerLFO.type = 'sine';
        shimmerLFO.frequency.value = 0.3 + idx * 0.1;
        shimmerLFOGain.gain.value = 0.004;
        shimmerLFO.connect(shimmerLFOGain);
        shimmerLFOGain.connect(shimmerGain.gain);

        // Posição direita para "brilho"
        shimmerPanner.pan.value = 0.5;

        shimmerGain.gain.setValueAtTime(0, ctx.currentTime);
        shimmerGain.gain.linearRampToValueAtTime(0.012 - idx * 0.003, ctx.currentTime + 8);

        shimmerOsc.connect(shimmerFilter);
        shimmerOsc2.connect(shimmerFilter);
        shimmerFilter.connect(shimmerGain);
        shimmerGain.connect(shimmerPanner);
        shimmerPanner.connect(masterGainRef.current!);

        shimmerOsc.start();
        shimmerOsc2.start();
        shimmerLFO.start();

        bgmNodesRef.current.push(shimmerOsc, shimmerOsc2, shimmerLFO);
        shimmerOscillatorsRef.current.push(shimmerOsc, shimmerOsc2);
        shimmerGainsRef.current.push(shimmerGain);
        bgmGainsRef.current.push(shimmerGain);
      });
    };

    createShimmer(chordProgressions[0].shimmer);

    // === TROCA DE ACORDES A CADA 12 SEGUNDOS (crossfade suave) ===
    const changeChord = () => {
      chordIndexRef.current = (chordIndexRef.current + 1) % chordProgressions.length;
      const newChord = chordProgressions[chordIndexRef.current];
      const transitionTime = 3; // 3 segundos de crossfade
      
      // Atualiza arpejo e shimmer refs
      currentArpeggioRef.current = newChord.arpeggio;
      currentShimmerRef.current = newChord.shimmer;
      
      // Transição suave do drone
      if (droneOscRef.current && droneOsc2Ref.current) {
        const targetTime = ctx.currentTime + transitionTime;
        droneOscRef.current.frequency.linearRampToValueAtTime(newChord.drone, targetTime);
        droneOsc2Ref.current.frequency.linearRampToValueAtTime(newChord.drone, targetTime);
      }
      
      // Crossfade pads
      const padCount = newChord.pad.length;
      padOscillatorsRef.current.forEach((osc, idx) => {
        const freqIdx = Math.floor(idx / 2) % padCount;
        const isLeft = idx % 2 === 0;
        const newFreq = newChord.pad[freqIdx] * (isLeft ? 0.997 : 1.003);
        osc.frequency.linearRampToValueAtTime(newFreq, ctx.currentTime + transitionTime);
      });
      
      // Crossfade shimmer
      const shimmerCount = newChord.shimmer.length;
      shimmerOscillatorsRef.current.forEach((osc, idx) => {
        const freqIdx = Math.floor(idx / 2) % shimmerCount;
        const isDetuned = idx % 2 === 1;
        const newFreq = newChord.shimmer[freqIdx] * (isDetuned ? 1.005 : 1);
        osc.frequency.linearRampToValueAtTime(newFreq, ctx.currentTime + transitionTime);
      });
    };

    chordIntervalRef.current = setInterval(changeChord, 12000);

  }, [initAudioContext]);

  const playClickSFX = useCallback(() => {
    const ctx = initAudioContext();
    
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sine';
    osc2.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
    osc2.frequency.setValueAtTime(600, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
    
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    
    gain.gain.setValueAtTime(0.10, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainRef.current!);
    
    osc.start();
    osc2.start();
    osc.stop(ctx.currentTime + 0.06);
    osc2.stop(ctx.currentTime + 0.06);
  }, [initAudioContext]);

  const playTransitionSFX = useCallback(() => {
    const ctx = initAudioContext();
    
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(200, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainRef.current!);
    
    osc.start();
    osc2.start();
    osc.stop(ctx.currentTime + 0.25);
    osc2.stop(ctx.currentTime + 0.25);
  }, [initAudioContext]);

  const playCompletionSFX = useCallback(() => {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    
    // === ACHIEVEMENT CHIME PREMIUM ===
    const mainFreq = 1046.50; // C6
    
    // Sino principal
    const mainOsc = ctx.createOscillator();
    const mainGain = ctx.createGain();
    
    mainOsc.type = 'sine';
    mainOsc.frequency.value = mainFreq;
    
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.30, now + 0.015);
    mainGain.gain.exponentialRampToValueAtTime(0.12, now + 0.25);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    
    // Oitava alta para brilho
    const highOsc = ctx.createOscillator();
    const highGain = ctx.createGain();
    
    highOsc.type = 'sine';
    highOsc.frequency.value = mainFreq * 2;
    
    highGain.gain.setValueAtTime(0, now);
    highGain.gain.linearRampToValueAtTime(0.10, now + 0.015);
    highGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    
    // Quinta com delay
    const fifthOsc = ctx.createOscillator();
    const fifthGain = ctx.createGain();
    
    fifthOsc.type = 'sine';
    fifthOsc.frequency.value = 1567.98; // G6
    
    const fifthStart = now + 0.1;
    fifthGain.gain.setValueAtTime(0, fifthStart);
    fifthGain.gain.linearRampToValueAtTime(0.20, fifthStart + 0.015);
    fifthGain.gain.exponentialRampToValueAtTime(0.06, fifthStart + 0.35);
    fifthGain.gain.exponentialRampToValueAtTime(0.001, fifthStart + 1.1);
    
    // Harmônicos shimmer
    [2, 3, 4, 5].forEach((mult, i) => {
      const harmOsc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      
      harmOsc.type = 'sine';
      harmOsc.frequency.value = mainFreq * mult;
      
      const harmStart = now + 0.06 + i * 0.025;
      harmGain.gain.setValueAtTime(0, harmStart);
      harmGain.gain.linearRampToValueAtTime(0.05 / mult, harmStart + 0.025);
      harmGain.gain.exponentialRampToValueAtTime(0.001, harmStart + 0.7);
      
      harmOsc.connect(harmGain);
      harmGain.connect(masterGainRef.current!);
      harmOsc.start(harmStart);
      harmOsc.stop(harmStart + 0.8);
    });
    
    mainOsc.connect(mainGain);
    highOsc.connect(highGain);
    fifthOsc.connect(fifthGain);
    
    mainGain.connect(masterGainRef.current!);
    highGain.connect(masterGainRef.current!);
    fifthGain.connect(masterGainRef.current!);
    
    mainOsc.start(now);
    highOsc.start(now);
    fifthOsc.start(fifthStart);
    
    mainOsc.stop(now + 1.5);
    highOsc.stop(now + 1.0);
    fifthOsc.stop(fifthStart + 1.2);
  }, [initAudioContext]);

  const playCelebrationSFX = useCallback(() => {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    
    // === TRIUMPHANT FANFARE PREMIUM ===
    const notes = [
      { freq: 523.25, start: 0, duration: 0.18 },      // C5
      { freq: 659.25, start: 0.14, duration: 0.18 },   // E5
      { freq: 783.99, start: 0.28, duration: 0.18 },   // G5
      { freq: 1046.50, start: 0.42, duration: 1.0 },   // C6 - sustain
    ];
    
    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const panner = ctx.createStereoPanner();
      
      osc.type = 'sine';
      osc2.type = 'triangle';
      osc.frequency.value = freq;
      osc2.frequency.value = freq;
      
      filter.type = 'lowpass';
      filter.frequency.value = 3500;
      
      // Stereo spread progressivo
      panner.pan.value = (start * 0.5) - 0.1;
      
      const noteStart = now + start;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.025);
      gain.gain.setValueAtTime(0.22, noteStart + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);
      
      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(panner);
      panner.connect(gain);
      gain.connect(masterGainRef.current!);
      
      osc.start(noteStart);
      osc2.start(noteStart);
      osc.stop(noteStart + duration + 0.1);
      osc2.stop(noteStart + duration + 0.1);
    });
    
    // Shimmer sparkles com stereo spread
    for (let i = 0; i < 10; i++) {
      const sparkle = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      const sparklePanner = ctx.createStereoPanner();
      
      sparkle.type = 'sine';
      sparkle.frequency.value = 2500 + Math.random() * 2500;
      
      sparklePanner.pan.value = (Math.random() - 0.5) * 1.4;
      
      const sparkleStart = now + 0.5 + i * 0.06;
      sparkleGain.gain.setValueAtTime(0, sparkleStart);
      sparkleGain.gain.linearRampToValueAtTime(0.06, sparkleStart + 0.015);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, sparkleStart + 0.18);
      
      sparkle.connect(sparklePanner);
      sparklePanner.connect(sparkleGain);
      sparkleGain.connect(masterGainRef.current!);
      
      sparkle.start(sparkleStart);
      sparkle.stop(sparkleStart + 0.22);
    }
    
    // Bass resolution
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    
    bassOsc.type = 'sine';
    bassOsc.frequency.value = 130.81; // C3
    
    bassGain.gain.setValueAtTime(0, now + 0.42);
    bassGain.gain.linearRampToValueAtTime(0.12, now + 0.48);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    
    bassOsc.connect(bassGain);
    bassGain.connect(masterGainRef.current!);
    
    bassOsc.start(now + 0.42);
    bassOsc.stop(now + 1.9);
  }, [initAudioContext]);

  const fadeOutBGM = useCallback((duration: number = 4) => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    if (arpeggioIntervalRef.current) {
      clearInterval(arpeggioIntervalRef.current);
      arpeggioIntervalRef.current = null;
    }
    if (chordIntervalRef.current) {
      clearInterval(chordIntervalRef.current);
      chordIntervalRef.current = null;
    }
    
    if (audioContextRef.current && bgmGainsRef.current.length > 0) {
      const now = audioContextRef.current.currentTime;
      
      bgmGainsRef.current.forEach(gain => {
        gain.gain.linearRampToValueAtTime(0, now + duration);
      });
      
      setTimeout(() => {
        bgmNodesRef.current.forEach(osc => {
          try { osc.stop(); } catch {}
        });
        bgmNodesRef.current = [];
        bgmGainsRef.current = [];
        padOscillatorsRef.current = [];
        padGainsRef.current = [];
        shimmerOscillatorsRef.current = [];
        shimmerGainsRef.current = [];
        droneOscRef.current = null;
        droneOsc2Ref.current = null;
      }, duration * 1000 + 100);
    }
  }, []);

  const stopBGM = useCallback(() => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    if (arpeggioIntervalRef.current) {
      clearInterval(arpeggioIntervalRef.current);
      arpeggioIntervalRef.current = null;
    }
    if (chordIntervalRef.current) {
      clearInterval(chordIntervalRef.current);
      chordIntervalRef.current = null;
    }
    
    if (audioContextRef.current && bgmGainsRef.current.length > 0) {
      const now = audioContextRef.current.currentTime;
      
      bgmGainsRef.current.forEach(gain => {
        gain.gain.linearRampToValueAtTime(0, now + 2.5);
      });
      
      setTimeout(() => {
        bgmNodesRef.current.forEach(osc => {
          try { osc.stop(); } catch {}
        });
        bgmNodesRef.current = [];
        bgmGainsRef.current = [];
        padOscillatorsRef.current = [];
        padGainsRef.current = [];
        shimmerOscillatorsRef.current = [];
        shimmerGainsRef.current = [];
        droneOscRef.current = null;
        droneOsc2Ref.current = null;
      }, 2600);
    }
  }, []);

  return {
    startBGM,
    stopBGM,
    fadeOutBGM,
    playClickSFX,
    playTransitionSFX,
    playCompletionSFX,
    playCelebrationSFX,
  };
}
