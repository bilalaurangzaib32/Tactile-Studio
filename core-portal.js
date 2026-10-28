/**
 * Tactile Studio® — The Tactile Core (Resn-Inspired Opening Portal)
 * 
 * Implements:
 * - High-subdivision 3D Core with custom GLSL 3D Simplex noise displacement
 * - Rest State: Organic liquid mercury breathing & obsidian chrome reflections
 * - Cursor Reactivity: Magnetic fluid repulsion & perturbation when cursor approaches
 * - The "Breach & Swell" Click & Hold charge mechanism with spring fallback
 * - 100% Breach: Post-processing chromatic burst & camera swallow transition
 */

class TactileCorePortal {
    constructor() {
        this.container = document.getElementById('core-portal-overlay');
        this.canvas = document.getElementById('core-canvas');
        if (!this.canvas) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.coreMesh = null;
        this.coreMaterial = null;

        // Interaction state
        this.isHoldActive = false;
        this.holdProgress = 0.0;
        this.targetHoldProgress = 0.0;
        this.hasBreached = false;

        this.mouse = {
            x: 0,
            y: 0,
            normX: 0,
            normY: 0,
            screenX: window.innerWidth * 0.5,
            screenY: window.innerHeight * 0.5,
            vx: 0,
            vy: 0,
            lastX: window.innerWidth * 0.5,
            lastY: window.innerHeight * 0.5,
            proximity: 0 // 0 = far, 1 = over core
        };

        // Camera Physics
        this.cameraDist = {
            current: 480,
            target: 480,
            rest: 480,
            breach: 45
        };

        this.cameraFov = {
            current: 45,
            target: 45,
            rest: 45,
            breach: 32
        };

        this.clock = new THREE.Clock();
        this.fpsCounter = { frames: 0, lastTime: performance.now(), fps: 60 };

        this.init();
    }

    init() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1. Scene
        this.scene = new THREE.Scene();

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(this.cameraFov.rest, width / height, 1, 2000);
        this.camera.position.z = this.cameraDist.rest;

        // 3. WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        // 4. Create 3D Artifact: The Tactile Core
        this.createTactileCore();

        // 5. Setup Ambient Lights & Environment
        this.setupLighting();

        // 6. Bind Event Listeners
        this.bindEvents();

        // 7. Start Render Loop
        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    createTactileCore() {
        // High-subdivision geometry for silky smooth noise ripples
        const geometry = new THREE.SphereGeometry(110, 96, 96);

        // Custom GLSL Vertex Shader: 3D Simplex Noise & Magnetic Fluid Cursor Perturbation
        const vertexShader = `
            uniform float uTime;
            uniform float uNoiseFreq;
            uniform float uNoiseAmp;
            uniform float uCharge;
            uniform float uProximity;
            uniform vec3 uMouseDir;
            uniform float uBreach;

            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying vec3 vWorldPos;
            varying float vDisplacement;

            // --- 3D Simplex Noise by Ian McEwan, Ashima Arts ---
            vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                // First corner
                vec3 i  = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);

                // Other corners
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);

                vec3 x1 = x0 - i1 + 1.0 * C.xxx;
                vec3 x2 = x0 - i2 + 2.0 * C.xxx;
                vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

                // Permutations
                i = mod(i, 289.0);
                vec4 p = permute(permute(permute(
                            i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

                // Gradients
                float n_ = 0.142857142857;
                vec3  ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);

                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);

                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec2 p2 = a1.xy; vec3 p2_ = vec3(p2, h.z);
                vec3 p3 = vec3(a1.zw, h.w);

                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2_, p2_), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2_ *= norm.z;
                p3 *= norm.w;

                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2_,x2), dot(p3,x3)));
            }

            void main() {
                vNormal = normalize(normalMatrix * normal);

                // Multi-octave organic simplex noise
                vec3 noiseCoord = position * (uNoiseFreq * 0.008) + vec3(uTime * 0.35);
                float n1 = snoise(noiseCoord);
                float n2 = snoise(noiseCoord * 2.1 - vec3(uTime * 0.5)) * 0.5;
                float noiseVal = n1 + n2;

                // Mouse magnetic push/pull alignment
                float mouseAlign = dot(normalize(position), uMouseDir);
                float repelFactor = smoothstep(0.3, 1.0, mouseAlign) * uProximity * 28.0;

                // Charge Spikes: during click & hold, noise spikes into sharp needles
                float chargeSpike = pow(abs(noiseVal), 1.8) * uCharge * 75.0;

                // Total radial displacement
                float displacement = (noiseVal * uNoiseAmp) + repelFactor + chargeSpike;
                
                // Breach expansion: morph outward to engulf camera
                displacement += pow(uBreach, 2.5) * 800.0;

                vec3 newPosition = position + (normal * displacement);

                vDisplacement = displacement;
                vWorldPos = (modelMatrix * vec4(newPosition, 1.0)).xyz;
                vViewDir = normalize(cameraPosition - vWorldPos);

                gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0);
            }
        `;

        // Custom GLSL Fragment Shader: Liquid Mercury + Obsidian Chrome + Iridescent Fringe
        const fragmentShader = `
            uniform float uTime;
            uniform float uCharge;
            uniform float uProximity;
            uniform float uBreach;

            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying vec3 vWorldPos;
            varying float vDisplacement;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewDir);

                // 1. Fresnel Rim Reflection
                float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.2);

                // 2. Liquid Mercury Chrome Reflection
                vec3 reflectDir = reflect(-viewDir, normal);
                float chromeLight = pow(max(reflectDir.y * 0.5 + 0.5, 0.0), 4.0);
                float specularDot = pow(max(dot(reflectDir, vec3(0.3, 0.8, 0.5)), 0.0), 18.0);

                // Deep obsidian core base
                vec3 baseObsidian = vec3(0.04, 0.045, 0.06);

                // 3. Iridescent Spectral Dispersion on Rim
                vec3 spectralFringe = vec3(
                    sin(fresnel * 4.5 + uTime * 1.5 + 0.0) * 0.5 + 0.5,
                    sin(fresnel * 4.5 + uTime * 1.5 + 2.0) * 0.5 + 0.5,
                    sin(fresnel * 4.5 + uTime * 1.5 + 4.0) * 0.5 + 0.5
                );

                // Cyan & Chrome Accent
                vec3 chromeAccent = vec3(0.0, 0.94, 1.0); // #00F0FF

                // Combine material layers
                vec3 finalColor = baseObsidian;
                finalColor += vec3(chromeLight * 0.45);
                finalColor += specularDot * vec3(1.0, 1.0, 1.0) * 0.8;
                
                // Add chromatic fringe proportional to fresnel and mouse proximity
                finalColor += spectralFringe * fresnel * (0.65 + uProximity * 0.35);

                // Charge Energy Glow: shifts toward radiant glowing core as user holds
                vec3 energyGlow = mix(chromeAccent, vec3(1.0, 1.0, 1.0), uCharge * 0.6);
                finalColor += energyGlow * (uCharge * 0.95);

                // Breach whiteout flash
                finalColor = mix(finalColor, vec3(1.0, 1.0, 1.0), pow(uBreach, 2.0));

                gl_FragColor = vec4(finalColor, 1.0 - pow(uBreach, 3.0) * 0.85);
            }
        `;

        this.coreMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uNoiseFreq: { value: 1.1 },
                uNoiseAmp: { value: 14.0 },
                uCharge: { value: 0.0 },
                uProximity: { value: 0.0 },
                uMouseDir: { value: new THREE.Vector3(0, 0, 1) },
                uBreach: { value: 0.0 }
            },
            transparent: true,
            wireframe: false
        });

        this.coreMesh = new THREE.Mesh(geometry, this.coreMaterial);
        this.scene.add(this.coreMesh);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
        dirLight.position.set(200, 300, 400);
        this.scene.add(dirLight);

        const rimLight = new THREE.PointLight(0xffffff, 1.5, 800);
        rimLight.position.set(-200, -200, -200);
        this.scene.add(rimLight);
    }

    bindEvents() {
        // Window Resize
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });

        // Mouse Move (Proximity & Velocity Tracking)
        window.addEventListener('mousemove', (e) => {
            this.mouse.screenX = e.clientX;
            this.mouse.screenY = e.clientY;
            this.mouse.normX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.normY = -(e.clientY / window.innerHeight) * 2 + 1;

            this.mouse.vx = e.clientX - this.mouse.lastX;
            this.mouse.vy = e.clientY - this.mouse.lastY;
            this.mouse.lastX = e.clientX;
            this.mouse.lastY = e.clientY;

            // Compute distance from viewport center (where the Core rests)
            const centerX = window.innerWidth * 0.5;
            const centerY = window.innerHeight * 0.5;
            const distFromCenter = Math.hypot(e.clientX - centerX, e.clientY - centerY);
            const coreRadiusScreen = Math.min(window.innerWidth, window.innerHeight) * 0.22;

            // Proximity: 1.0 when over core, fading to 0.0 at outer edge
            this.mouse.proximity = Math.max(0, 1.0 - (distFromCenter / (coreRadiusScreen * 2.2)));

            // Audio Modulation: Modulate core lowpass drone with proximity & cursor velocity
            if (window.tactileAudio && !this.hasBreached) {
                const velocityNorm = Math.min(Math.hypot(this.mouse.vx, this.mouse.vy) / 35, 1.0);
                window.tactileAudio.modulateCorePerturbation(this.mouse.proximity, velocityNorm);
            }

            // Update SVG cursor progress ring position
            const ringEl = document.getElementById('core-cursor-tracker');
            if (ringEl) {
                ringEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            }
        });

        // Pointer Down: Begin Click & Hold Charge
        const hintEl = document.getElementById('core-hold-hint');
        const holdBtn = document.getElementById('core-hold-button');
        const centerPrompt = document.getElementById('core-center-prompt');
        let revertTimeout = null;

        const onPointerDown = (e) => {
            if (this.hasBreached) return;
            this.isHoldActive = true;
            this.targetHoldProgress = 1.0;

            if (revertTimeout) {
                clearTimeout(revertTimeout);
                revertTimeout = null;
            }

            // First click initializes Web Audio API context safely
            if (window.tactileAudio) {
                if (!window.tactileAudio.isInitialized) {
                    window.tactileAudio.init();
                }
                window.tactileAudio.startChargeRiser();
            }

            if (hintEl) hintEl.textContent = 'HOLDING TO OPEN...';
            if (holdBtn) holdBtn.classList.add('is-holding');
            if (centerPrompt) centerPrompt.classList.add('fade-out');
        };

        // Pointer Up: Release or Spring Fallback
        const onPointerUp = () => {
            if (this.hasBreached) return;
            const hadProgress = this.holdProgress > 0.12;
            this.isHoldActive = false;
            this.targetHoldProgress = 0.0;

            // Audio spring decay
            if (window.tactileAudio) {
                window.tactileAudio.decayChargeRiser();
            }

            if (holdBtn) holdBtn.classList.remove('is-holding');

            if (hadProgress) {
                if (hintEl) hintEl.textContent = 'KEEP HOLDING TO OPEN';
                revertTimeout = setTimeout(() => {
                    if (!this.isHoldActive && !this.hasBreached) {
                        if (hintEl) hintEl.textContent = 'HOLD TO OPEN';
                        if (centerPrompt) centerPrompt.classList.remove('fade-out');
                    }
                }, 1300);
            } else {
                if (hintEl) hintEl.textContent = 'HOLD TO OPEN';
                if (centerPrompt) centerPrompt.classList.remove('fade-out');
            }
        };

        this.canvas.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mouseup', onPointerUp);

        // Touch support on canvas
        this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchend', onPointerUp);

        // Also bind directly to the prominent HOLD TO OPEN button
        if (holdBtn) {
            holdBtn.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                onPointerDown(e);
            });
            holdBtn.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                onPointerDown(e);
            }, { passive: true });

            // Instant click fallback: auto-charges to open
            holdBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.hasBreached) return;
                onPointerDown(e);
                // Quickly auto-complete charge for click accessibility
                const autoCharge = setInterval(() => {
                    this.holdProgress += 0.06;
                    if (this.holdProgress >= 0.98) {
                        clearInterval(autoCharge);
                        this.holdProgress = 1.0;
                        this.triggerBreach();
                    }
                }, 25);
            });
        }
    }

    triggerBreach() {
        if (this.hasBreached) return;
        this.hasBreached = true;
        this.isHoldActive = false;

        // 1. Audio Breach Boom & Release Wash
        if (window.tactileAudio) {
            window.tactileAudio.triggerBreachBoom();
        }

        // 2. Fullscreen Post-Processing Chromatic Bloom Flash
        const flashOverlay = document.getElementById('core-breach-flash');
        if (flashOverlay) {
            flashOverlay.classList.add('active');
            setTimeout(() => {
                flashOverlay.classList.add('fade');
            }, 120);
        }

        // 3. Animate Core Implosion & Camera Swallow
        const duration = 1.4;
        const startTime = performance.now();

        const animateBreach = () => {
            const elapsed = (performance.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1.0);

            // Shader breach uniform
            this.coreMaterial.uniforms.uBreach.value = progress;
            this.camera.position.z = THREE.MathUtils.lerp(this.cameraDist.breach, -120, progress);

            if (progress < 1.0) {
                requestAnimationFrame(animateBreach);
            } else {
                // Completely unlock and transition to main portfolio
                this.completePortalTransition();
            }
        };

        requestAnimationFrame(animateBreach);
    }

    completePortalTransition() {
        // Unlock page scroll
        document.body.classList.remove('is-locked');

        // Dissolve Portal Overlay
        if (this.container) {
            this.container.classList.add('portal-dismissed');
            setTimeout(() => {
                this.container.style.display = 'none';
                this.isDismissed = true;
            }, 1000);
        }

        // Unveil HUD & portfolio with GSAP if available, or class triggers
        const siteHeader = document.getElementById('site-header');
        if (siteHeader) {
            siteHeader.classList.add('hud-revealed');
        }

        const filterWrapper = document.getElementById('filter-wrapper');
        if (filterWrapper) {
            filterWrapper.classList.add('filter-revealed');
        }

        // Notify global app
        window.dispatchEvent(new CustomEvent('core:breached'));
    }

    resetCore() {
        this.isDismissed = false;
        this.hasBreached = false;
        this.isHoldActive = false;
        this.holdProgress = 0.0;
        this.targetHoldProgress = 0.0;
        this.cameraDist.current = this.cameraDist.rest;
        this.cameraDist.target = this.cameraDist.rest;
        this.camera.position.z = this.cameraDist.rest;
        this.cameraFov.current = this.cameraFov.rest;
        this.cameraFov.target = this.cameraFov.rest;
        this.camera.fov = this.cameraFov.rest;
        this.camera.updateProjectionMatrix();

        if (this.coreMaterial) {
            this.coreMaterial.uniforms.uBreach.value = 0.0;
            this.coreMaterial.uniforms.uCharge.value = 0.0;
        }

        if (this.container) {
            this.container.style.display = 'flex';
            this.container.classList.remove('portal-dismissed');
        }

        const ringCircle = document.getElementById('core-progress-circle');
        if (ringCircle) {
            ringCircle.style.strokeDashoffset = 2 * Math.PI * 26;
        }

        const hintEl = document.getElementById('core-hold-hint');
        if (hintEl) hintEl.textContent = 'HOLD TO OPEN';
        const percentEl = document.getElementById('core-hold-percent');
        if (percentEl) percentEl.textContent = '[ 0% ]';
        const fillBar = document.getElementById('core-hold-progress-fill');
        if (fillBar) fillBar.style.width = '0%';
        const centerPrompt = document.getElementById('core-center-prompt');
        if (centerPrompt) centerPrompt.classList.remove('fade-out');

        document.body.classList.add('is-locked');

        if (window.tactileAudio && window.tactileAudio.coreDroneGain) {
            const now = window.tactileAudio.ctx.currentTime;
            window.tactileAudio.coreDroneGain.gain.setValueAtTime(0.22, now);
        }

        if (!this.rafId) {
            this.rafId = requestAnimationFrame(this.render);
        }
    }

    updateFPS() {
        this.fpsCounter.frames++;
        const now = performance.now();
        if (now - this.fpsCounter.lastTime >= 1000) {
            this.fpsCounter.fps = Math.round((this.fpsCounter.frames * 1000) / (now - this.fpsCounter.lastTime));
            this.fpsCounter.frames = 0;
            this.fpsCounter.lastTime = now;

            const fpsEl = document.getElementById('hud-fps-indicator');
            if (fpsEl) {
                fpsEl.textContent = `${this.fpsCounter.fps} FPS // LATENCY 12MS`;
            }
        }
    }

    render() {
        if (this.isDismissed) {
            this.rafId = null;
            return;
        }

        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        this.updateFPS();

        if (!this.hasBreached) {
            // 1. Spring-Lerp Charge Progress (Charges in ~1.3s, springs back in ~0.5s)
            const chargeSpeed = this.isHoldActive ? 0.024 : 0.08;
            this.holdProgress += (this.targetHoldProgress - this.holdProgress) * chargeSpeed;

            // Update Live Percentage and Fill Bar on the Hold Button
            const fillBar = document.getElementById('core-hold-progress-fill');
            const percentEl = document.getElementById('core-hold-percent');
            const percentVal = Math.min(100, Math.max(0, Math.round(this.holdProgress * 100)));

            if (fillBar) fillBar.style.width = `${percentVal}%`;
            if (percentEl) percentEl.textContent = `[ ${percentVal}% ]`;

            // Update SVG Progress Ring
            const ringCircle = document.getElementById('core-progress-circle');
            if (ringCircle) {
                const circumference = 2 * Math.PI * 26; // radius 26
                const offset = circumference - (this.holdProgress * circumference);
                ringCircle.style.strokeDashoffset = offset;
            }

            // Check if charge reached 100% threshold
            if (this.holdProgress >= 0.985 && (this.isHoldActive || this.targetHoldProgress === 1.0)) {
                this.holdProgress = 1.0;
                if (percentEl) percentEl.textContent = `[ UNLOCKED ]`;
                this.triggerBreach();
            }

            // 2. Camera Acceleration & FOV Narrowing toward Core center
            this.cameraDist.target = THREE.MathUtils.lerp(this.cameraDist.rest, this.cameraDist.breach, this.holdProgress);
            this.cameraFov.target = THREE.MathUtils.lerp(this.cameraFov.rest, this.cameraFov.breach, this.holdProgress);

            this.camera.position.z += (this.cameraDist.target - this.camera.position.z) * 0.12;
            this.camera.fov += (this.cameraFov.target - this.camera.fov) * 0.12;
            this.camera.updateProjectionMatrix();

            // 3. Core Rotation (Rest breathing rotation + gentle mouse tilt)
            this.coreMesh.rotation.y = elapsedTime * 0.2 + (this.mouse.normX * 0.4);
            this.coreMesh.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15 - (this.mouse.normY * 0.3);

            // 4. Update Shader Uniforms
            const uniforms = this.coreMaterial.uniforms;
            uniforms.uTime.value = elapsedTime;
            uniforms.uCharge.value = this.holdProgress;
            uniforms.uProximity.value = this.mouse.proximity;

            // Dynamically scale noise frequency and amplitude on charge/proximity
            uniforms.uNoiseFreq.value = 1.1 + (this.holdProgress * 2.8) + (this.mouse.proximity * 0.4);
            uniforms.uNoiseAmp.value = 14.0 + (this.holdProgress * 65.0) + (this.mouse.proximity * 12.0);

            // 3D vector towards mouse in object space
            const mouse3D = new THREE.Vector3(this.mouse.normX * 2.0, this.mouse.normY * 2.0, 1.0).normalize();
            uniforms.uMouseDir.value.copy(mouse3D);
        }

        this.renderer.render(this.scene, this.camera);
        this.rafId = requestAnimationFrame(this.render);
    }
}

window.TactileCorePortal = TactileCorePortal;

