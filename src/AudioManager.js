const AudioManager = {
  audioContext: null,
  initialized: false,

  init() {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API non supportée');
    }
  },

  playBeep(frequency = 800, duration = 200, volume = 0.3) {
    if (!this.initialized) this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  },

  playCountdownSound(timeRemaining) {
    const frequency = 600 + (5 - timeRemaining) * 100; // 600Hz à 5s → 1000Hz à 1s
    this.playBeep(frequency, 150, 0.4);
  },

  playAlertSound() {
    this.playBeep(600, 300, 0.5);
  },

  playTimeWarningSound() {
    this.playBeep(400, 400, 0.6);
    setTimeout(() => this.playBeep(400, 400, 0.6), 500);
  }
};

export default AudioManager;