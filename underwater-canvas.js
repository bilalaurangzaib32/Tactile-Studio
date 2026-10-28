/**
 * Tactile Studio — Underwater Caustic & Particle Canvas Engine
 * Simulates real-time light rays (god rays), floating buoyant bubbles with
 * mouse-collision popping, marine snow particles, and caustic water surface waves.
 */

class UnderwaterCanvas {
    constructor() {
        this.canvas = document.getElementById('underwater-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.width = 0;
        this.height = 0;
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        this.time = 0;
        this.mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 };
        this.isUnderwater = false;
        this.depthFactor = 0; // 0 = at surface, 1 = deep abyss

        // Particle Pools
        this.bubbles = [];
        this.marineSnow = [];
        this.lightRays = [];
        this.popRings = [];

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        window.addEventListener('mousemove', (e) => {
            this.mouse.vx = e.clientX - this.mouse.lastX;
            this.mouse.vy = e.clientY - this.mouse.lastY;
            this.mouse.lastX = e.clientX;
            this.mouse.lastY = e.clientY;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            // Spawn micro bubbles on fast cursor flick underwater
            if (this.isUnderwater && Math.hypot(this.mouse.vx, this.mouse.vy) > 28) {
                if (Math.random() > 0.4) {
                    this.spawnBubble(this.mouse.x, this.mouse.y, Math.random() * 4 + 2);
                }
            }
        });

        // Initialize particles
        this.initLightRays();
        this.initMarineSnow();
        this.initBubbles();

        // Start render loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }

    initLightRays() {
        this.lightRays = [];
        const count = 7;
        for (let i = 0; i < count; i++) {
            this.lightRays.push({
                x: (this.width / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 120,
                width: Math.random() * 90 + 50,
                alpha: Math.random() * 0.12 + 0.05,
                angle: (Math.random() - 0.5) * 0.35 - 0.15,
                speed: Math.random() * 0.0015 + 0.0008,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    initMarineSnow() {
        this.marineSnow = [];
        const count = 65;
        for (let i = 0; i < count; i++) {
            this.marineSnow.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.8 + 0.6,
                baseAlpha: Math.random() * 0.45 + 0.15,
                driftSpeedX: (Math.random() - 0.5) * 0.4,
                driftSpeedY: Math.random() * 0.35 + 0.15,
                swayFreq: Math.random() * 0.02 + 0.01,
                swayAmp: Math.random() * 1.5 + 0.5,
                color: Math.random() > 0.3 ? '#8eedff' : '#49f2b8'
            });
        }
    }

    initBubbles() {
        this.bubbles = [];
        const count = 28;
        for (let i = 0; i < count; i++) {
            this.bubbles.push({
                x: Math.random() * this.width,
                y: this.height + Math.random() * this.height,
                radius: Math.random() * 10 + 3,
                speed: Math.random() * 1.8 + 0.8,
                swayFreq: Math.random() * 0.03 + 0.015,
                swayAmp: Math.random() * 25 + 10,
                wobblePhase: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.45 + 0.25
            });
        }
    }

    spawnBubble(x, y, radius = 6) {
        if (this.bubbles.length > 50) return;
        this.bubbles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            radius: radius,
            speed: Math.random() * 2.2 + 1.2,
            swayFreq: Math.random() * 0.04 + 0.02,
            swayAmp: Math.random() * 15 + 5,
            wobblePhase: Math.random() * Math.PI * 2,
            opacity: 0.6
        });
    }

    triggerPop(x, y, radius) {
        // Visual pop burst
        this.popRings.push({
            x: x,
            y: y,
            radius: radius,
            maxRadius: radius * 2.6,
            alpha: 0.85
        });

        // Trigger procedural bubble pop acoustic
        if (window.tactileAudio) {
            window.tactileAudio.playBubblePop(260 + (14 - Math.min(radius, 14)) * 35);
        }
    }

    setUnderwater(status, depth = 0) {
        this.isUnderwater = status;
        this.depthFactor = Math.min(Math.max(depth, 0), 1);
    }

    drawLightRays() {
        if (!this.isUnderwater) return;

        this.ctx.save();
        this.lightRays.forEach(ray => {
            const currentAngle = ray.angle + Math.sin(this.time * ray.speed * 800 + ray.phase) * 0.08;
            const currentAlpha = ray.alpha * (1 - this.depthFactor * 0.65) * (0.8 + 0.2 * Math.sin(this.time * ray.speed * 600));

            const grad = this.ctx.createLinearGradient(ray.x, 0, ray.x + Math.tan(currentAngle) * this.height, this.height);
            grad.addColorStop(0, `rgba(75, 235, 255, ${currentAlpha * 1.5})`);
            grad.addColorStop(0.3, `rgba(32, 190, 240, ${currentAlpha * 0.8})`);
            grad.addColorStop(0.8, `rgba(15, 110, 180, ${currentAlpha * 0.2})`);
            grad.addColorStop(1, 'rgba(3, 20, 50, 0)');

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            const topSpread = ray.width * 0.3;
            const bottomSpread = ray.width * 3.2;

            this.ctx.moveTo(ray.x - topSpread, 0);
            this.ctx.lineTo(ray.x + topSpread, 0);
            this.ctx.lineTo(ray.x + Math.tan(currentAngle) * this.height + bottomSpread, this.height);
            this.ctx.lineTo(ray.x + Math.tan(currentAngle) * this.height - bottomSpread, this.height);
            this.ctx.closePath();
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    drawMarineSnow() {
        this.ctx.save();
        this.marineSnow.forEach(p => {
            p.y += p.driftSpeedY;
            p.x += p.driftSpeedX + Math.sin(this.time * 0.002 + p.y * p.swayFreq) * 0.4;

            if (p.y > this.height) {
                p.y = 0;
                p.x = Math.random() * this.width;
            }
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;

            const alpha = this.isUnderwater ? p.baseAlpha : p.baseAlpha * 0.3;
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = alpha;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    drawBubbles() {
        if (!this.isUnderwater) return;

        this.ctx.save();
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];

            b.y -= b.speed;
            const sway = Math.sin(this.time * 0.002 + b.y * b.swayFreq + b.wobblePhase) * b.swayAmp;
            const curX = b.x + sway * 0.4;

            // Check collision with mouse cursor (pop!)
            const dist = Math.hypot(curX - this.mouse.x, b.y - this.mouse.y);
            if (dist < b.radius + 18) {
                this.triggerPop(curX, b.y, b.radius);
                this.bubbles.splice(i, 1);
                continue;
            }

            // Recycle at top
            if (b.y < -30) {
                b.y = this.height + Math.random() * 40;
                b.x = Math.random() * this.width;
                continue;
            }

            // Draw bubble with realistic glass-spherical refraction highlight
            this.ctx.globalAlpha = b.opacity;

            // Outer bubble rim
            this.ctx.strokeStyle = 'rgba(160, 240, 255, 0.65)';
            this.ctx.lineWidth = 1.2;
            this.ctx.beginPath();
            this.ctx.arc(curX, b.y, b.radius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Inner gradient fill
            const grad = this.ctx.createRadialGradient(
                curX - b.radius * 0.3, b.y - b.radius * 0.35, b.radius * 0.1,
                curX, b.y, b.radius
            );
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
            grad.addColorStop(0.4, 'rgba(100, 220, 255, 0.2)');
            grad.addColorStop(1, 'rgba(20, 80, 140, 0.05)');

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(curX, b.y, b.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Specular sheen dot
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            this.ctx.beginPath();
            this.ctx.arc(curX - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.22, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawPopRings() {
        if (!this.popRings.length) return;
        this.ctx.save();
        for (let i = this.popRings.length - 1; i >= 0; i--) {
            const p = this.popRings[i];
            p.radius += 1.8;
            p.alpha -= 0.045;

            if (p.alpha <= 0) {
                this.popRings.splice(i, 1);
                continue;
            }

            this.ctx.strokeStyle = `rgba(180, 250, 255, ${p.alpha})`;
            this.ctx.lineWidth = 1.4;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    drawWaterSurfaceLine() {
        if (!this.isUnderwater) return;

        // Subtle caustic wave rippling at the very top of viewport when just submerged
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(110, 240, 255, 0.35)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let x = 0; x <= this.width; x += 15) {
            const wave = Math.sin(x * 0.01 + this.time * 0.003) * 6 + Math.cos(x * 0.02 - this.time * 0.002) * 3;
            if (x === 0) this.ctx.moveTo(x, wave + 4);
            else this.ctx.lineTo(x, wave + 4);
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    animate(timestamp) {
        this.time = timestamp || 0;
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.drawLightRays();
        this.drawWaterSurfaceLine();
        this.drawMarineSnow();
        this.drawBubbles();
        this.drawPopRings();

        requestAnimationFrame(this.animate);
    }
}

window.tactileCanvas = new UnderwaterCanvas();

