/**
 * Tactile Studio® — 3D Spatial Phone Showcase Engine
 * 
 * Features:
 * - Exact product images maintained 100% in their pristine high-resolution quality
 * - Realtime 3D spatial asset physics: 360° interactive drag-to-rotate, auto-orbiting floating levitation
 * - Ambient blurred glow backdrop + dynamic color-matched radial aura (identical to Accessory showcase)
 * - Dynamic specular holographic sheen tracking 3D lighting angles
 * - Synchronized color swatch dots: dynamic image, glow, label, and transparent flood-fill
 * - Zero-radius razor-sharp corners (rounded-none)
 * - Single-row continuous horizontal carousel with smooth virtual scroll & drag momentum
 * - Interactive HUD badge: "INTERACTIVE 3D · DRAG TO ROTATE"
 */

class ProjectsGallery {
    constructor() {
        this.section = document.getElementById('merci-projects-section');
        this.track = document.getElementById('projects-slider-track');
        this.scrubberFill = document.getElementById('scrubber-progress-fill');
        this.scrubberBar = document.getElementById('scrubber-bar-container');
        if (!this.track) return;

        // Project / Product Data Array
        this.projects = [
            {
                id: "product-1",
                title: "18 PRO MAX",
                client: "18 PRO MAX",
                subtitle: "Burgundy",
                specs: "256 GB , PTA APPROVED , BOX PACK",
                description: "256 GB , PTA APPROVED , BOX PACK",
                category: "SMARTPHONE",
                date: "10/2026",
                imageSrc: "assets/products/apple-iphone18-pro-max-1.png",
                colors: [
                    { name: "Burgundy", hex: "#5C1D2A", image: "assets/products/apple-iphone18-pro-max-1.png" },
                    { name: "Deep Blue", hex: "#223549", image: "assets/products/apple-18-pro-max-blue.png" },
                    { name: "Space Black", hex: "#1A1B20", image: "assets/products/apple-18-pro-max-black.webp" },
                    { name: "Silver White", hex: "#E2E4E9", image: "assets/products/apple-18-pro-max-silver.png" }
                ]
            },
            {
                id: "product-2",
                title: "17 PRO MAX",
                client: "17 PRO MAX",
                subtitle: "Cosmic Orange",
                specs: "256/512 GB & PTA/NON Available",
                description: "256/512 GB & PTA/NON Available",
                category: "SMARTPHONE",
                date: "10/2026",
                imageSrc: "assets/products/apple-17-pro-max-orange.png",
                colors: [
                    { name: "Cosmic Orange", hex: "#E06D2D", image: "assets/products/apple-17-pro-max-orange.png" },
                    { name: "Silver White", hex: "#E2E4E9", image: "assets/products/apple-17-pro-max-silver-new.png" },
                    { name: "Deep Blue", hex: "#2A3545", image: "assets/products/apple-17-pro-max-blue.png" }
                ]
            },
            {
                id: "product-3",
                title: "16 PRO MAX",
                client: "16 PRO MAX",
                subtitle: "Desert Titanium",
                specs: "256 GB Natural Titanium , 512 Black Titanium PTA Approved box pack",
                description: "256 GB Natural Titanium , 512 Black Titanium PTA Approved box pack",
                category: "SMARTPHONE",
                date: "10/2026",
                imageSrc: "assets/products/apple-16-pro-max-desert.png",
                colors: [
                    { name: "Desert Titanium", hex: "#C5A58A", image: "assets/products/apple-16-pro-max-desert.png" },
                    { name: "White Titanium", hex: "#E3E4E8", image: "assets/products/apple-16-pro-max-white.png" },
                    { name: "Black Titanium", hex: "#3C3B37", image: "assets/products/apple-16-pro-max-black.webp" }
                ]
            },
            {
                id: "product-4",
                title: "15 PRO MAX",
                client: "15 PRO MAX",
                subtitle: "Natural Titanium",
                specs: "512/256/128 GB , Battery Health 90/88/84 , NON- PTA",
                description: "512/256/128 GB , Battery Health 90/88/84 , NON- PTA",
                category: "SMARTPHONE",
                date: "10/2026",
                imageSrc: "assets/products/apple-15-pro-max-natural.png",
                colors: [
                    { name: "Natural Titanium", hex: "#9E988E", image: "assets/products/apple-15-pro-max-natural.png" },
                    { name: "Blue Titanium", hex: "#3B4454", image: "assets/products/apple-15-pro-max-blue.png" },
                    { name: "White Titanium", hex: "#E3E4E8", image: "assets/products/apple-15-pro-max-white.png" },
                    { name: "Black Titanium", hex: "#3D3C40", image: "assets/products/15-pro-max-black-titanium.webp" }
                ]
            },
            {
                id: "product-5",
                title: "S25 Ultra",
                client: "S25 Ultra",
                subtitle: "Titanium Gray",
                specs: "256 GB PTA Approved",
                description: "256 GB PTA Approved",
                category: "SMARTPHONE",
                date: "10/2026",
                imageSrc: "assets/products/s25-ultra-gray.webp",
                colors: [
                    { name: "Titanium Gray", hex: "#C5C3BC", image: "assets/products/s25-ultra-gray.webp" },
                    { name: "Titanium Black", hex: "#37383A", image: "assets/products/s25-ultra-black.webp" },
                    { name: "Titanium Silverblue", hex: "#C1C7D6", image: "assets/products/s25-ultra-silverblue.png" }
                ]
            },
            {
                id: "product-6",
                title: "S24 Ultra",
                client: "S24 Ultra",
                subtitle: "Titanium Gray",
                specs: "512 GB NON-PTA",
                description: "512 GB NON-PTA",
                category: "SMARTPHONE",
                date: "10/2026",
                imageSrc: "assets/products/s24-ultra-gray.webp",
                colors: [
                    { name: "Titanium Gray", hex: "#88847E", image: "assets/products/s24-ultra-gray.webp" },
                    { name: "Titanium Violet", hex: "#4C4656", image: "assets/products/s24-ultra-violet.png" },
                    { name: "Titanium Blue", hex: "#C8D2DC", image: "assets/products/s24-ultra-blue.png" },
                    { name: "Titanium Yellow", hex: "#E4D8A5", image: "assets/products/s24-ultra-yellow.png" }
                ]
            }
        ];

        this.phoneAssets = new Map();
        this.activeFilter = 'ALL';
        this.currentTranslateX = 0;
        this.targetTranslateX = 0;
        this.maxScroll = 0;

        // Slider Drag Physics
        this.drag = {
            isDown: false,
            startX: 0,
            lastX: 0,
            velocity: 0
        };

        this.init();
    }

    init() {
        this.renderCards();
        this.computeDimensions();
        this.bindEvents();

        this.isVisible = true;
        this.rafId = null;
        this.animate = this.animate.bind(this);

        if (typeof IntersectionObserver !== 'undefined' && this.section) {
            const galleryObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    this.isVisible = entry.isIntersecting;
                    if (this.isVisible && !this.rafId) {
                        this.rafId = requestAnimationFrame(this.animate);
                    }
                });
            }, { rootMargin: '150px 0px 150px 0px', threshold: 0.01 });
            galleryObserver.observe(this.section);
        } else {
            this.rafId = requestAnimationFrame(this.animate);
        }
    }

    renderCards() {
        this.track.innerHTML = '';
        this.phoneAssets.clear();

        const filtered = this.projects.filter(p => {
            if (this.activeFilter === 'ALL') return true;
            return p.category.toUpperCase() === this.activeFilter.toUpperCase();
        });

        filtered.forEach((p, idx) => {
            const card = document.createElement('div');
            card.className = 'merci-card rounded-none';
            card.dataset.id = p.id;

            const colorSelectorHtml = p.colors && p.colors.length > 0
                ? `
                    <div class="merci-color-selector">
                        <div class="color-dots-row">
                            ${p.colors.map((c, cIdx) => `
                                <button type="button" 
                                        class="color-swatch-dot ${cIdx === 0 ? 'active' : ''}" 
                                        data-color-index="${cIdx}" 
                                        data-color-name="${c.name}"
                                        data-color-hex="${c.hex}"
                                        data-image="${c.image}" 
                                        style="background-color: ${c.hex};" 
                                        title="${c.name}">
                                </button>
                            `).join('')}
                        </div>
                        <span class="color-name-label">${p.colors[0].name}</span>
                    </div>
                `
                : `<p class="merci-subtitle font-serif italic text-neutral-300 text-sm md:text-base">${p.subtitle}</p>`;

            card.innerHTML = `
                <!-- 1. 3D Spatial Thumbnail Container (with Image, Ambient Blur & 3D Glare) -->
                <div class="merci-thumb-wrap phone-thumb-wrap rounded-none overflow-hidden" data-id="${p.id}">
                    <!-- Ambient Blurred Glow Backdrop -->
                    <img src="${p.imageSrc}" 
                         alt="" 
                         aria-hidden="true" 
                         class="merci-thumb-bg-blur" 
                         loading="lazy" />

                    <!-- Ambient Radial Glow Backdrop matching phone color (Same as accessory showcase) -->
                    <div class="accessory-ambient-glow phone-ambient-glow" style="background: radial-gradient(circle at center, ${p.colors[0].hex}66 0%, transparent 70%);"></div>
                    
                    <!-- 3D Interactive Asset Stage -->
                    <div class="phone-3d-stage">
                        <!-- 3D Specular Holographic Glare Layer -->
                        <div class="card-3d-glare"></div>

                        <!-- Crystal-Clear Product Image in 3D Space -->
                        <img src="${p.imageSrc}" 
                             alt="${p.title || p.client}" 
                             class="merci-thumb-img object-contain rounded-none" 
                             loading="lazy"
                             draggable="false"
                             onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80';" />
                    </div>

                    <!-- Radial Vignette Tint Overlay -->
                    <div class="thumb-tint-overlay"></div>

                    <!-- 3D Interactive HUD Badge (Identical to Accessory Showcase) -->
                    <div class="accessory-3d-hud-badge">
                        <span class="dot-live-3d"></span>
                        <span>INTERACTIVE 3D · DRAG TO ROTATE</span>
                    </div>
                </div>

                <!-- 2. Project Titles (Immediately below image) -->
                <div class="merci-meta-wrap">
                    <h3 class="merci-client-name font-sans font-bold uppercase tracking-wider text-white text-base md:text-lg">${p.title || p.client}</h3>
                    ${colorSelectorHtml}
                    <div class="merci-hairline w-8 h-[1px] bg-white/20 mt-2"></div>

                    <!-- 3. Hover Disclosure Panel -->
                    <div class="merci-hover-disclosure">
                        <div class="pt-3 font-mono text-[11px] md:text-xs text-neutral-400 uppercase tracking-widest leading-relaxed">
                            <p>${p.specs || p.description}</p>
                        </div>
                        <div class="pt-2 font-mono text-[10px] text-neutral-500 uppercase tracking-wider flex gap-4">
                            <span class="tag-cat">[ ${p.category} ]</span>
                            <span class="tag-interactive">3D ASSET READY</span>
                        </div>
                    </div>
                </div>
            `;

            this.track.appendChild(card);

            const wrapEl = card.querySelector('.phone-thumb-wrap');
            const stageEl = card.querySelector('.phone-3d-stage');
            const imgEl = card.querySelector('.merci-thumb-img');
            const bgBlurImg = card.querySelector('.merci-thumb-bg-blur');
            const glowEl = card.querySelector('.phone-ambient-glow');
            const glareEl = card.querySelector('.card-3d-glare');
            const colorLabelEl = card.querySelector('.color-name-label');

            // Register 3D Asset
            const assetData = {
                id: p.id,
                card,
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
                    orbitPhase: idx * 1.05
                }
            };
            this.phoneAssets.set(p.id, assetData);
            this.bind3DAssetInteraction(assetData);

            // Remove white background dynamically so the blurred glow shines through
            if (imgEl) {
                this.makeBackgroundTransparent(imgEl);
            }

            // Interactive Color Dots Switcher
            const dots = card.querySelectorAll('.color-swatch-dot');
            dots.forEach(dot => {
                ['mousedown', 'touchstart', 'click'].forEach(evtType => {
                    dot.addEventListener(evtType, (e) => e.stopPropagation());
                });

                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dots.forEach(d => d.classList.remove('active'));
                    dot.classList.add('active');

                    const newSrc = dot.dataset.image;
                    const colorName = dot.dataset.colorName;
                    const colorHex = dot.dataset.colorHex;

                    if (imgEl && newSrc) {
                        imgEl.style.opacity = '0.3';
                        if (bgBlurImg) bgBlurImg.style.opacity = '0.3';
                        setTimeout(() => {
                            delete imgEl.dataset.bgProcessed;
                            imgEl.src = newSrc;
                            imgEl.style.opacity = '1';
                            this.makeBackgroundTransparent(imgEl);
                            if (bgBlurImg) {
                                bgBlurImg.src = newSrc;
                                bgBlurImg.style.opacity = '0.9';
                            }
                        }, 120);
                    }

                    if (glowEl && colorHex) {
                        glowEl.style.background = `radial-gradient(circle at center, ${colorHex}66 0%, transparent 70%)`;
                    }

                    if (colorLabelEl && colorName) {
                        colorLabelEl.textContent = colorName;
                    }

                    if (window.tactileAudio) {
                        window.tactileAudio.playGlassTick(3200);
                    }
                });
            });

            card.addEventListener('mouseenter', () => {
                if (window.tactileAudio) {
                    window.tactileAudio.playGlassTick(2900);
                }
            });
        });

        this.computeDimensions();
    }

    bind3DAssetInteraction(asset) {
        const { wrap, stage, interaction } = asset;
        if (!wrap || !stage) return;

        const onPointerDown = (e) => {
            if (e.target.closest('.color-swatch-dot')) return;
            interaction.isDown = true;
            interaction.startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            interaction.startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
            wrap.classList.add('is-dragging-phone');
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
                // Parallax tilt on hover
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
                wrap.classList.remove('is-dragging-phone');
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

    makeBackgroundTransparent(imgEl) {
        if (!imgEl || imgEl.dataset.bgProcessed) return;

        const process = () => {
            if (imgEl.dataset.bgProcessed) return;
            try {
                const w = imgEl.naturalWidth;
                const h = imgEl.naturalHeight;
                if (!w || !h) return;

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(imgEl, 0, 0);

                const imgData = ctx.getImageData(0, 0, w, h);
                const d = imgData.data;

                // Test if perimeter has near-white or light gray background
                const isLight = (r, g, b) => (r > 215 && g > 215 && b > 215);
                if (!isLight(d[0], d[1], d[2]) && !isLight(d[(w - 1) * 4], d[(w - 1) * 4 + 1], d[(w - 1) * 4 + 2])) {
                    return;
                }

                // Flood fill BFS from all perimeter pixels
                const visited = new Uint8Array(w * h);
                const queue = [];
                let qHead = 0;

                const tryEnqueue = (x, y) => {
                    const idx = y * w + x;
                    if (!visited[idx]) {
                        const p = idx * 4;
                        if (isLight(d[p], d[p + 1], d[p + 2])) {
                            visited[idx] = 1;
                            queue.push(x, y);
                        }
                    }
                };

                for (let x = 0; x < w; x++) {
                    tryEnqueue(x, 0);
                    tryEnqueue(x, h - 1);
                }
                for (let y = 0; y < h; y++) {
                    tryEnqueue(0, y);
                    tryEnqueue(w - 1, y);
                }

                while (qHead < queue.length) {
                    const qx = queue[qHead++];
                    const qy = queue[qHead++];
                    if (qx > 0) tryEnqueue(qx - 1, qy);
                    if (qx < w - 1) tryEnqueue(qx + 1, qy);
                    if (qy > 0) tryEnqueue(qx, qy - 1);
                    if (qy < h - 1) tryEnqueue(qx, qy + 1);
                }

                // Clear background pixels to transparent
                for (let i = 0; i < visited.length; i++) {
                    if (visited[i]) {
                        d[i * 4 + 3] = 0;
                    }
                }

                ctx.putImageData(imgData, 0, 0);
                imgEl.dataset.bgProcessed = 'true';
                imgEl.src = canvas.toDataURL('image/png');
            } catch (err) {
                // Graceful fallback
            }
        };

        if (imgEl.complete && imgEl.naturalWidth > 0) {
            process();
        } else {
            imgEl.addEventListener('load', process, { once: true });
        }
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
        });

        // Mouse Wheel Virtual Scroll
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
            if (e.target.closest('.phone-3d-stage') || e.target.closest('.color-swatch-dot')) return;
            this.drag.isDown = true;
            this.drag.startX = e.clientX;
            this.drag.lastX = e.clientX;
            this.drag.velocity = 0;
            this.track.classList.add('is-dragging');
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.drag.isDown) return;
            const delta = e.clientX - this.drag.lastX;
            this.drag.lastX = e.clientX;
            this.drag.velocity = delta;
            this.targetTranslateX += delta;
            this.clampScroll();
        });

        window.addEventListener('mouseup', () => {
            if (!this.drag.isDown) return;
            this.drag.isDown = false;
            this.track.classList.remove('is-dragging');
        });

        // Scrubber bar click & drag
        if (this.scrubberBar) {
            const handleScrub = (clientX) => {
                const rect = this.scrubberBar.getBoundingClientRect();
                const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                this.targetTranslateX = -progress * this.maxScroll;
                this.clampScroll();
            };

            this.scrubberBar.addEventListener('click', (e) => {
                handleScrub(e.clientX);
            });
        }

        // Category Filter Buttons
        const filterBtns = this.section.querySelectorAll('.merci-filter-btn');
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
        if (this.scrubberFill && this.maxScroll > 0) {
            const progress = Math.min(1, Math.max(0, -this.currentTranslateX / this.maxScroll));
            this.scrubberFill.style.width = `${progress * 100}%`;
        }

        // Animate each 3D Phone Asset (Same physics & floating levitation as Accessory Showcase)
        const time = Date.now() * 0.002;
        this.phoneAssets.forEach((asset) => {
            const { stage, bgBlur, glare, interaction } = asset;
            if (!stage) return;

            // Auto-orbit / float rotation when not dragging
            if (!interaction.isDown) {
                if (!interaction.isHovered) {
                    // Gentle organic 3D oscillation sway
                    const sway = Math.sin(time + interaction.orbitPhase) * 16;
                    interaction.rotTargetY += (sway - interaction.rotTargetY) * 0.04;
                    interaction.rotTargetX += (0 - interaction.rotTargetX) * 0.04;
                }
            }

            // Smooth physics interpolation
            interaction.rotCurrentX += (interaction.rotTargetX - interaction.rotCurrentX) * 0.085;
            interaction.rotCurrentY += (interaction.rotTargetY - interaction.rotCurrentY) * 0.085;

            // Gentle floating hovering levitation
            const floatOffset = Math.sin(time * 1.5 + interaction.orbitPhase) * 8;
            const hoverLift = interaction.isHovered ? -10 : 0;
            const translateY = floatOffset + hoverLift;

            // Apply 3D Matrix Transform
            stage.style.transform = `perspective(1100px) translateY(${translateY.toFixed(2)}px) rotateX(${interaction.rotCurrentX.toFixed(2)}deg) rotateY(${interaction.rotCurrentY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03) translateZ(42px)`;

            // Ambient blur reverse parallax
            if (bgBlur) {
                bgBlur.style.transform = `scale(1.3) translateX(${(-interaction.rotCurrentY * 0.55).toFixed(1)}px) translateY(${(interaction.rotCurrentX * 0.55).toFixed(1)}px)`;
            }

            // Specular Glare Sheen
            if (glare) {
                const glareX = 50 + (interaction.rotCurrentY / 32) * 45;
                const glareY = 50 - (interaction.rotCurrentX / 32) * 45;
                const op = interaction.isHovered || interaction.isDown ? 0.45 : 0.22;
                glare.style.opacity = op.toString();
                glare.style.background = `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`;
            }
        });

        this.rafId = requestAnimationFrame(this.animate);
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    window.projectsGallery = new ProjectsGallery();
});
