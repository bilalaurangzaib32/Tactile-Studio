/**
 * Tactile Studio® — Mobile Accessories 3D Showcase Engine
 * Realtime 3D spatial interactive showcase supporting crystal-clear product image assets
 * and procedural WebGL models, with interactive 360° drag-to-rotate, floating levitation,
 * ambient blur backdrops, and HUD telemetry badges.
 */

class Accessories3DShowcase {
    constructor() {
        this.section = document.getElementById('accessories-3d-section');
        this.track = document.getElementById('accessories-slider-track');
        if (!this.section || !this.track) return;

        this.accessories = [
            {
                id: "acc-1",
                title: "APPLE ADAPTER",
                category: "CHARGING // POWER",
                subtitle: "Apple 30W USB-C Power Adapter",
                specs: "Apple 30W USB-C Power Adapter",
                price: "",
                type: "adapter",
                imageSrc: "assets/products/apple-adapter-30w.png",
                glowColor: "rgba(215, 230, 255, 0.42)"
            },
            {
                id: "acc-2",
                title: "Ronin Adapter",
                category: "CHARGING // POWER",
                subtitle: "Ronin Dual Port Adapter",
                specs: "Ronin Dual Port Adapter",
                price: "",
                type: "adapter",
                imageSrc: "assets/products/ronin-adapter-new.webp",
                glowColor: "rgba(90, 110, 140, 0.40)"
            },
            {
                id: "acc-3",
                title: "samsung adapter",
                category: "CHARGING // POWER",
                subtitle: "Official Samsung 25W USB-C Black Charger",
                specs: "Official Samsung 25W USB-C Black Charger",
                price: "",
                type: "adapter",
                imageSrc: "assets/products/samsung-adapter-25w.png",
                glowColor: "rgba(100, 130, 175, 0.40)"
            },
            {
                id: "acc-4",
                title: "AIRPODS CHARGING CAPSULE",
                category: "AUDIO // CARRY",
                subtitle: "Active Noise Cancelling Wireless Case",
                specs: "Acoustic Chamber Sealed · USB-C & Qi2 Charging · Precision Anodized Hinge",
                price: "",
                type: "airpods",
                modelColor: 0xf3f4f6,
                accentColor: 0xcccccc,
                glowColor: "#f3f4f6"
            },
            {
                id: "acc-5",
                title: "ANKER 737 POWER BANK",
                category: "POWER // FAST CHARGE",
                subtitle: "Anker PowerCore 24K 140W Ultra-Fast Charger",
                specs: "24,000mAh Capacity · 140W Two-Way Fast Charge · Smart Digital Display · Dual USB-C & USB-A",
                price: "",
                type: "anker-powerbank",
                glowColor: "rgba(0, 210, 255, 0.45)"
            },
            {
                id: "acc-6",
                title: "BASEUS BLADE 100W",
                category: "POWER // ULTRA-SLIM",
                subtitle: "Baseus Blade 20,000mAh Ultra-Thin Fast Charge",
                specs: "20,000mAh High-Density Battery · 100W Power Delivery · Real-Time LED Display · Dual Type-C & Dual USB",
                price: "",
                type: "baseus-powerbank",
                glowColor: "rgba(255, 170, 0, 0.45)"
            }
        ];

        this.scenes = new Map();
        this.imageAssets = new Map();
        this.activeFilter = 'ALL';
        this.currentTranslateX = 0;
        this.targetTranslateX = 0;
        this.maxScroll = 0;
        this.isDragging = false;
        this.startX = 0;
        this.lastX = 0;
        this.velocity = 0;

        this.init();
    }

    init() {
        this.renderCards();
        this.bindEvents();

        this.isVisible = true;
        this.rafId = null;

        if (typeof IntersectionObserver !== 'undefined' && this.section) {
            const accObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    this.isVisible = entry.isIntersecting;
                    if (this.isVisible && !this.rafId) {
                        this.rafId = requestAnimationFrame(() => this.animate());
                    }
                });
            }, { rootMargin: '150px 0px 150px 0px', threshold: 0.01 });
            accObserver.observe(this.section);
        } else {
            this.rafId = requestAnimationFrame(() => this.animate());
        }
    }

    renderCards() {
        this.track.innerHTML = '';
        this.scenes.clear();
        this.imageAssets.clear();

        const filtered = this.accessories.filter(a => {
            if (this.activeFilter === 'ALL') return true;
            return a.category.toUpperCase().includes(this.activeFilter.toUpperCase()) ||
                   a.type.toUpperCase() === this.activeFilter.toUpperCase();
        });

        filtered.forEach((acc, idx) => {
            const card = document.createElement('div');
            card.className = 'merci-card accessory-3d-card rounded-none';
            card.dataset.id = acc.id;

            const glowHex = acc.glowColor || 'rgba(0, 255, 204, 0.25)';

            if (acc.imageSrc) {
                // Image-based 3D Spatial Asset Card
                card.innerHTML = `
                    <!-- 1. 3D Spatial Asset Container with Ambient Blur Glow -->
                    <div class="merci-thumb-wrap accessory-thumb-wrap rounded-none overflow-hidden" data-id="${acc.id}">
                        <!-- Ambient Blurred Glow Backdrop (derived from pristine cutout) -->
                        <img src="${acc.imageSrc}" 
                             alt="" 
                             aria-hidden="true" 
                             class="merci-thumb-bg-blur" 
                             loading="lazy" />

                        <!-- Ambient Radial Glow Backdrop matching product aura -->
                        <div class="accessory-ambient-glow" style="background: radial-gradient(circle at center, ${glowHex} 0%, transparent 70%);"></div>

                        <!-- 3D Interactive Asset Stage -->
                        <div class="accessory-3d-stage">
                            <!-- 3D Specular Holographic Glare Layer -->
                            <div class="card-3d-glare"></div>

                            <!-- Crystal-Clear Solid Product Image in 3D Space -->
                            <img src="${acc.imageSrc}" 
                                 alt="${acc.title}" 
                                 class="merci-thumb-img object-contain rounded-none" 
                                 loading="lazy"
                                 draggable="false"
                                 onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80';" />
                        </div>

                        <!-- Radial Vignette Tint Overlay -->
                        <div class="thumb-tint-overlay"></div>

                        <!-- 3D Interactive HUD Badge -->
                        <div class="accessory-3d-hud-badge">
                            <span class="dot-live-3d"></span>
                            <span>INTERACTIVE 3D · DRAG TO ROTATE</span>
                        </div>
                    </div>

                    <!-- 2. Metadata Wrap -->
                    <div class="merci-meta-wrap">
                        <div class="flex items-center justify-between">
                            <h3 class="merci-client-name font-sans font-bold uppercase tracking-wider text-white text-base md:text-lg">${acc.title}</h3>
                            ${acc.price ? `<span class="accessory-price-tag font-mono text-sm text-[#00ffcc] tracking-wider">${acc.price}</span>` : ''}
                        </div>
                        <div class="merci-hairline w-8 h-[1px] bg-white/20 mt-2"></div>

                        <!-- 3. Hover Disclosure Panel -->
                        <div class="merci-hover-disclosure">
                            <div class="pt-3 font-mono text-[11px] md:text-xs text-neutral-400 uppercase tracking-widest leading-relaxed">
                                <p>${acc.specs}</p>
                            </div>
                            <div class="pt-2 font-mono text-[10px] text-neutral-500 uppercase tracking-wider flex gap-4">
                                <span class="tag-cat">[ ${acc.category} ]</span>
                                <span class="tag-interactive">3D ASSET READY</span>
                            </div>
                        </div>
                    </div>
                `;

                this.track.appendChild(card);

                const wrapEl = card.querySelector('.accessory-thumb-wrap');
                const stageEl = card.querySelector('.accessory-3d-stage');
                const imgEl = card.querySelector('.merci-thumb-img');
                const bgBlurImg = card.querySelector('.merci-thumb-bg-blur');
                const glowEl = card.querySelector('.accessory-ambient-glow');
                const glareEl = card.querySelector('.card-3d-glare');

                const imageAssetData = {
                    id: acc.id,
                    wrap: wrapEl,
                    stage: stageEl,
                    img: imgEl,
                    bgBlur: bgBlurImg,
                    glow: glowEl,
                    glare: glareEl,
                    interaction: {
                        isDown: false,
                        startX: 0,
                        startY: 0,
                        rotTargetX: 0,
                        rotTargetY: 0,
                        rotCurrentX: 0,
                        rotCurrentY: 0,
                        isHovered: false,
                        orbitPhase: idx * 1.15
                    }
                };
                this.imageAssets.set(acc.id, imageAssetData);
                this.bind3DImageAssetInteraction(imageAssetData);

            } else {
                // Procedural Three.js 3D WebGL Model Card
                card.innerHTML = `
                    <!-- 1. 3D WebGL Canvas Container with Ambient Blur Glow Backdrop -->
                    <div class="merci-thumb-wrap accessory-thumb-wrap rounded-none overflow-hidden" data-id="${acc.id}">
                        <div class="accessory-ambient-glow" style="background: radial-gradient(circle at center, ${glowHex} 0%, transparent 70%);"></div>
                        <canvas class="accessory-3d-canvas" id="canvas-${acc.id}"></canvas>
                        <div class="thumb-tint-overlay"></div>
                        <div class="accessory-3d-hud-badge">
                            <span class="dot-live-3d"></span>
                            <span>INTERACTIVE 3D · DRAG TO ROTATE</span>
                        </div>
                    </div>

                    <!-- 2. Metadata Wrap -->
                    <div class="merci-meta-wrap">
                        <div class="flex items-center justify-between">
                            <h3 class="merci-client-name font-sans font-bold uppercase tracking-wider text-white text-base md:text-lg">${acc.title}</h3>
                            ${acc.price ? `<span class="accessory-price-tag font-mono text-sm text-[#00ffcc] tracking-wider">${acc.price}</span>` : ''}
                        </div>
                        <div class="merci-hairline w-8 h-[1px] bg-white/20 mt-2"></div>

                        <!-- 3. Hover Disclosure Panel -->
                        <div class="merci-hover-disclosure">
                            <div class="pt-3 font-mono text-[11px] md:text-xs text-neutral-400 uppercase tracking-widest leading-relaxed">
                                <p>${acc.specs}</p>
                            </div>
                            <div class="pt-2 font-mono text-[10px] text-neutral-500 uppercase tracking-wider flex gap-4">
                                <span class="tag-cat">[ ${acc.category} ]</span>
                                <span class="tag-interactive">3D MODEL READY</span>
                            </div>
                        </div>
                    </div>
                `;

                this.track.appendChild(card);

                // Initialize Three.js scene for this specific accessory
                const canvasEl = card.querySelector(`#canvas-${acc.id}`);
                const sceneData = this.setup3DScene(canvasEl, acc);
                this.scenes.set(acc.id, sceneData);
            }

            card.addEventListener('mouseenter', () => {
                if (window.tactileAudio) {
                    window.tactileAudio.playGlassTick(3100);
                }
            });
        });

        this.computeDimensions();
    }

    bind3DImageAssetInteraction(asset) {
        const { wrap, stage, interaction } = asset;
        if (!wrap || !stage) return;

        const onPointerDown = (e) => {
            interaction.isDown = true;
            interaction.startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            interaction.startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
            wrap.classList.add('is-dragging-accessory');
        };

        const onPointerMove = (e) => {
            const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

            if (interaction.isDown) {
                const dx = clientX - interaction.startX;
                const dy = clientY - interaction.startY;
                interaction.rotTargetY += dx * 0.45;
                interaction.rotTargetX -= dy * 0.45;
                interaction.rotTargetX = Math.max(-36, Math.min(36, interaction.rotTargetX));
                interaction.startX = clientX;
                interaction.startY = clientY;
            } else if (interaction.isHovered) {
                const rect = wrap.getBoundingClientRect();
                const x = (clientX - rect.left) / rect.width - 0.5;
                const y = (clientY - rect.top) / rect.height - 0.5;
                interaction.rotTargetY = x * 32;
                interaction.rotTargetX = -y * 24;
            }
        };

        const onPointerUp = () => {
            if (interaction.isDown) {
                interaction.isDown = false;
                wrap.classList.remove('is-dragging-accessory');
            }
        };

        stage.addEventListener('mousedown', onPointerDown);
        stage.addEventListener('touchstart', onPointerDown, { passive: true });

        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove, { passive: true });

        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        wrap.addEventListener('mouseenter', () => {
            interaction.isHovered = true;
        });

        wrap.addEventListener('mouseleave', () => {
            interaction.isHovered = false;
            if (!interaction.isDown) {
                interaction.rotTargetX = 0;
            }
        });
    }

    setup3DScene(canvas, acc) {
        if (!canvas || typeof THREE === 'undefined') return null;

        const width = canvas.parentElement.clientWidth || 440;
        const height = canvas.parentElement.clientHeight || 330;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(0, 0, 6.2);

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;

        // Lighting Rig
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
        keyLight.position.set(4, 5, 4);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x7090ff, 1.8);
        rimLight.position.set(-4, -2, -3);
        scene.add(rimLight);

        const fillLight = new THREE.PointLight(0xffeedd, 1.4, 15);
        fillLight.position.set(0, -3, 3);
        scene.add(fillLight);

        // Build 3D Accessory Mesh
        const group = new THREE.Group();
        const meshData = this.buildAccessoryModel(acc.type, acc);
        group.add(meshData.root);
        scene.add(group);

        // Interaction State
        const interaction = {
            isDown: false,
            startX: 0,
            startY: 0,
            rotTargetX: 0.15,
            rotTargetY: -0.35,
            rotCurrentX: 0.15,
            rotCurrentY: -0.35,
            autoRotateSpeed: 0.008,
            isHovered: false
        };

        const onPointerDown = (e) => {
            interaction.isDown = true;
            interaction.startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            interaction.startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
            canvas.style.cursor = 'grabbing';
        };

        const onPointerMove = (e) => {
            if (!interaction.isDown) return;
            const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
            const dx = x - interaction.startX;
            const dy = y - interaction.startY;
            interaction.rotTargetY += dx * 0.012;
            interaction.rotTargetX += dy * 0.012;
            interaction.startX = x;
            interaction.startY = y;
        };

        const onPointerUp = () => {
            interaction.isDown = false;
            canvas.style.cursor = 'grab';
        };

        canvas.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        canvas.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);

        canvas.parentElement.addEventListener('mouseenter', () => {
            interaction.isHovered = true;
        });
        canvas.parentElement.addEventListener('mouseleave', () => {
            interaction.isHovered = false;
        });

        return {
            canvas,
            scene,
            camera,
            renderer,
            group,
            meshData,
            interaction,
            width,
            height
        };
    }

    buildAccessoryModel(type, config) {
        const root = new THREE.Group();
        const materials = {};

        switch (type) {
            case 'airpods': {
                const caseGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.4, 48);
                materials.body = new THREE.MeshPhysicalMaterial({
                    color: config.modelColor || 0xf3f4f6,
                    metalness: 0.05,
                    roughness: 0.15,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.08
                });
                const caseMesh = new THREE.Mesh(caseGeo, materials.body);
                root.add(caseMesh);

                const domeTopGeo = new THREE.SphereGeometry(1.2, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
                const domeTop = new THREE.Mesh(domeTopGeo, materials.body);
                domeTop.position.y = 0.7;
                root.add(domeTop);

                const domeBottomGeo = new THREE.SphereGeometry(1.2, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
                const domeBottom = new THREE.Mesh(domeBottomGeo, materials.body);
                domeBottom.position.y = -0.7;
                root.add(domeBottom);

                const cutGeo = new THREE.TorusGeometry(1.205, 0.015, 12, 64);
                materials.accent = new THREE.MeshStandardMaterial({
                    color: config.accentColor || 0xcccccc,
                    metalness: 0.95,
                    roughness: 0.1
                });
                const cutMesh = new THREE.Mesh(cutGeo, materials.accent);
                cutMesh.rotation.x = Math.PI / 2;
                cutMesh.position.y = 0.3;
                root.add(cutMesh);

                const ledGeo = new THREE.SphereGeometry(0.045, 16, 16);
                const ledMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
                const ledMesh = new THREE.Mesh(ledGeo, ledMat);
                ledMesh.position.set(0, 0, 1.22);
                root.add(ledMesh);

                root.rotation.x = 0.2;
                root.rotation.y = -0.25;
                break;
            }

            case 'charger': {
                const brickGeo = new THREE.BoxGeometry(1.9, 2.5, 1.5);
                materials.body = new THREE.MeshStandardMaterial({
                    color: config.modelColor || 0x2a2b32,
                    metalness: 0.25,
                    roughness: 0.35
                });
                const brickMesh = new THREE.Mesh(brickGeo, materials.body);
                root.add(brickMesh);

                const portGeo = new THREE.BoxGeometry(0.55, 0.2, 0.08);
                materials.accent = new THREE.MeshStandardMaterial({
                    color: config.accentColor || 0xff6622,
                    emissive: config.accentColor || 0xff6622,
                    emissiveIntensity: 0.5,
                    roughness: 0.2
                });

                const port1 = new THREE.Mesh(portGeo, materials.accent);
                port1.position.set(0, 0.45, 0.76);
                root.add(port1);

                const port2 = new THREE.Mesh(portGeo, materials.accent);
                port2.position.set(0, -0.15, 0.76);
                root.add(port2);

                const usbAGeo = new THREE.BoxGeometry(0.75, 0.35, 0.08);
                const usbAMat = new THREE.MeshStandardMaterial({ color: 0x111218, roughness: 0.4 });
                const port3 = new THREE.Mesh(usbAGeo, usbAMat);
                port3.position.set(0, -0.75, 0.76);
                root.add(port3);

                root.rotation.x = 0.3;
                root.rotation.y = 0.55;
                break;
            }

            case 'wallet': {
                const walletGeo = new THREE.BoxGeometry(2.1, 3.2, 0.28);
                materials.body = new THREE.MeshStandardMaterial({
                    color: config.modelColor || 0x8d5b3a,
                    metalness: 0.1,
                    roughness: 0.65
                });
                const walletMesh = new THREE.Mesh(walletGeo, materials.body);
                root.add(walletMesh);

                const notchGeo = new THREE.TorusGeometry(0.5, 0.04, 12, 32, Math.PI);
                materials.accent = new THREE.MeshStandardMaterial({
                    color: config.accentColor || 0xc49a6c,
                    metalness: 0.8,
                    roughness: 0.25
                });
                const notchMesh = new THREE.Mesh(notchGeo, materials.accent);
                notchMesh.rotation.z = Math.PI;
                notchMesh.position.set(0, 1.25, 0.15);
                root.add(notchMesh);

                const magnetRingGeo = new THREE.TorusGeometry(0.75, 0.025, 12, 48);
                const magnetMat = new THREE.MeshStandardMaterial({
                    color: 0x111116,
                    roughness: 0.8
                });
                const magnetRing = new THREE.Mesh(magnetRingGeo, magnetMat);
                magnetRing.position.set(0, -0.2, 0.145);
                root.add(magnetRing);

                root.rotation.x = 0.35;
                root.rotation.y = -0.3;
                break;
            }

            case 'case': {
                const frameGeo = new THREE.BoxGeometry(2.4, 4.4, 0.35);
                materials.body = new THREE.MeshStandardMaterial({
                    color: config.modelColor || 0x8e9099,
                    metalness: 0.75,
                    roughness: 0.28
                });
                const frameMesh = new THREE.Mesh(frameGeo, materials.body);
                root.add(frameMesh);

                const backGeo = new THREE.BoxGeometry(2.1, 4.1, 0.08);
                const backMat = new THREE.MeshPhysicalMaterial({
                    color: 0x22242e,
                    roughness: 0.2,
                    transmission: 0.7,
                    transparent: true,
                    opacity: 0.6
                });
                const backMesh = new THREE.Mesh(backGeo, backMat);
                backMesh.position.z = -0.05;
                root.add(backMesh);

                const camGuardGeo = new THREE.BoxGeometry(1.2, 1.2, 0.22);
                materials.accent = new THREE.MeshStandardMaterial({
                    color: config.accentColor || 0x444455,
                    metalness: 0.9,
                    roughness: 0.2
                });
                const camGuard = new THREE.Mesh(camGuardGeo, materials.accent);
                camGuard.position.set(-0.45, 1.35, 0.18);
                root.add(camGuard);

                root.rotation.x = 0.35;
                root.rotation.y = 0.45;
                break;
            }

            case 'anker-powerbank': {
                // Anker 737 Monolithic PowerCore Pillar
                const bodyGeo = new THREE.BoxGeometry(1.65, 3.4, 1.45);
                materials.body = new THREE.MeshStandardMaterial({
                    color: 0x1e2026,
                    metalness: 0.85,
                    roughness: 0.25
                });
                const bodyMesh = new THREE.Mesh(bodyGeo, materials.body);
                root.add(bodyMesh);

                // Smart OLED Digital Display Panel
                const oledGeo = new THREE.BoxGeometry(1.15, 1.15, 0.05);
                materials.display = new THREE.MeshPhysicalMaterial({
                    color: 0x050810,
                    metalness: 0.2,
                    roughness: 0.1,
                    clearcoat: 1.0
                });
                const oledMesh = new THREE.Mesh(oledGeo, materials.display);
                oledMesh.position.set(0, 0.65, 0.74);
                root.add(oledMesh);

                // Glowing Cyan Battery Percentage & Telemetry HUD Ring
                const ringGeo = new THREE.TorusGeometry(0.38, 0.035, 12, 32);
                materials.glowRing = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
                const ringMesh = new THREE.Mesh(ringGeo, materials.glowRing);
                ringMesh.position.set(0, 0.65, 0.77);
                root.add(ringMesh);

                // Dual USB-C 140W Ports
                const portGeo = new THREE.BoxGeometry(0.48, 0.18, 0.08);
                materials.port = new THREE.MeshStandardMaterial({
                    color: 0x00d2ff,
                    emissive: 0x0088cc,
                    emissiveIntensity: 0.6,
                    roughness: 0.2
                });
                const port1 = new THREE.Mesh(portGeo, materials.port);
                port1.position.set(0, -0.35, 0.74);
                root.add(port1);

                const port2 = new THREE.Mesh(portGeo, materials.port);
                port2.position.set(0, -0.75, 0.74);
                root.add(port2);

                // USB-A Port
                const usbAGeo = new THREE.BoxGeometry(0.65, 0.28, 0.08);
                const usbAMat = new THREE.MeshStandardMaterial({ color: 0x111216, roughness: 0.4 });
                const port3 = new THREE.Mesh(usbAGeo, usbAMat);
                port3.position.set(0, -1.15, 0.74);
                root.add(port3);

                root.rotation.x = 0.25;
                root.rotation.y = 0.45;
                break;
            }

            case 'baseus-powerbank': {
                // Baseus Blade Ultra-Thin Power Bank Slab
                const bodyGeo = new THREE.BoxGeometry(2.7, 3.8, 0.38);
                materials.body = new THREE.MeshStandardMaterial({
                    color: 0x17181c,
                    metalness: 0.75,
                    roughness: 0.35
                });
                const bodyMesh = new THREE.Mesh(bodyGeo, materials.body);
                root.add(bodyMesh);

                // Curved Top LED Display Bar
                const ledBarGeo = new THREE.BoxGeometry(1.4, 0.5, 0.04);
                materials.display = new THREE.MeshStandardMaterial({
                    color: 0x08090d,
                    roughness: 0.15
                });
                const ledBar = new THREE.Mesh(ledBarGeo, materials.display);
                ledBar.position.set(0, 1.25, 0.2);
                root.add(ledBar);

                // Glowing Amber 100% LED Indicator
                const textGlowGeo = new THREE.BoxGeometry(0.8, 0.18, 0.02);
                materials.indicator = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
                const indicatorMesh = new THREE.Mesh(textGlowGeo, materials.indicator);
                indicatorMesh.position.set(0, 1.25, 0.22);
                root.add(indicatorMesh);

                // Quad Ports Array on Top Edge
                const quadPortGeo = new THREE.BoxGeometry(0.38, 0.12, 0.15);
                materials.port = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0x995500, roughness: 0.3 });
                [-0.75, -0.25, 0.25, 0.75].forEach(x => {
                    const p = new THREE.Mesh(quadPortGeo, materials.port);
                    p.position.set(x, 1.9, 0);
                    root.add(p);
                });

                root.rotation.x = 0.35;
                root.rotation.y = -0.35;
                break;
            }
        }

        return { root, materials };
    }

    computeDimensions() {
        const viewportWidth = window.innerWidth;
        const trackWidth = this.track.scrollWidth;
        this.maxScroll = Math.max(0, trackWidth - viewportWidth + 140);
        this.clampScroll();
    }

    clampScroll() {
        this.targetTranslateX = Math.max(-this.maxScroll, Math.min(0, this.targetTranslateX));
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.computeDimensions();
            this.scenes.forEach(s => {
                if (!s.canvas.parentElement) return;
                const w = s.canvas.parentElement.clientWidth;
                const h = s.canvas.parentElement.clientHeight;
                s.camera.aspect = w / h;
                s.camera.updateProjectionMatrix();
                s.renderer.setSize(w, h);
            });
        });

        // Wheel Virtual Scroll
        this.section.addEventListener('wheel', (e) => {
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            if (Math.abs(delta) > 2) {
                const atStart = this.targetTranslateX >= -2 && delta < 0;
                const atEnd = this.targetTranslateX <= -(this.maxScroll - 2) && delta > 0;
                if (!atStart && !atEnd) {
                    this.targetTranslateX -= delta * 1.15;
                    this.clampScroll();
                }
            }
        }, { passive: true });

        // Drag Virtual Scroll on track
        this.track.addEventListener('mousedown', (e) => {
            if (e.target.closest('.accessory-3d-stage') || e.target.tagName === 'CANVAS') return;
            this.isDragging = true;
            this.startX = e.clientX;
            this.lastX = e.clientX;
            this.velocity = 0;
            this.track.classList.add('is-dragging');
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const delta = e.clientX - this.lastX;
            this.lastX = e.clientX;
            this.velocity = delta;
            this.targetTranslateX += delta;
            this.clampScroll();
        });

        window.addEventListener('mouseup', () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.track.classList.remove('is-dragging');
        });

        // Category Filter Buttons
        const filterBtns = this.section.querySelectorAll('.accessory-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilter = btn.dataset.filter || 'ALL';
                this.renderCards();
            });
        });
    }

    animate() {
        if (!this.isVisible) {
            this.rafId = null;
            return;
        }

        // Physics smoothing for horizontal slider
        this.currentTranslateX += (this.targetTranslateX - this.currentTranslateX) * 0.085;
        this.track.style.transform = `translate3d(${this.currentTranslateX}px, 0, 0)`;

        // Update Scrubber Fill
        const scrubberFill = document.getElementById('acc-scrubber-progress-fill');
        if (scrubberFill && this.maxScroll > 0) {
            const progress = Math.min(1, Math.max(0, -this.currentTranslateX / this.maxScroll));
            scrubberFill.style.width = `${progress * 100}%`;
        }

        const time = Date.now() * 0.002;

        // Animate Image-Based 3D Spatial Assets (Card 1 Apple Adapter & Card 2 Ronin Adapter)
        this.imageAssets.forEach((asset) => {
            const { stage, bgBlur, glare, interaction } = asset;
            if (!stage) return;

            if (!interaction.isDown) {
                if (!interaction.isHovered) {
                    const sway = Math.sin(time + interaction.orbitPhase) * 16;
                    interaction.rotTargetY += (sway - interaction.rotTargetY) * 0.04;
                    interaction.rotTargetX += (0 - interaction.rotTargetX) * 0.04;
                }
            }

            interaction.rotCurrentX += (interaction.rotTargetX - interaction.rotCurrentX) * 0.085;
            interaction.rotCurrentY += (interaction.rotTargetY - interaction.rotCurrentY) * 0.085;

            const floatOffset = Math.sin(time * 1.5 + interaction.orbitPhase) * 8;
            const hoverLift = interaction.isHovered ? -10 : 0;
            const translateY = floatOffset + hoverLift;

            stage.style.transform = `perspective(1100px) translateY(${translateY.toFixed(2)}px) rotateX(${interaction.rotCurrentX.toFixed(2)}deg) rotateY(${interaction.rotCurrentY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03) translateZ(42px)`;

            if (bgBlur) {
                bgBlur.style.transform = `scale(1.3) translateX(${(-interaction.rotCurrentY * 0.55).toFixed(1)}px) translateY(${(interaction.rotCurrentX * 0.55).toFixed(1)}px)`;
            }

            if (glare) {
                const glareX = 50 + (interaction.rotCurrentY / 32) * 45;
                const glareY = 50 - (interaction.rotCurrentX / 32) * 45;
                const op = interaction.isHovered || interaction.isDown ? 0.45 : 0.22;
                glare.style.opacity = op.toString();
                glare.style.background = `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`;
            }
        });

        // Animate Procedural Three.js 3D Models
        this.scenes.forEach(sceneData => {
            const { group, interaction, renderer, scene, camera } = sceneData;

            if (!interaction.isDown) {
                interaction.rotTargetY += interaction.autoRotateSpeed;
            }

            interaction.rotCurrentX += (interaction.rotTargetX - interaction.rotCurrentX) * 0.08;
            interaction.rotCurrentY += (interaction.rotTargetY - interaction.rotCurrentY) * 0.08;

            group.rotation.x = interaction.rotCurrentX;
            group.rotation.y = interaction.rotCurrentY;

            const floatOffset = Math.sin(time) * 0.08;
            group.position.y = (interaction.isHovered ? 0.15 : 0) + floatOffset;

            renderer.render(scene, camera);
        });

        this.rafId = requestAnimationFrame(() => this.animate());
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    window.accessoriesShowcase = new Accessories3DShowcase();
});
