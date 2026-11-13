// Web Audio API Synthesizer - 100% self-contained, no external audio files required!

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxVol: number = 0.8;
  private musicVol: number = 0.5;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(sfx: number, music: number) {
    this.sfxVol = Math.max(0, Math.min(1, sfx));
    this.musicVol = Math.max(0, Math.min(1, music));
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play delicate or hard wooden click on puck collisions
  public playWoodClick(velocity: number = 10) {
    if (this.isMuted || this.sfxVol <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const baseFreq = 700 + Math.random() * 250;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      const vol = Math.min(0.6, Math.max(0.08, (velocity / 25) * 0.5)) * this.sfxVol;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  // Foul buzzer sound when striker is pocketed
  public playFoulSound() {
    if (this.isMuted || this.sfxVol <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(95, this.ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.3 * this.sfxVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  // Cushion bumper bounce
  public playCushionBounce(velocity: number = 10) {
    if (this.isMuted || this.sfxVol <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

      const vol = Math.min(0.5, Math.max(0.1, (velocity / 30) * 0.4)) * this.sfxVol;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {}
  }

  // Striker flick release whoosh (calibrated to power)
  public playFlick(powerRatio: number = 0.5) {
    if (this.isMuted || this.sfxVol <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150 + powerRatio * 300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450 + powerRatio * 400, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25 * this.sfxVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch {}
  }

  // Candy Crush combo chime (Ascending sweet scale: C, E, G, C6, E6)
  public playSweetCombo(comboLevel: number) {
    if (this.isMuted || this.sfxVol <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      const rootIndex = Math.min(comboLevel - 1, notes.length - 2);

      const playChimeNote = (freq: number, delay: number, dur: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.35 * this.sfxVol, this.ctx.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + dur);
      };

      playChimeNote(notes[rootIndex], 0, 0.4);
      playChimeNote(notes[rootIndex + 1], 0.08, 0.45);
      if (comboLevel >= 3) {
        playChimeNote(notes[Math.min(rootIndex + 2, notes.length - 1)], 0.16, 0.5);
      }
    } catch {}
  }

  // Board 90° rotation whoosh
  public playRotateWhoosh() {
    if (this.isMuted || this.sfxVol <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.18 * this.sfxVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  // Level Win Fanfare
  public playLevelClear() {
    if (this.isMuted || this.sfxVol <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const chords = [
        { f: 523.25, t: 0.0 },
        { f: 659.25, t: 0.1 },
        { f: 783.99, t: 0.2 },
        { f: 1046.50, t: 0.3 },
        { f: 1318.51, t: 0.45 },
      ];

      chords.forEach(({ f, t }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + t);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + t);
        gain.gain.linearRampToValueAtTime(0.3 * this.sfxVol, this.ctx.currentTime + t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + t + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + t);
        osc.stop(this.ctx.currentTime + t + 0.5);
      });
    } catch {}
  }

  // Coin collect ping
  public playCoinSound() {
    if (this.isMuted || this.sfxVol <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6

      gain.gain.setValueAtTime(0.2 * this.sfxVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  // Start background zen chillhop musical chords loop
  public startAmbientBgm() {
    if (this.bgmInterval) return;
    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || this.musicVol <= 0) return;
      try {
        this.initCtx();
        if (!this.ctx) return;

        // Warm pentatonic pad chords
        const chords = [
          [261.63, 329.63, 392.00], // C Maj
          [220.00, 261.63, 329.63], // A min
          [174.61, 220.00, 261.63], // F Maj
          [196.00, 246.94, 293.66], // G Maj
        ];
        const chord = chords[Math.floor(Math.random() * chords.length)];

        chord.forEach(f => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.04 * this.musicVol, this.ctx.currentTime + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 4.5);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 4.5);
        });
      } catch {}
    }, 4800);
  }

  public stopAmbientBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const sounds = new SoundEngine();
