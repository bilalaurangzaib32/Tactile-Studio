/**
 * Tactile Studio® — Tactile World Global Footprint Engine
 * 
 * Interactive 3D spatial visualization showcasing studio hubs,
 * live radar pings, geodesic arcs, and real-time studio coordinates.
 */

class TactileWorld {
    constructor(canvasId = 'world-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.rotation = 0;
        this.targetRotation = 0;
        this.isDragging = false;
        this.lastMouseX = 0;

        // Studio Global Hubs
        this.hubs = [
            {
                name: 'BRISTOL (HQ & SPATIAL LAB)',
                coords: '51.4545° N, 2.5879° W',
                tz: 'Europe/London',
                address: '35a Colston Avenue, Bristol, BS1 4TT',
                status: 'ACTIVE PRODUCTION // 18 SENSORY RIGS',
                lat: 51.45,
                lon: -2.58,
                color: '#00F0FF',
                isPrimary: true
            },
            {
                name: 'LONDON (BRAND & DIRECTION)',
                coords: '51.5237° N, 0.0847° W',
                tz: 'Europe/London',
                address: '90 Paul Street, London, EC2A 4NE',
                status: 'LIVE CLIENT HUB // 14 DIRECTORS',
                lat: 51.52,
                lon: -0.08,
                color: '#00F0FF',
                isPrimary: true
            },
            {
                name: 'TOKYO (XR & SHADER R&D)',
                coords: '35.6762° N, 139.6503° E',
                tz: 'Asia/Tokyo',
                address: 'Shibuya Stream 21F, Tokyo',
                status: 'RESEARCH CELL // WEBGL 3.0',
                lat: 35.67,
                lon: 139.65,
                color: '#93C5FD',
                isPrimary: false
            },
            {
                name: 'NEW YORK (DIGITAL STRATEGY)',
                coords: '40.7128° N, 74.0060° W',
                tz: 'America/New_York',
                address: 'SoHo Broadway Studio, New York',
                status: 'NORTH AMERICA DIRECTION',
                lat: 40.71,
                lon: -74.00,
                color: '#818CF8',
                isPrimary: false
            },
            {
                name: 'BERLIN (KINETIC MOTION LAB)',
                coords: '52.5200° N, 13.4050° E',
                tz: 'Europe/Berlin',
                address: 'Mitte Creative Yard, Berlin',
                status: 'PROCEDURAL MOTION & AUDIO',
                lat: 52.52,
                lon: 13.40,
                color: '#6EE7B7',
                isPrimary: false
            }
        ];

        this.activeHubIndex = 0;
        this.time = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Drag to rotate globe
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                this.lastMouseX = e.clientX;
                this.rotation += deltaX * 0.005;
            }

            // Check hover over hub indicators
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            let found = false;
            this.renderedHubs.forEach((hub, idx) => {
                const dist = Math.hypot(mouseX - hub.screenX, mouseY - hub.screenY);
                if (dist < 18) {
                    if (this.activeHubIndex !== idx) {
                        this.activeHubIndex = idx;
                        this.updateHubInfoUI();
                        if (window.tactileAudio) {
                            window.tactileAudio.playGlassTick(3200);
                        }
                    }
                    found = true;
                    this.canvas.style.cursor = 'pointer';
                }
            });

            if (!found && !this.isDragging) {
                this.canvas.style.cursor = 'grab';
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.renderedHubs = [];
        this.updateHubInfoUI();

        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = rect.width;
        this.height = Math.min(rect.width * 0.65, 540);
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(this.dpr, this.dpr);
    }

    updateHubInfoUI() {
        const hub = this.hubs[this.activeHubIndex];
        const nameEl = document.getElementById('world-hub-name');
        const coordsEl = document.getElementById('world-hub-coords');
        const statusEl = document.getElementById('world-hub-status');
        const timeEl = document.getElementById('world-hub-time');

        if (nameEl) nameEl.textContent = hub.name;
        if (coordsEl) coordsEl.textContent = hub.coords;
        if (statusEl) statusEl.textContent = hub.status;
        if (timeEl) {
            try {
                const now = new Date();
                const timeStr = new Intl.DateTimeFormat('en-GB', {
                    timeZone: hub.tz,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).format(now);
                timeEl.textContent = `LOCAL TIME // ${timeStr}`;
            } catch (e) {
                timeEl.textContent = 'LOCAL TIME // ACTIVE';
            }
        }
    }

    render() {
        this.time += 0.016;
        if (!this.isDragging) {
            this.rotation += 0.0025;
        }

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        const centerX = this.width * 0.5;
        const centerY = this.height * 0.5;
        const radius = Math.min(this.width, this.height) * 0.38;

        // 1. Globe Ambient Shadow & Rim Glow
        const bgGlow = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.2);
        bgGlow.addColorStop(0, 'rgba(0, 240, 255, 0.06)');
        bgGlow.addColorStop(0.7, 'rgba(10, 15, 25, 0.2)');
        bgGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = bgGlow;
        ctx.fillRect(0, 0, this.width, this.height);

        // 2. Draw Geodesic Lat/Lon Rings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;

        // Longitude ellipses
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI / 8) + this.rotation;
            const xRadius = Math.cos(angle) * radius;

            ctx.beginPath();
            ctx.ellipse(centerX, centerY, Math.abs(xRadius), radius, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Latitude lines
        for (let lat = -60; lat <= 60; lat += 30) {
            const rad = (lat * Math.PI) / 180;
            const y = centerY - Math.sin(rad) * radius;
            const rLat = Math.cos(rad) * radius;

            ctx.beginPath();
            ctx.ellipse(centerX, y, rLat, rLat * 0.25, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Outer Globe Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Project Hub Coordinates onto 3D Sphere Surface
        this.renderedHubs = [];
        const projectedPoints = [];

        this.hubs.forEach((hub, idx) => {
            const latRad = (hub.lat * Math.PI) / 180;
            const lonRad = (hub.lon * Math.PI) / 180 + this.rotation;

            const x = radius * Math.cos(latRad) * Math.sin(lonRad);
            const y = - radius * Math.sin(latRad);
            const z = radius * Math.cos(latRad) * Math.cos(lonRad);

            const isFront = z > -radius * 0.15;
            const screenX = centerX + x;
            const screenY = centerY + y;

            projectedPoints.push({ x: screenX, y: screenY, z, isFront, hub, idx });
            this.renderedHubs.push({ screenX, screenY, idx });
        });

        // 4. Draw Connecting Arcs between London/Bristol and global satellites
        const london = projectedPoints[1];
        if (london) {
            projectedPoints.forEach((target, i) => {
                if (i === 1) return; // Skip self
                const opacity = (london.isFront && target.isFront) ? 0.4 : 0.08;

                ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
                ctx.lineWidth = 1.2;
                ctx.setLineDash([4, 4]);

                ctx.beginPath();
                ctx.moveTo(london.x, london.y);
                // Quadratic curve arching outward
                const midX = (london.x + target.x) / 2;
                const midY = Math.min(london.y, target.y) - 35;
                ctx.quadraticCurveTo(midX, midY, target.x, target.y);
                ctx.stroke();
                ctx.setLineDash([]);
            });
        }

        // 5. Draw Hub Nodes & Radar Rings
        projectedPoints.forEach((pt) => {
            const isSelected = pt.idx === this.activeHubIndex;
            const baseAlpha = pt.isFront ? (isSelected ? 1 : 0.7) : 0.25;

            // Pinging radar circle
            if (pt.isFront) {
                const pulse = ((this.time * 2 + pt.idx) % 2) / 2;
                ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - pulse) * baseAlpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 6 + (pulse * 22), 0, Math.PI * 2);
                ctx.stroke();
            }

            // Solid Core Dot
            ctx.fillStyle = isSelected ? '#FFFFFF' : (pt.hub.color || '#00F0FF');
            ctx.shadowColor = pt.hub.color || '#00F0FF';
            ctx.shadowBlur = isSelected ? 12 : 4;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, isSelected ? 5.5 : 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Micro-label when front-facing
            if (pt.isFront) {
                ctx.font = '10px "JetBrains Mono", monospace';
                ctx.fillStyle = isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)';
                ctx.fillText(pt.hub.name.split(' ')[0], pt.x + 9, pt.y + 3);
            }
        });

        // 6. Equatorial Reticle Crosshairs
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY);
        ctx.lineTo(centerX + 10, centerY);
        ctx.moveTo(centerX, centerY - 10);
        ctx.lineTo(centerX, centerY + 10);
        ctx.stroke();

        requestAnimationFrame(this.render);
    }
}

window.TactileWorld = TactileWorld;

