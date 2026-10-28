/**
 * Tactile Studio® — Contact & Inquiry 3D Engine
 * 
 * Features:
 * 1. 3D Opening Entrance ("The Device Assembly") with smooth camera glide
 * 2. Interactive Flagship Phone Model with dynamic live screen canvas texture
 * 3. Floating 3D Brand Emblems (Apple, Samsung, Google, Xiaomi) with raycasting & click sync
 * 4. Rotating 3D Holographic Trust Badge
 * 5. Dynamic lighting feedback on input focus
 * 6. Web Audio API coupling for clicks & transmit chimes
 */

class Contact3DScene {
    constructor() {
        this.canvas = document.getElementById('contact-canvas');
        this.screenCanvas = document.getElementById('phone-screen-canvas');
        if (!this.canvas || !this.screenCanvas) return;

        this.screenCtx = this.screenCanvas.getContext('2d');

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // 3D Objects
        this.phoneGroup = null;
        this.screenMesh = null;
        this.screenTexture = null;
        this.brandTokens = [];
        this.trustBadgeMesh = null;

        // Lights
        this.pointLight = null;
        this.rimLight = null;
        this.ambientLight = null;

        // Mouse Parallax & Raycasting
        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2(-999, -999);
        this.hoveredToken = null;

        // Realtime Data Sync for Phone Screen
        this.formData = {
            name: '',
            phone: '',
            model: '18 PRO MAX — Burgundy (256 GB , PTA APPROVED , BOX PACK)',
            type: 'Buy Box Pack',
            msg: ''
        };

        this.init();
    }

    init() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x08080B);
        this.scene.fog = new THREE.FogExp2(0x08080B, 0.045);

        // 2. Camera (Starts zoomed out for the 3D Entrance Sequence)
        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        this.camera.position.set(0, 0, 7.5);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;

        // 4. Lighting Rig
        this.setupLighting();

        // 5. Build 3D Flagship Phone Model
        this.createPhoneModel();

        // 6. Build Floating 3D Brand Tokens
        this.createBrandTokens();

        // 7. Build Rotating Holographic Trust Badge
        this.createTrustBadge();

        // 8. Event Listeners
        this.bindEvents();

        // 9. Initial Dynamic Screen Render
        this.updateScreenTexture();

        // 10. Play 3D Entrance Sequence ("The Device Assembly")
        this.playEntranceAnimation();

        // 11. Start Render Loop
        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    setupLighting() {
        // Deep ambient base
        this.ambientLight = new THREE.AmbientLight(0x161622, 1.6);
        this.scene.add(this.ambientLight);

        // Dynamic reactive point light (intensifies on form input focus)
        this.pointLight = new THREE.PointLight(0x00F0FF, 1.4, 25);
        this.pointLight.position.set(-1.8, 2.2, 3.5);
        this.scene.add(this.pointLight);

        // Moody purple-violet directional rim light
        this.rimLight = new THREE.DirectionalLight(0x9333ea, 2.8);
        this.rimLight.position.set(4, 3, -2);
        this.scene.add(this.rimLight);

        // Specular chrome key light
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
        keyLight.position.set(-3, 4, 4);
        this.scene.add(keyLight);
    }

    createPhoneModel() {
        this.phoneGroup = new THREE.Group();
        // Position slightly to the left side on desktop to balance the right-side form
        const isDesktop = window.innerWidth > 1080;
        this.phoneGroup.position.set(isDesktop ? -1.6 : 0, 0, 0);

        // Materials: Brushed dark titanium chassis & ceramic rear
        const titaniumMat = new THREE.MeshStandardMaterial({
            color: 0x18181f,
            metalness: 0.94,
            roughness: 0.24
        });

        const ceramicRearMat = new THREE.MeshStandardMaterial({
            color: 0x0c0b11,
            metalness: 0.45,
            roughness: 0.35
        });

        // Chassis Dimensions (sleek flagship aspect ratio: ~1.4w x 2.85h x 0.16d)
        const phoneW = 1.45;
        const phoneH = 2.95;
        const phoneD = 0.14;

        // Phone Body (rounded edges simulation)
        const chassisGeom = new THREE.BoxGeometry(phoneW, phoneH, phoneD);
        const chassisMesh = new THREE.Mesh(chassisGeom, titaniumMat);
        this.phoneGroup.add(chassisMesh);

        // Back Ceramic Plate
        const backGeom = new THREE.PlaneGeometry(phoneW - 0.04, phoneH - 0.04);
        const backMesh = new THREE.Mesh(backGeom, ceramicRearMat);
        backMesh.position.z = -phoneD / 2 - 0.002;
        backMesh.rotation.y = Math.PI;
        this.phoneGroup.add(backMesh);

        // Camera Bump Plateau
        const bumpGeom = new THREE.BoxGeometry(0.68, 0.72, 0.06);
        const bumpMesh = new THREE.Mesh(bumpGeom, titaniumMat);
        bumpMesh.position.set(-phoneW * 0.22, phoneH * 0.32, -phoneD / 2 - 0.03);
        this.phoneGroup.add(bumpMesh);

        // 3 Camera Lenses
        const lensGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 32);
        const lensMat = new THREE.MeshStandardMaterial({
            color: 0x050508,
            metalness: 0.95,
            roughness: 0.1
        });

        const lensPositions = [
            [-0.42, 1.08, -phoneD / 2 - 0.065],
            [-0.20, 1.08, -phoneD / 2 - 0.065],
            [-0.31, 0.84, -phoneD / 2 - 0.065]
        ];

        lensPositions.forEach(pos => {
            const lens = new THREE.Mesh(lensGeom, lensMat);
            lens.rotation.x = Math.PI / 2;
            lens.position.set(...pos);
            this.phoneGroup.add(lens);
        });

        // Dynamic Interactive Screen Plane
        this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
        this.screenTexture.minFilter = THREE.LinearFilter;
        this.screenTexture.magFilter = THREE.LinearFilter;

        const screenMat = new THREE.MeshBasicMaterial({
            map: this.screenTexture,
            transparent: false
        });

        const screenGeom = new THREE.PlaneGeometry(phoneW - 0.06, phoneH - 0.06);
        this.screenMesh = new THREE.Mesh(screenGeom, screenMat);
        this.screenMesh.position.z = phoneD / 2 + 0.002;
        this.phoneGroup.add(this.screenMesh);

        this.scene.add(this.phoneGroup);
    }

    createBrandTokens() {
        // High-gloss liquid chrome & matte graphite brand emblem tokens
        const tokenMat = new THREE.MeshStandardMaterial({
            color: 0x222228,
            metalness: 0.96,
            roughness: 0.15
        });

        const brandDefs = [
            { brand: 'apple', iconText: '', orbitAngle: 0, orbitRadius: 2.0, yOffset: 0.6 },
            { brand: 'samsung', iconText: 'S', orbitAngle: Math.PI * 0.5, orbitRadius: 2.0, yOffset: -0.3 },
            { brand: 'adapters', iconText: '⚡', orbitAngle: Math.PI, orbitRadius: 2.0, yOffset: 0.4 },
            { brand: 'powerbanks', iconText: '🔋', orbitAngle: Math.PI * 1.5, orbitRadius: 2.0, yOffset: -0.5 }
        ];

        brandDefs.forEach(def => {
            const tokenGroup = new THREE.Group();

            // Cylinder coin base
            const coinGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 32);
            const coinMesh = new THREE.Mesh(coinGeom, tokenMat.clone());
            coinMesh.rotation.x = Math.PI / 2;
            tokenGroup.add(coinMesh);

            // Canvas texture for emblem letter/icon
            const c = document.createElement('canvas');
            c.width = 256;
            c.height = 256;
            const ctx = c.getContext('2d');

            ctx.fillStyle = '#16161c';
            ctx.fillRect(0, 0, 256, 256);

            // High-contrast chrome icon typography
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 110px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(def.iconText, 128, 128);

            const iconTex = new THREE.CanvasTexture(c);
            const iconFaceGeom = new THREE.PlaneGeometry(0.55, 0.55);
            const iconFaceMat = new THREE.MeshBasicMaterial({ map: iconTex, transparent: true });

            const frontFace = new THREE.Mesh(iconFaceGeom, iconFaceMat);
            frontFace.position.z = 0.045;
            tokenGroup.add(frontFace);

            const backFace = new THREE.Mesh(iconFaceGeom, iconFaceMat);
            backFace.position.z = -0.045;
            backFace.rotation.y = Math.PI;
            tokenGroup.add(backFace);

            tokenGroup.userData = {
                brand: def.brand,
                orbitAngle: def.orbitAngle,
                orbitRadius: def.orbitRadius,
                yOffset: def.yOffset,
                baseScale: 1.0,
                targetScale: 1.0,
                coinMesh: coinMesh
            };

            this.phoneGroup.add(tokenGroup);
            this.brandTokens.push(tokenGroup);
        });
    }

    createTrustBadge() {
        // Rotating 3D holographic seal displaying PTA APPROVED
        const badgeGroup = new THREE.Group();
        badgeGroup.position.set(-2.5, -1.5, 0.6);

        const badgeGeom = new THREE.CylinderGeometry(0.48, 0.48, 0.04, 32);
        const badgeMat = new THREE.MeshStandardMaterial({
            color: 0x00F0FF,
            metalness: 0.9,
            roughness: 0.25,
            wireframe: true
        });

        this.trustBadgeMesh = new THREE.Mesh(badgeGeom, badgeMat);
        this.trustBadgeMesh.rotation.x = Math.PI * 0.35;
        badgeGroup.add(this.trustBadgeMesh);

        this.scene.add(badgeGroup);
    }

    playEntranceAnimation() {
        if (typeof gsap !== 'undefined') {
            // Camera smoothly glides forward from 7.5 to 4.5
            gsap.to(this.camera.position, {
                z: 4.5,
                duration: 1.8,
                ease: 'power3.out'
            });

            // Phone chassis rotates toward user on entrance
            this.phoneGroup.rotation.y = -Math.PI * 0.4;
            this.phoneGroup.rotation.x = 0.2;
            gsap.to(this.phoneGroup.rotation, {
                y: 0.15,
                x: 0.05,
                duration: 2.0,
                ease: 'power3.out'
            });
        }
    }

    /**
     * Renders live interactive UI directly onto the 3D phone's glass screen
     */
    updateScreenTexture() {
        const ctx = this.screenCtx;
        const w = this.screenCanvas.width;
        const h = this.screenCanvas.height;

        // Background
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, w, h);

        // Subtle gradient background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#150a24');
        bgGrad.addColorStop(0.4, '#09090e');
        bgGrad.addColorStop(1, '#050508');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Status Bar
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px "Space Grotesk", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('TACTILE DIRECT', 36, 55);

        ctx.textAlign = 'right';
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
        ctx.fillText(`${timeStr} PKT`, w - 36, 55);

        // Status Pill: DIRECT DESK ONLINE
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fillRect(36, 85, w - 72, 50);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.strokeRect(36, 85, w - 72, 50);

        // Green pulsing indicator circle
        ctx.beginPath();
        ctx.arc(65, 110, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.fill();

        ctx.fillStyle = '#A7F3D0';
        ctx.font = 'bold 20px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('DIRECT DESK ONLINE // READY', 90, 117);

        // Live Message Thread Preview
        const cardY = 175;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(36, cardY, w - 72, 880);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.strokeRect(36, cardY, w - 72, 880);

        // Header inside message thread
        ctx.fillStyle = '#00F0FF';
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.fillText('INQUIRY SPECIFICATION SHEET', 60, cardY + 50);

        // Horizontal hairline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(60, cardY + 75);
        ctx.lineTo(w - 60, cardY + 75);
        ctx.stroke();

        let curY = cardY + 125;

        const drawField = (label, val, highlight = false) => {
            ctx.fillStyle = '#71717A';
            ctx.font = '18px "JetBrains Mono", monospace';
            ctx.fillText(label, 60, curY);

            ctx.fillStyle = highlight ? '#00F0FF' : '#FFFFFF';
            ctx.font = 'bold 24px "Space Grotesk", sans-serif';
            ctx.fillText(val || '[ Awaiting Input... ]', 60, curY + 36);
            curY += 95;
        };

        drawField('TARGET HARDWARE:', this.formData.model, true);
        drawField('DISPATCH INQUIRY TYPE:', `[ ${this.formData.type.toUpperCase()} ]`);
        drawField('CLIENT NAME:', this.formData.name || 'ANONYMOUS VIP');
        drawField('WHATSAPP COMM-LINK:', this.formData.phone || '+92 3XX XXXXXXX');

        // Message preview block
        ctx.fillStyle = '#71717A';
        ctx.font = '18px "JetBrains Mono", monospace';
        ctx.fillText('CLIENT SPECIFICATIONS & NOTES:', 60, curY);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(60, curY + 15, w - 120, 240);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeRect(60, curY + 15, w - 120, 240);

        ctx.fillStyle = this.formData.msg ? '#F5F5F7' : '#52525B';
        ctx.font = '20px "Inter", sans-serif';
        const msgText = this.formData.msg || 'Awaiting custom specifications or box pack PTA requirements...';
        
        // Wrap text
        const words = msgText.split(' ');
        let line = '';
        let textY = curY + 55;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > (w - 160) && n > 0) {
                ctx.fillText(line, 80, textY);
                line = words[n] + ' ';
                textY += 32;
                if (textY > curY + 230) break;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 80, textY);

        // Bottom security badge
        ctx.fillStyle = '#10B981';
        ctx.font = '16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✦ 100% PTA APPROVED OFFICIAL STOCK • ZERO FRAUD POLICY', w * 0.5, h - 55);

        if (this.screenTexture) {
            this.screenTexture.needsUpdate = true;
        }
    }

    setDynamicLighting(focused) {
        if (typeof gsap !== 'undefined' && this.pointLight) {
            gsap.to(this.pointLight, {
                intensity: focused ? 2.8 : 1.4,
                duration: 0.45,
                ease: 'power2.out'
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);

            const isDesktop = width > 1080;
            if (this.phoneGroup) {
                this.phoneGroup.position.x = isDesktop ? -1.6 : 0;
            }
        });

        // Mouse Parallax & Raycasting Coordinates
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;

            this.mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Click on 3D brand tokens via Raycaster
        this.canvas.addEventListener('click', () => {
            if (this.hoveredToken) {
                const brand = this.hoveredToken.userData.brand;
                if (window.tactileAudio) {
                    window.tactileAudio.playGlassTick(3200);
                }
                window.dispatchEvent(new CustomEvent('brand:selected', { detail: { brand } }));
            }
        });
    }

    render(time) {
        const t = time * 0.001;

        // Pointer Parallax Lerp
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

        // Phone gentle floating & tilt toward user cursor
        if (this.phoneGroup) {
            this.phoneGroup.position.y = Math.sin(t * 1.2) * 0.08;
            this.phoneGroup.rotation.y = 0.15 + (this.mouse.x * 0.28);
            this.phoneGroup.rotation.x = 0.05 + (-this.mouse.y * 0.22);
        }

        // Orbit Floating 3D Brand Tokens around Phone with Spring Physics
        this.brandTokens.forEach(token => {
            const data = token.userData;
            const angle = data.orbitAngle + t * 0.45;
            token.position.x = Math.cos(angle) * data.orbitRadius;
            token.position.z = Math.sin(angle) * data.orbitRadius;
            token.position.y = data.yOffset + Math.sin(t * 1.8 + data.orbitAngle) * 0.12;

            // Token self rotation
            token.rotation.y = t * 1.5;

            // Smooth scale interpolation on hover
            data.baseScale += (data.targetScale - data.baseScale) * 0.12;
            token.scale.setScalar(data.baseScale);
        });

        // Rotate Holographic Trust Badge
        if (this.trustBadgeMesh) {
            this.trustBadgeMesh.rotation.z = t * 0.6;
        }

        // Raycasting for 3D Brand Tokens
        this.raycaster.setFromCamera(this.mouseVector, this.camera);
        const tokenMeshes = this.brandTokens.map(g => g.userData.coinMesh);
        const intersects = this.raycaster.intersectObjects(tokenMeshes, false);

        if (intersects.length > 0) {
            const hitGroup = intersects[0].object.parent;
            if (this.hoveredToken !== hitGroup) {
                if (this.hoveredToken) {
                    this.hoveredToken.userData.targetScale = 1.0;
                }
                this.hoveredToken = hitGroup;
                this.hoveredToken.userData.targetScale = 1.35;
                this.canvas.style.cursor = 'pointer';

                if (window.tactileAudio) {
                    window.tactileAudio.playGlassTick(3200);
                }
            }
        } else {
            if (this.hoveredToken) {
                this.hoveredToken.userData.targetScale = 1.0;
                this.hoveredToken = null;
                this.canvas.style.cursor = 'default';
            }
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render);
    }
}

window.Contact3DScene = Contact3DScene;

