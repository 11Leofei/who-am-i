// Cosmic Audio Engine — Web Audio API synthesized sounds
// No external audio files needed

class CosmicAudio {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.ambientGain = null;
        this.muted = false;
        this.initialized = false;
        this.ambientNodes = [];
        this.questionIndex = 0;
        // Pentatonic scale for answer confirmation
        this.pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00]; // C5 D5 E5 G5 A5
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 1.0;
            this.masterGain.connect(this.ctx.destination);

            this.ambientGain = this.ctx.createGain();
            this.ambientGain.gain.value = 0;
            this.ambientGain.connect(this.masterGain);

            // Pre-allocate noise buffer for transitions (avoids per-call allocation)
            const bufferSize = this.ctx.sampleRate;
            this._noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const d = this._noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                d[i] = Math.random() * 2 - 1;
            }

            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    setMuted(muted) {
        this.muted = muted;
        if (!this.masterGain) return;
        this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.1);
    }

    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }

    // ==================== AMBIENT ====================

    startAmbient() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // 1. Low-frequency drone (50Hz sine)
        const drone = this.ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.value = 50;
        const droneGain = this.ctx.createGain();
        droneGain.gain.value = 0.06;
        drone.connect(droneGain);
        droneGain.connect(this.ambientGain);
        drone.start(now);
        this.ambientNodes.push(drone, droneGain);

        // 2. Second sub-harmonic (75Hz)
        const drone2 = this.ctx.createOscillator();
        drone2.type = 'sine';
        drone2.frequency.value = 75;
        const drone2Gain = this.ctx.createGain();
        drone2Gain.gain.value = 0.03;
        drone2.connect(drone2Gain);
        drone2Gain.connect(this.ambientGain);
        drone2.start(now);
        this.ambientNodes.push(drone2, drone2Gain);

        // 3. Filtered noise bed
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 200;
        noiseFilter.Q.value = 0.5;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.value = 0.015;

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ambientGain);
        noiseSource.start(now);
        this.ambientNodes.push(noiseSource, noiseFilter, noiseGain);

        // Fade in ambient
        this.ambientGain.gain.setTargetAtTime(1.0, now, 2.0);

        // 4. Random high-frequency sparkles
        this._sparkleInterval = setInterval(() => {
            if (this.muted || !this.ctx) return;
            if (Math.random() > 0.3) return;
            this._playSparkle();
        }, 3000);
    }

    _playSparkle() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 2000 + Math.random() * 4000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.008 + Math.random() * 0.008, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + Math.random() * 1.2);
        osc.connect(gain);
        gain.connect(this.ambientGain);
        osc.start(now);
        osc.stop(now + 2.5);
    }

    stopAmbient() {
        if (this.ambientGain) {
            this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
        }
        if (this._sparkleInterval) {
            clearInterval(this._sparkleInterval);
            this._sparkleInterval = null;
        }
    }

    // ==================== UI SOUNDS ====================

    playHover() {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 1200;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    playClick() {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 780 + Math.random() * 40;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.16);
    }

    // ==================== TRANSITIONS ====================

    playTransition() {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const duration = 0.4;

        // Reuse pre-allocated noise buffer
        const source = this.ctx.createBufferSource();
        source.buffer = this._noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + duration);
        filter.Q.value = 2;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.04, now + duration * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        source.start(now);
        source.stop(now + duration + 0.1);
    }

    // ==================== WARP ENGINE ====================

    playWarp() {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const duration = 2.0;

        // Rising sawtooth 80→400Hz
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.3);
        gain.gain.setValueAtTime(0.07, now + duration - 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration + 0.1);

        // Sub-bass rumble
        const sub = this.ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(40, now);
        sub.frequency.linearRampToValueAtTime(80, now + duration);
        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0, now);
        subGain.gain.linearRampToValueAtTime(0.1, now + 0.5);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        sub.connect(subGain);
        subGain.connect(this.masterGain);
        sub.start(now);
        sub.stop(now + duration + 0.1);
    }

    // ==================== CARD REVEAL ARPEGGIO ====================

    playReveal() {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        // C5 E5 G5 C6 ascending arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
            const t = now + i * 0.12;
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.7);
        });
    }

    // ==================== CELEBRATION ====================

    playCelebration() {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;

        // Major chord: C5 + E5 + G5 + C6
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 2.1);
        });

        // Shimmer: high frequency sparkles cascade
        for (let i = 0; i < 8; i++) {
            const t = now + i * 0.15;
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 2000 + i * 300 + Math.random() * 200;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.025, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.6);
        }
    }

    // ==================== AI GENERATION SOUNDS ====================

    playAITick() {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 1600 + Math.random() * 200;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.04);
    }

    playAIDone() {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        // Soft ascending arpeggio: E5 G5 B5
        const notes = [659.25, 783.99, 987.77];
        notes.forEach((freq, i) => {
            const t = now + i * 0.1;
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.05, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.6);
        });
    }

    // ==================== ANSWER CONFIRMATION ====================

    playAnswer(questionIndex) {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const noteIndex = questionIndex % 5;
        const freq = this.pentatonic[noteIndex];

        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    // ==================== CLEANUP ====================

    destroy() {
        this.stopAmbient();
        this.ambientNodes.forEach(node => {
            try { node.disconnect(); } catch (e) {}
        });
        this.ambientNodes = [];
        if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
        }
        this.initialized = false;
    }
}
