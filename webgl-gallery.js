/**
 * Tactile Studio® — WebGL 3D Plane Distortion Gallery
 * 
 * Powered by Three.js & Custom GLSL Shaders:
 * - 3D Mesh Planes with high-subdivision geometry (32x32)
 * - Custom Vertex Shader: Physical Z-axis rippling, bending, and inertial arching reacting to scroll velocity
 * - Custom Fragment Shader: Dynamic Chromatic Aberration (RGB shift) and cursor liquid lens distortion
 * - Hover Z-depth expansion toward the camera with smooth damping
 * - Dual Interaction Modes: Vertical Virtual Scroll & Horizontal "Drag to explore our world" momentum
 * - Raycaster interaction for hover and modal expansion
 */

class WebGLGallery {
    constructor(containerId = 'webgl-canvas-container') {
        this.container = document.getElementById(containerId);
        this.canvas = document.getElementById('webgl-canvas');
        if (!this.canvas) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Meshes pool
        this.meshItems = [];
        this.activeFilter = 'all';
        this.viewMode = 'vertical'; // 'vertical' or 'horizontal'

        // Scroll & Drag Physics
        this.scroll = {
            current: 0,
            target: 0,
            last: 0,
            velocity: 0,
            ease: 0.085
        };

        this.drag = {
            isDown: false,
            startX: 0,
            lastX: 0,
            distX: 0,
            momentum: 0
        };

        this.mouse = {
            x: 0,
            y: 0,
            normX: 0,
            normY: 0,
            targetX: 0,
            targetY: 0
        };

        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2(-999, -999);
        this.hoveredMesh = null;

        this.clock = new THREE.Clock();
        this.isCompiled = false;

        this.init();
    }

    init() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1. Scene
        this.scene = new THREE.Scene();

        // 2. Camera: Perspective matching 1:1 pixel coords at z = 600
        const fov = 2 * Math.atan((height / 2) / 600) * (180 / Math.PI);
        this.camera = new THREE.PerspectiveCamera(fov, width / height, 1, 2000);
        this.camera.position.z = 600;

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        // 4. Create Project 3D Planes
        this.createProjectMeshes();

        // 5. Event Listeners
        this.bindEvents();

        // 6. Shader Compilation check
        this.isCompiled = true;
        window.dispatchEvent(new CustomEvent('webgl:ready'));

        // 7. Start Render Loop
        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    /**
     * Procedural Texture Generator for ultra-sharp visuals & fast loading
     */
    createProjectTexture(project) {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 1280;
        const ctx = c.getContext('2d');

        // Dark slate brutalist gradient
        const bgGrad = ctx.createLinearGradient(0, 0, c.width, c.height);
        bgGrad.addColorStop(0, project.bgPrimary || '#121318');
        bgGrad.addColorStop(1, project.bgSecondary || '#060709');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, c.width, c.height);

        // Abstract 3D graphic geometry & typography
        ctx.save();
        
        // Geometric accented glow
        const glow = ctx.createRadialGradient(
            c.width * (project.glowX || 0.5),
            c.height * (project.glowY || 0.4),
            40,
            c.width * (project.glowX || 0.5),
            c.height * (project.glowY || 0.4),
            500
        );
        glow.addColorStop(0, project.accentColor || 'rgba(0, 240, 255, 0.45)');
        glow.addColorStop(0.5, 'rgba(100, 120, 255, 0.15)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, c.width, c.height);

        // Architectural geometric rings / brutalist grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc(c.width * 0.5, c.height * 0.45, 120 + i * 55, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Crosshairs & micro-metadata
        ctx.font = '24px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillText(`TACTILE® // ${project.id.toUpperCase()}`, 60, 90);
        ctx.fillText(`EXP: ${project.year || '2026'}`, c.width - 240, 90);

        // Center Monolithic Typography
        ctx.font = '900 78px "Syne", -apple-system, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(project.shortTitle || project.title, 60, c.height - 180);

        // Category Tag
        ctx.font = '500 28px "JetBrains Mono", monospace';
        ctx.fillStyle = project.accentColor || '#00F0FF';
        ctx.fillText(`[ ${project.category.toUpperCase()} ]`, 60, c.height - 120);

        // Spec details
        ctx.font = '22px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(`DELIVERABLE // ${project.deliverable || '3D WEBGL MOTION'}`, 60, c.height - 70);

        ctx.restore();

        const texture = new THREE.CanvasTexture(c);
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        // If high-res photo URL is present, asynchronously load and merge
        if (project.img) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                ctx.drawImage(img, 0, 0, c.width, c.height);
                
                // Re-apply vignette and text overlay
                const overlayGrad = ctx.createLinearGradient(0, c.height * 0.4, 0, c.height);
                overlayGrad.addColorStop(0, 'rgba(5, 7, 10, 0.2)');
                overlayGrad.addColorStop(1, 'rgba(5, 7, 10, 0.95)');
                ctx.fillStyle = overlayGrad;
                ctx.fillRect(0, 0, c.width, c.height);

                ctx.font = '24px "JetBrains Mono", monospace';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillText(`TACTILE® // ${project.id.toUpperCase()}`, 60, 90);

                ctx.font = '900 76px "Syne", sans-serif';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(project.shortTitle || project.title, 60, c.height - 180);

                ctx.font = '500 28px "JetBrains Mono", monospace';
                ctx.fillStyle = project.accentColor || '#00F0FF';
                ctx.fillText(`[ ${project.category.toUpperCase()} ]`, 60, c.height - 120);

                texture.needsUpdate = true;
            };
            img.src = project.img;
        }

        return texture;
    }

    createProjectMeshes() {
        const projects = window.TACTILE_PROJECTS || [];
        const geometry = new THREE.PlaneGeometry(380, 480, 32, 32);

        // Vertex Shader: Physical Z-bending, ripple wave, and hover elevation
        const vertexShader = `
            uniform float uTime;
            uniform float uScrollVelocity;
            uniform float uHover;
            uniform vec2 uMouse;
            varying vec2 vUv;
            varying float vWave;

            void main() {
                vUv = uv;

                vec3 pos = position;

                // 1. Inertial curvature along Z reacting to scroll velocity
                float wave = sin(pos.x * 0.015 + uTime * 2.5) * cos(pos.y * 0.012) * (uScrollVelocity * 0.055);
                
                // 2. Parabolic plane bending (edges bend backwards like flexible sheet)
                float bend = - (pos.x * pos.x * 0.00045) * abs(uScrollVelocity * 0.04);

                // 3. Hover elevation toward camera (+35 units)
                float hoverDepth = uHover * 40.0;

                pos.z += wave + bend + hoverDepth;
                vWave = wave;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;

        // Fragment Shader: Chromatic Aberration & Liquid Lens Cursor Distortion
        const fragmentShader = `
            uniform sampler2D uTexture;
            uniform float uTime;
            uniform float uScrollVelocity;
            uniform float uHover;
            uniform vec2 uMouseUV;
            varying vec2 vUv;
            varying float vWave;

            void main() {
                vec2 uv = vUv;

                // 1. Liquid lens distortion near mouse
                float distToMouse = distance(uv, uMouseUV);
                float lensEffect = smoothstep(0.42, 0.0, distToMouse) * uHover * 0.045;
                vec2 lensDir = normalize(uv - uMouseUV + 0.0001);
                uv += lensDir * lensEffect;

                // 2. Chromatic aberration RGB split proportional to velocity & hover
                float aberrationStrength = abs(uScrollVelocity) * 0.00085 + (uHover * 0.006);
                vec2 redOffset = vec2(aberrationStrength * 1.4, 0.0);
                vec2 blueOffset = vec2(-aberrationStrength * 1.4, 0.0);

                float r = texture2D(uTexture, uv + redOffset).r;
                float g = texture2D(uTexture, uv).g;
                float b = texture2D(uTexture, uv + blueOffset).b;

                // 3. Subtle contrast and film exposure
                vec3 color = vec3(r, g, b);
                
                // Subtle chrome metallic sheen on hover
                float sheen = smoothstep(0.7, 1.0, sin((uv.x + uv.y) * 4.0 + uTime * 2.0)) * uHover * 0.12;
                color += vec3(sheen);

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        projects.forEach((proj, index) => {
            const texture = this.createProjectTexture(proj);

            const uniforms = {
                uTexture: { value: texture },
                uTime: { value: 0 },
                uScrollVelocity: { value: 0 },
                uHover: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uMouseUV: { value: new THREE.Vector2(0.5, 0.5) }
            };

            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms,
                transparent: true,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData = {
                id: proj.id,
                category: proj.category.toLowerCase(),
                project: proj,
                index: index,
                targetHover: 0,
                currentHover: 0,
                baseX: 0,
                baseY: 0,
                baseZ: 0
            };

            this.scene.add(mesh);
            this.meshItems.push(mesh);
        });

        this.updateMeshPositions();
    }

    /**
     * Compute 3D Positions for Vertical Grid Mode vs Horizontal Drag Canvas Mode
     */
    updateMeshPositions() {
        const width = window.innerWidth;
        const visibleMeshes = this.meshItems.filter(m => {
            if (this.activeFilter === 'all') return true;
            const cat = m.userData.project.category.toLowerCase();
            return cat.includes(this.activeFilter);
        });

        // Hide filtered out meshes
        this.meshItems.forEach(m => {
            const isVisible = (this.activeFilter === 'all') || m.userData.project.category.toLowerCase().includes(this.activeFilter);
            m.visible = isVisible;
        });

        if (this.viewMode === 'vertical') {
            // 2-Column or 3-Column editorial grid
            const cols = width > 1100 ? 2 : 1;
            const xSpacing = width > 1100 ? 460 : 0;
            const ySpacing = 580;

            visibleMeshes.forEach((mesh, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);

                const x = cols === 1 ? 0 : (col === 0 ? -xSpacing / 2 : xSpacing / 2);
                const y = - (row * ySpacing) + 200;

                mesh.userData.baseX = x;
                mesh.userData.baseY = y;
                mesh.userData.baseZ = 0;
            });
        } else {
            // Horizontal "Drag to explore our world" momentum runway
            const spacing = 460;
            const startX = - ((visibleMeshes.length - 1) * spacing) / 2;

            visibleMeshes.forEach((mesh, i) => {
                const x = startX + (i * spacing);
                // Gentle sinusoidal wave height for spatial intrigue
                const y = Math.sin(i * 0.8) * 60;
                const z = Math.cos(i * 0.8) * 80;

                mesh.userData.baseX = x;
                mesh.userData.baseY = y;
                mesh.userData.baseZ = z;
            });
        }
    }

    setFilter(category) {
        this.activeFilter = category.toLowerCase();
        this.updateMeshPositions();
    }

    setViewMode(mode) {
        this.viewMode = mode;
        this.scroll.current = 0;
        this.scroll.target = 0;
        this.updateMeshPositions();
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.fov = 2 * Math.atan((height / 2) / 600) * (180 / Math.PI);
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
            this.updateMeshPositions();
        });

        // Scroll listener for vertical momentum
        window.addEventListener('scroll', () => {
            if (this.viewMode === 'vertical') {
                const currentY = window.pageYOffset || document.documentElement.scrollTop;
                this.scroll.target = currentY;
            }
        }, { passive: true });

        // Pointer move for Raycasting & Shader liquid lens
        window.addEventListener('mousemove', (e) => {
            this.mouse.normX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.normY = -(e.clientY / window.innerHeight) * 2 + 1;
            this.mouseVector.x = this.mouse.normX;
            this.mouseVector.y = this.mouse.normY;

            // Check raycaster intersection
            this.raycaster.setFromCamera(this.mouseVector, this.camera);
            const intersects = this.raycaster.intersectObjects(this.meshItems.filter(m => m.visible));

            if (intersects.length > 0) {
                const hit = intersects[0];
                const mesh = hit.object;

                if (this.hoveredMesh !== mesh) {
                    if (this.hoveredMesh) {
                        this.hoveredMesh.userData.targetHover = 0;
                    }
                    this.hoveredMesh = mesh;
                    mesh.userData.targetHover = 1.0;

                    // Play tactile glass tick
                    if (window.tactileAudio) {
                        window.tactileAudio.playGlassTick(2900);
                    }
                    document.body.classList.add('hovering');
                }

                if (hit.uv) {
                    mesh.material.uniforms.uMouseUV.value.set(hit.uv.x, hit.uv.y);
                }
            } else {
                if (this.hoveredMesh) {
                    this.hoveredMesh.userData.targetHover = 0;
                    this.hoveredMesh = null;
                    document.body.classList.remove('hovering');
                }
            }
        });

        // Click on 3D Plane to open project modal
        this.canvas.addEventListener('click', (e) => {
            this.raycaster.setFromCamera(this.mouseVector, this.camera);
            const intersects = this.raycaster.intersectObjects(this.meshItems.filter(m => m.visible));
            if (intersects.length > 0) {
                const proj = intersects[0].object.userData.project;
                if (proj && window.openProjectModal) {
                    window.openProjectModal(proj.id);
                    if (window.tactileAudio) {
                        window.tactileAudio.playActionTick();
                    }
                }
            }
        });

        // Mouse Drag Interaction for Horizontal Mode
        const onDown = (e) => {
            this.drag.isDown = true;
            this.drag.startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            this.drag.lastX = this.drag.startX;
        };

        const onMove = (e) => {
            if (!this.drag.isDown) return;
            const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const deltaX = clientX - this.drag.lastX;
            this.drag.lastX = clientX;

            if (this.viewMode === 'horizontal') {
                this.scroll.target -= deltaX * 1.8;
            }
        };

        const onUp = () => {
            this.drag.isDown = false;
        };

        this.canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        this.canvas.addEventListener('touchstart', onDown, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp);
    }

    render() {
        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // Smooth virtual scroll lerp
        this.scroll.current += (this.scroll.target - this.scroll.current) * this.scroll.ease;
        this.scroll.velocity = this.scroll.target - this.scroll.current;

        // Modulate audio engine with scroll / drag velocity!
        if (window.tactileAudio) {
            window.tactileAudio.modulateWithVelocity(this.scroll.velocity);
        }

        // Clamp horizontal boundaries
        if (this.viewMode === 'horizontal') {
            const maxScroll = Math.max(0, (this.meshItems.filter(m => m.visible).length - 1) * 230);
            this.scroll.target = Math.max(-maxScroll, Math.min(maxScroll, this.scroll.target));
        }

        // Update each project mesh
        this.meshItems.forEach(mesh => {
            if (!mesh.visible) return;

            // Hover lerp damping
            mesh.userData.currentHover += (mesh.userData.targetHover - mesh.userData.currentHover) * 0.12;

            // Uniforms
            mesh.material.uniforms.uTime.value = elapsedTime;
            mesh.material.uniforms.uScrollVelocity.value = this.scroll.velocity;
            mesh.material.uniforms.uHover.value = mesh.userData.currentHover;

            // Position mapping
            if (this.viewMode === 'vertical') {
                // Sync with page scroll
                const galleryContainer = document.getElementById('projects-section');
                const containerRect = galleryContainer ? galleryContainer.getBoundingClientRect() : { top: 0 };
                const scrollOffset = -containerRect.top + 300;

                mesh.position.x = mesh.userData.baseX;
                mesh.position.y = mesh.userData.baseY + (scrollOffset * 0.85);
                mesh.position.z = mesh.userData.baseZ + (mesh.userData.currentHover * 30);

                // Gentle tilt with mouse inertia
                mesh.rotation.y = (this.mouse.normX * 0.12) + (mesh.userData.currentHover * 0.05);
                mesh.rotation.x = (-this.mouse.normY * 0.12) + (this.scroll.velocity * 0.003);
            } else {
                // Horizontal momentum
                mesh.position.x = mesh.userData.baseX - this.scroll.current;
                mesh.position.y = mesh.userData.baseY;
                mesh.position.z = mesh.userData.baseZ + (mesh.userData.currentHover * 35);

                // Inertial dynamic rotation
                mesh.rotation.y = (-this.scroll.velocity * 0.004) + (this.mouse.normX * 0.1);
                mesh.rotation.x = -this.mouse.normY * 0.08;
            }
        });

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render);
    }
}

window.WebGLGallery = WebGLGallery;

