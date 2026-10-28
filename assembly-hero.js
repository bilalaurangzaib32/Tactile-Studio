/**
 * Tactile Studio® — Refokus-Inspired Kinetic 3D Assembly Hero
 * 
 * Features:
 * - Vertical fluted/pleated backdrop mesh illuminated by violet radial rim-light (#3B0764)
 * - 7-Segmented 3D "T" lettermark monolith (brushed graphite & dark metallic chrome)
 * - State A: Scattered floating segments with real-time 3D coordinate-tracked service pills
 * - State B: Magnetic snap assembly on scroll with mechanical audio click feedback
 * - Pointer parallax with smooth lerp damping
 * - Center brand lockup: "It's time to create" + "Tactile"
 */

class AssemblyHero {
    constructor() {
        this.container = document.getElementById('assembly-hero-section');
        this.canvas = document.getElementById('assembly-canvas');
        if (!this.canvas) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Assembly Segments & Backdrop
        this.segments = [];
        this.backdropMesh = null;
        this.group = null;

        // Scroll & Assembly Progress (0 = scattered, 1 = assembled)
        this.scroll = {
            current: 0,
            target: 0,
            progress: 0, // 0 to 1
            ease: 0.08
        };

        // Pointer Parallax
        this.mouse = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0
        };

        // Track snapping sound triggers
        this.snappedFlags = [false, false, false, false, false, false, false];

        this.init();
    }

    init() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1. Scene
        this.scene = new THREE.Scene();

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(40, width / height, 1, 2000);
        this.camera.position.set(0, 0, 520);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        // 4. Lighting Rig (Moody Violet Rim + Crisp Specular Directionals)
        this.setupLighting();

        // 5. Pleated / Fluted Vertical Backdrop Mesh
        this.createFlutedBackdrop();

        // 6. Segmented 3D Monolith Structure (7 distinct blocks forming the "T")
        this.createMonolithSegments();

        // 7. Event Listeners
        this.bindEvents();

        // 8. Viewport Intersection Observer & Render Loop
        this.isVisible = true;
        this.rafId = null;
        this.render = this.render.bind(this);

        if (typeof IntersectionObserver !== 'undefined' && this.container) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    this.isVisible = entry.isIntersecting;
                    if (this.isVisible && !this.rafId) {
                        this.rafId = requestAnimationFrame(this.render);
                    }
                });
            }, { rootMargin: '100px 0px 100px 0px', threshold: 0.01 });
            heroObserver.observe(this.container);
        } else {
            this.rafId = requestAnimationFrame(this.render);
        }
    }

    setupLighting() {
        // Deep purple ambient base
        const ambient = new THREE.AmbientLight(0x1a0b2e, 1.4);
        this.scene.add(ambient);

        // Intense moody violet radial rim light (#7c3aed / #3b0764)
        const violetRim = new THREE.DirectionalLight(0x9333ea, 3.2);
        violetRim.position.set(-300, 250, -100);
        this.scene.add(violetRim);

        // Cold chrome key light for razor-sharp edge speculars
        const chromeLight = new THREE.DirectionalLight(0xffffff, 2.8);
        chromeLight.position.set(280, 320, 350);
        this.scene.add(chromeLight);

        // Bottom cyan kick
        const cyanKick = new THREE.PointLight(0x00f0ff, 1.6, 700);
        cyanKick.position.set(0, -280, 200);
        this.scene.add(cyanKick);
    }

    /**
     * Pleated / Fluted Vertical Backdrop Mesh
     * Sinusoidal ridges illuminated by radial violet light
     */
    createFlutedBackdrop() {
        const geom = new THREE.PlaneGeometry(1600, 1100, 120, 20);
        const pos = geom.attributes.position;

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            // Sinusoidal vertical pleating/fluting ridges
            const z = Math.sin(x * 0.045) * 16.0;
            pos.setZ(i, z);
        }
        geom.computeVertexNormals();

        // Dark plum velvet-like shader material with violet rim
        const mat = new THREE.MeshStandardMaterial({
            color: 0x090514,
            roughness: 0.65,
            metalness: 0.45,
            side: THREE.DoubleSide
        });

        this.backdropMesh = new THREE.Mesh(geom, mat);
        this.backdropMesh.position.z = -180;
        this.scene.add(this.backdropMesh);
    }

    /**
     * Segmented 3D Monolith Structure
     * 7 precision blocks forming the Tactile "T" lettermark:
     * - Left Wing Slab
     * - Center Cap Block
     * - Right Wing Slab
     * - Crown Accent Bar
     * - Upper Stem Pillar
     * - Mid Stem Block
     * - Base Foundation
     */
    createMonolithSegments() {
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Heavy brushed graphite and dark metallic chrome material
        const chromeMat = new THREE.MeshStandardMaterial({
            color: 0x18181e,
            metalness: 0.94,
            roughness: 0.18,
            envMapIntensity: 1.5
        });

        // Blueprint of 7 segments: dimensions, target assembled pos/rot, and scattered pos/rot
        const segmentData = [
            // 1. Left Wing Slab
            {
                label: 'Web Design',
                badgeId: 'badge-web-design',
                size: [86, 30, 28],
                assembled: { pos: [-62, 70, 0], rot: [0, 0, 0] },
                scattered: { pos: [-240, 140, 90], rot: [0.4, -0.6, 0.35] }
            },
            // 2. Center Cap Block
            {
                label: 'Visual Identity',
                badgeId: 'badge-visual-identity',
                size: [48, 32, 34],
                assembled: { pos: [0, 70, 0], rot: [0, 0, 0] },
                scattered: { pos: [-40, 240, -60], rot: [-0.35, 0.5, -0.2] }
            },
            // 3. Right Wing Slab
            {
                label: 'Development',
                badgeId: 'badge-development',
                size: [86, 30, 28],
                assembled: { pos: [62, 70, 0], rot: [0, 0, 0] },
                scattered: { pos: [230, 150, 80], rot: [0.45, 0.65, -0.4] }
            },
            // 4. Crown Accent Bar (Horizontal Bevel Bar)
            {
                label: null,
                badgeId: null,
                size: [170, 10, 18],
                assembled: { pos: [0, 90, 4], rot: [0, 0, 0] },
                scattered: { pos: [90, 220, 120], rot: [-0.5, 0.3, 0.6] }
            },
            // 5. Upper Stem Pillar
            {
                label: 'Motion',
                badgeId: 'badge-motion',
                size: [38, 62, 30],
                assembled: { pos: [0, 26, 0], rot: [0, 0, 0] },
                scattered: { pos: [-190, -110, 60], rot: [-0.55, 0.35, 0.5] }
            },
            // 6. Mid Stem Block
            {
                label: 'Brand Positioning',
                badgeId: 'badge-brand-positioning',
                size: [38, 68, 32],
                assembled: { pos: [0, -36, 0], rot: [0, 0, 0] },
                scattered: { pos: [190, -130, 100], rot: [0.4, -0.5, 0.25] }
            },
            // 7. Base Foundation
            {
                label: null,
                badgeId: null,
                size: [48, 38, 36],
                assembled: { pos: [0, -88, 0], rot: [0, 0, 0] },
                scattered: { pos: [30, -230, -40], rot: [-0.25, 0.8, -0.3] }
            }
        ];

        segmentData.forEach((data, index) => {
            const [w, h, d] = data.size;
            const geom = new THREE.BoxGeometry(w, h, d);

            const mesh = new THREE.Mesh(geom, chromeMat.clone());
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Initially in scattered state
            mesh.position.set(data.scattered.pos[0], data.scattered.pos[1], data.scattered.pos[2]);
            mesh.rotation.set(data.scattered.rot[0], data.scattered.rot[1], data.scattered.rot[2]);

            mesh.userData = {
                index,
                data,
                badgeEl: data.badgeId ? document.getElementById(data.badgeId) : null,
                currentPos: new THREE.Vector3(...data.scattered.pos),
                currentRot: new THREE.Euler(...data.scattered.rot)
            };

            this.group.add(mesh);
            this.segments.push(mesh);
        });
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });

        // Mouse Parallax
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Scroll Scrub Handler
        const scrollTracker = () => {
            if (!this.container) return;
            const rect = this.container.getBoundingClientRect();
            const scrollDistance = this.container.offsetHeight - window.innerHeight;

            if (scrollDistance > 0) {
                const scrolled = Math.max(0, -rect.top);
                const rawProgress = Math.min(1.0, scrolled / scrollDistance);
                this.scroll.target = rawProgress;
            }
        };

        window.addEventListener('scroll', scrollTracker, { passive: true });
        scrollTracker();
    }

    /**
     * Updates segment positions and projects 3D coordinates to floating DOM badges
     */
    updateAssembly(progress) {
        const widthHalf = window.innerWidth * 0.5;
        const heightHalf = window.innerHeight * 0.5;

        // Overall progress easing
        const t = Math.max(0, Math.min(1, progress));

        // Audio lowpass sweep coupling on ambient drone
        if (window.tactileAudio && window.tactileAudio.droneFilter) {
            const filterCutoff = 320 + (t * 850);
            const now = window.tactileAudio.ctx ? window.tactileAudio.ctx.currentTime : 0;
            if (now) {
                window.tactileAudio.droneFilter.frequency.setTargetAtTime(filterCutoff, now, 0.06);
            }
        }

        this.segments.forEach((seg, i) => {
            const data = seg.userData.data;

            // Staggered magnetic snap: earlier segments start assembling slightly sooner
            const segStart = i * 0.06;
            const segEnd = Math.min(1.0, 0.65 + i * 0.05);
            const localT = Math.max(0, Math.min(1, (t - segStart) / (segEnd - segStart)));

            // Smooth cubic ease for magnetic snap feel
            const easedT = localT < 0.5
                ? 4 * localT * localT * localT
                : 1 - Math.pow(-2 * localT + 2, 3) / 2;

            // Interpolate Position
            seg.position.x = THREE.MathUtils.lerp(data.scattered.pos[0], data.assembled.pos[0], easedT);
            seg.position.y = THREE.MathUtils.lerp(data.scattered.pos[1], data.assembled.pos[1], easedT);
            seg.position.z = THREE.MathUtils.lerp(data.scattered.pos[2], data.assembled.pos[2], easedT);

            // Interpolate Rotation
            seg.rotation.x = THREE.MathUtils.lerp(data.scattered.rot[0], data.assembled.rot[0], easedT);
            seg.rotation.y = THREE.MathUtils.lerp(data.scattered.rot[1], data.assembled.rot[1], easedT);
            seg.rotation.z = THREE.MathUtils.lerp(data.scattered.rot[2], data.assembled.rot[2], easedT);

            // Mechanical audio snap click when segment docks near target
            if (easedT > 0.95 && !this.snappedFlags[i]) {
                this.snappedFlags[i] = true;
                if (window.tactileAudio) {
                    window.tactileAudio.playGlassTick(1800 + i * 220);
                }
            } else if (easedT < 0.85 && this.snappedFlags[i]) {
                this.snappedFlags[i] = false;
            }

            // Project 3D coordinate to Screen for floating HTML Service Badges
            const badge = seg.userData.badgeEl;
            if (badge) {
                const tempVec = new THREE.Vector3();
                seg.getWorldPosition(tempVec);
                tempVec.z += 25; // Offset slightly toward camera
                tempVec.project(this.camera);

                const screenX = (tempVec.x * widthHalf) + widthHalf;
                const screenY = -(tempVec.y * heightHalf) + heightHalf;

                badge.style.transform = `translate(${screenX}px, ${screenY}px)`;

                // Badges smoothly fade out as assembly progresses
                const badgeOpacity = Math.max(0, 1.0 - (t * 2.2));
                badge.style.opacity = badgeOpacity.toFixed(3);
                badge.style.pointerEvents = badgeOpacity > 0.1 ? 'auto' : 'none';
            }
        });

        // Center Brand Lockup Reveal ("It's time to create Tactile")
        const brandLockup = document.getElementById('center-brand-lockup');
        if (brandLockup) {
            // Lockup reveals as segments merge (t > 0.45)
            const lockupProgress = Math.max(0, Math.min(1, (t - 0.35) / 0.55));
            brandLockup.style.opacity = lockupProgress.toFixed(3);
            const scale = THREE.MathUtils.lerp(0.9, 1.0, lockupProgress);
            brandLockup.style.transform = `translate(-50%, -50%) scale(${scale})`;
        }
    }

    render() {
        if (!this.isVisible) {
            this.rafId = null;
            return;
        }

        // Smooth lerp for scroll scrub
        this.scroll.current += (this.scroll.target - this.scroll.current) * this.scroll.ease;
        this.scroll.progress = this.scroll.current;

        // Pointer parallax damping
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

        if (this.group) {
            this.group.rotation.y = this.mouse.x * 0.22;
            this.group.rotation.x = -this.mouse.y * 0.18;
        }

        if (this.backdropMesh) {
            this.backdropMesh.position.x = this.mouse.x * 25;
            this.backdropMesh.position.y = this.mouse.y * 20;
        }

        // Update monolith assembly
        this.updateAssembly(this.scroll.progress);

        this.renderer.render(this.scene, this.camera);
        this.rafId = requestAnimationFrame(this.render);
    }
}

window.AssemblyHero = AssemblyHero;

