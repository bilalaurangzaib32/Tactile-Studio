/**
 * Tactile Studio® — Audio Context Engine (Web Audio API)
 * 
 * Inspired by Resn's "The Drop" & Unseen Studio:
 * - Low-frequency ambient drone (lowpass 250Hz-350Hz at 20% gain)
 * - Perturbation Resonance: Cursor proximity & velocity ramp cutoff up to 900Hz
 * - Charge & Breach Sound: Exponential pitch-ramp riser on click & hold
 * - Spring Fallback: Smooth decay on early mouse release
 * - The Breach: Deep sub-bass boom (95Hz -> 28Hz) & airy release wash
 * - Seamless transition to main studio acoustic room drone
 * - Micro-haptic glass ticks & live 4-bar equalizer
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.isInitialized = false;
        this.isEnabled = true;
        this.isMuted = false;

        // Core Gain & Filter Nodes
        this.masterGain = null;
        this.droneGain = null;
        this.sfxGain = null;
        this.droneFilter = null;
        this.analyser = null;

        // Core Portal Drone & Resonance
        this.coreDroneGain = null;
        this.coreDroneFilter = null;
        this.coreOsc1 = null;
        this.coreOsc2 = null;
        this.coreLfo = null;
        this.coreLfoGain = null;

        // Charge Riser Oscillator
        this.riserOsc = null;
        this.riserGain = null;
        this.riserFilter = null;
        this.isCharging = false;

        // Ambient Drone Oscillators (Main Studio)
        this.oscillators = [];
        this.lfo = null;
        this.lfoGain = null;

        // Dynamic targets
        this.baseDroneCutoff = 320; // Hz
        this.targetCutoff = 320;
        this.analyserDataArray = null;
        this.eqData = [0.2, 0.4, 0.3, 0.5];

        this.update = this.update.bind(this);
    }

    init() {
        if (this.isInitialized) return;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        this.ctx = new AudioContextClass();

        // 1. Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // 2. Real-time Analyser for live HUD bars
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.85;
        this.masterGain.connect(this.analyser);
        this.analyserDataArray = new Uint8Array(this.analyser.frequencyBinCount);

        // 3. SFX Gain
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        // 4. Setup "The Tactile Core" Portal Soundscape
        this.setupCorePortalSoundscape();

        // 5. Setup Main Studio Drone
        this.setupStudioDrone();

        this.isInitialized = true;
        this.update();
    }

    /**
     * Resn-inspired 3D Core Portal Audio:
     * Deep mysterious humming drone filtered at 280Hz with subtle resonant detune
     */
    setupCorePortalSoundscape() {
        const now = this.ctx.currentTime;

        this.coreDroneGain = this.ctx.createGain();
        this.coreDroneGain.gain.setValueAtTime(0.22, now); // ~20% volume

        this.coreDroneFilter = this.ctx.createBiquadFilter();
        this.coreDroneFilter.type = 'lowpass';
        this.coreDroneFilter.frequency.setValueAtTime(280, now);
        this.coreDroneFilter.Q.setValueAtTime(3.5, now);

        // Polyphonic low drone: 48Hz (G1) + 96Hz (G2)
        this.coreOsc1 = this.ctx.createOscillator();
        this.coreOsc1.type = 'sine';
        this.coreOsc1.frequency.setValueAtTime(48.0, now);

        this.coreOsc2 = this.ctx.createOscillator();
        this.coreOsc2.type = 'triangle';
        this.coreOsc2.frequency.setValueAtTime(96.0, now);
        this.coreOsc2.detune.setValueAtTime(4, now);

        // Slow LFO for organic liquid breathing
        this.coreLfo = this.ctx.createOscillator();
        this.coreLfo.type = 'sine';
        this.coreLfo.frequency.setValueAtTime(0.14, now); // ~7s cycle

        this.coreLfoGain = this.ctx.createGain();
        this.coreLfoGain.gain.setValueAtTime(45, now);

        this.coreLfo.connect(this.coreLfoGain);
        this.coreLfoGain.connect(this.coreDroneFilter.frequency);

        this.coreOsc1.connect(this.coreDroneGain);
        this.coreOsc2.connect(this.coreDroneGain);
        this.coreDroneGain.connect(this.coreDroneFilter);
        this.coreDroneFilter.connect(this.masterGain);

        this.coreOsc1.start(now);
        this.coreOsc2.start(now);
        this.coreLfo.start(now);
    }

    /**
     * Perturbation Resonance:
     * Cursor approaching Core and moving fast modulates cutoff up to 900Hz and lifts volume
     */
    modulateCorePerturbation(proximity, velocityNorm) {
        if (!this.isInitialized || this.isMuted || !this.coreDroneFilter) return;

        const now = this.ctx.currentTime;
        // Combine proximity (0 to 1) and velocity (0 to 1)
        const factor = Math.min(proximity * 0.7 + velocityNorm * 0.6, 1.0);

        // Ramps from 280Hz up to 900Hz
        const targetFreq = 280 + (factor * 620);
        const targetGain = 0.20 + (factor * 0.16);

        this.coreDroneFilter.frequency.setTargetAtTime(targetFreq, now, 0.06);
        this.coreDroneGain.gain.setTargetAtTime(targetGain, now, 0.06);
    }

    /**
     * Click & Hold: Exponential pitch-ramp riser
     */
    startChargeRiser() {
        if (!this.isInitialized) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        if (this.isMuted) return;

        this.isCharging = true;
        const now = this.ctx.currentTime;

        // Clean up previous riser if existing
        if (this.riserOsc) {
            try { this.riserOsc.stop(); } catch (e) {}
        }

        this.riserOsc = this.ctx.createOscillator();
        this.riserGain = this.ctx.createGain();
        this.riserFilter = this.ctx.createBiquadFilter();

        this.riserOsc.type = 'sawtooth';
        this.riserOsc.frequency.setValueAtTime(90, now);
        // Exponential riser from 90Hz to 880Hz over 1.9s
        this.riserOsc.frequency.exponentialRampToValueAtTime(880, now + 1.9);

        this.riserFilter.type = 'lowpass';
        this.riserFilter.frequency.setValueAtTime(300, now);
        this.riserFilter.frequency.exponentialRampToValueAtTime(3200, now + 1.9);
        this.riserFilter.Q.setValueAtTime(4.0, now);

        this.riserGain.gain.setValueAtTime(0.001, now);
        this.riserGain.gain.linearRampToValueAtTime(0.38, now + 0.3);
        this.riserGain.gain.linearRampToValueAtTime(0.65, now + 1.85);

        this.riserOsc.connect(this.riserFilter);
        this.riserFilter.connect(this.riserGain);
        this.riserGain.connect(this.masterGain);

        this.riserOsc.start(now);
    }

    /**
     * Spring Fallback: Released mouse before 100% completion
     */
    decayChargeRiser() {
        if (!this.isCharging || !this.riserGain) return;
        this.isCharging = false;

        const now = this.ctx.currentTime;
        this.riserGain.gain.cancelScheduledValues(now);
        this.riserGain.gain.setValueAtTime(this.riserGain.gain.value, now);
        this.riserGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        if (this.riserFilter) {
            this.riserFilter.frequency.setTargetAtTime(250, now, 0.15);
        }

        setTimeout(() => {
            if (this.riserOsc && !this.isCharging) {
                try { this.riserOsc.stop(); } catch (e) {}
            }
        }, 500);
    }

    /**
     * The Breach (100% hold completed):
     * Deep sub-bass boom (95Hz -> 28Hz) + airy release wash + transition to studio drone
     */
    triggerBreachBoom() {
        if (!this.isInitialized) return;
        this.isCharging = false;
        const now = this.ctx.currentTime;

        // 1. Cut the riser immediately
        if (this.riserGain) {
            this.riserGain.gain.setValueAtTime(0.001, now);
        }

        // 2. Sub-bass Boom (Sine drop)
        const boomOsc = this.ctx.createOscillator();
        const boomGain = this.ctx.createGain();

        boomOsc.type = 'sine';
        boomOsc.frequency.setValueAtTime(110, now);
        boomOsc.frequency.exponentialRampToValueAtTime(28, now + 1.2);

        boomGain.gain.setValueAtTime(0.85, now);
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

        boomOsc.connect(boomGain);
        boomGain.connect(this.masterGain);

        boomOsc.start(now);
        boomOsc.stop(now + 1.5);

        // 3. Airy Release Wash (Synthesized bandpass noise)
        this.playAiryWash();

        // 4. Fade down core portal drone, fade up main studio room drone
        if (this.coreDroneGain) {
            this.coreDroneGain.gain.linearRampToValueAtTime(0.001, now + 1.2);
        }

        this.startStudioDrone();
    }

    playAiryWash() {
        try {
            const bufferSize = this.ctx.sampleRate * 2.0;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 1.8);
            filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.9);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            noise.start();
            noise.stop(this.ctx.currentTime + 2.0);
        } catch (e) {}
    }

    /**
     * Main Studio Room Drone Polyphony
     */
    setupStudioDrone() {
        const now = this.ctx.currentTime;

        this.droneFilter = this.ctx.createBiquadFilter();
        this.droneFilter.type = 'lowpass';
        this.droneFilter.frequency.setValueAtTime(400, now);
        this.droneFilter.Q.setValueAtTime(2.2, now);

        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.setValueAtTime(0, now);
        this.droneGain.connect(this.droneFilter);
        this.droneFilter.connect(this.masterGain);

        const droneFrequencies = [
            { freq: 44.0, type: 'sine', detune: -4, gain: 0.6 },
            { freq: 88.0, type: 'triangle', detune: 3, gain: 0.35 },
            { freq: 132.0, type: 'sine', detune: 6, gain: 0.25 },
            { freq: 176.0, type: 'sine', detune: -8, gain: 0.15 }
        ];

        droneFrequencies.forEach(d => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = d.type;
            osc.frequency.setValueAtTime(d.freq, now);
            osc.detune.setValueAtTime(d.detune, now);
            g.gain.setValueAtTime(d.gain, now);

            osc.connect(g);
            g.connect(this.droneGain);
            osc.start(now);
            this.oscillators.push(osc);
        });
    }

    startStudioDrone() {
        if (!this.droneGain) return;
        const now = this.ctx.currentTime;
        this.droneGain.gain.cancelScheduledValues(now);
        this.droneGain.gain.setValueAtTime(0.001, now);
        this.droneGain.gain.linearRampToValueAtTime(0.26, now + 2.0);
    }

    toggleMute() {
        if (!this.isInitialized) {
            this.init();
            return true;
        }

        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const now = this.ctx.currentTime;
        if (this.isMuted) {
            this.isMuted = false;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(0.001, now);
            this.masterGain.gain.linearRampToValueAtTime(0.28, now + 0.35);
            this.playGlassTick(1400);
            return true;
        } else {
            this.isMuted = true;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.25);
            return false;
        }
    }

    /**
     * Scroll velocity modulation for main portfolio
     */
    modulateWithVelocity(velocityMagnitude) {
        if (!this.isInitialized || this.isMuted || !this.droneFilter) return;
        const norm = Math.min(Math.abs(velocityMagnitude) / 45, 1);
        const cutoff = 400 + (norm * 800);
        const gain = 0.26 + (norm * 0.14);
        const now = this.ctx.currentTime;
        this.droneFilter.frequency.setTargetAtTime(cutoff, now, 0.08);
        this.droneGain.gain.setTargetAtTime(gain, now, 0.08);
    }

    playGlassTick(customFreq = 2800) {
        if (!this.isInitialized || this.isMuted) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const bandpass = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(customFreq, now);
            osc.frequency.exponentialRampToValueAtTime(customFreq * 0.5, now + 0.035);

            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(customFreq, now);
            bandpass.Q.setValueAtTime(8.0, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.58, now + 0.003);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

            osc.connect(bandpass);
            bandpass.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.04);
        } catch (e) {}
    }

    playActionTick() {
        if (!this.isInitialized || this.isMuted) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(460, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.004);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.065);
        } catch (e) {}
    }

    playTransmitChime() {
        if (!this.isInitialized || this.isMuted) return;
        try {
            const now = this.ctx.currentTime;
            const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 pristine chord
            freqs.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.05);
                gain.gain.setValueAtTime(0.0001, now + i * 0.05);
                gain.gain.linearRampToValueAtTime(0.25, now + i * 0.05 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.5);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now + i * 0.05);
                osc.stop(now + i * 0.05 + 0.55);
            });
        } catch (e) {}
    }

    update() {
        if (this.isInitialized && this.analyser && !this.isMuted) {
            this.analyser.getByteFrequencyData(this.analyserDataArray);
            this.eqData[0] = Math.max(0.15, (this.analyserDataArray[1] || 40) / 255);
            this.eqData[1] = Math.max(0.2, (this.analyserDataArray[3] || 70) / 255);
            this.eqData[2] = Math.max(0.18, (this.analyserDataArray[6] || 50) / 255);
            this.eqData[3] = Math.max(0.15, (this.analyserDataArray[10] || 30) / 255);
        } else {
            this.eqData = [0.15, 0.15, 0.15, 0.15];
        }

        const bars = document.querySelectorAll('.sound-bar');
        bars.forEach((bar, idx) => {
            const h = (this.eqData[idx % 4] * 100).toFixed(0);
            bar.style.height = `${Math.min(Math.max(h, 15), 100)}%`;
            bar.style.opacity = this.isMuted ? '0.35' : '1';
        });

        requestAnimationFrame(this.update);
    }
}

window.tactileAudio = new AudioEngine();
