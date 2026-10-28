/**
 * Tactile Studio® — Main Application Controller
 * Coordinates:
 * 1. The Tactile Core (Resn-inspired Opening Portal)
 * 2. Refokus Kinetic 3D Assembly Hero (Segmented 3D Monolith & Fluted Purple Backdrop)
 * 3. Merci-Michel Inspired Horizontal Project Showcase
 * 4. Web Audio API Coupling (drone sweep, snap clicks, micro-HUD sync)
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. THE RESN-INSPIRED TACTILE CORE PORTAL (100% PRESERVED)
    // ==========================================================================
    let corePortal = null;
    if (typeof THREE !== 'undefined' && typeof TactileCorePortal !== 'undefined') {
        corePortal = new TactileCorePortal();
    }

    // ==========================================================================
    // 2. REFOKUS KINETIC 3D ASSEMBLY HERO
    // ==========================================================================
    let assemblyHero = null;
    if (typeof THREE !== 'undefined' && typeof AssemblyHero !== 'undefined') {
        assemblyHero = new AssemblyHero();
    }

    // ==========================================================================
    // 3. MERCI-MICHEL INSPIRED HORIZONTAL PROJECT SHOWCASE
    // ==========================================================================
    let projectsGallery = null;
    if (typeof ProjectsGallery !== 'undefined') {
        projectsGallery = new ProjectsGallery();
    }

    // Live Assembly Percentage Tracker in Bottom Bar
    const progressTextEl = document.getElementById('assembly-progress-text');
    window.addEventListener('scroll', () => {
        if (!assemblyHero || !progressTextEl) return;
        const pct = Math.round(assemblyHero.scroll.progress * 100);
        if (pct >= 95) {
            progressTextEl.textContent = '3D LETTERMARK ASSEMBLED // TACTILE® [ 100% ]';
        } else {
            progressTextEl.textContent = `SCROLL TO ASSEMBLE 3D LETTERMARK [ ${pct}% ]`;
        }
    }, { passive: true });

    // Portal Sound Toggle Buttons Sync
    const portalSoundBtn = document.getElementById('portal-sound-toggle');
    const portalSoundLabel = document.getElementById('portal-sound-label');
    const perimeterSoundBtn = document.getElementById('sound-toggle');
    const perimeterSoundLabel = document.getElementById('sound-label');

    function syncSoundUI(isActive) {
        if (portalSoundLabel) portalSoundLabel.textContent = isActive ? '[Sound: ON]' : '[Sound: OFF]';
        if (perimeterSoundLabel) perimeterSoundLabel.textContent = isActive ? 'SOUND: ON' : 'SOUND: OFF';
    }

    if (portalSoundBtn) {
        portalSoundBtn.addEventListener('click', () => {
            if (window.tactileAudio) {
                const active = window.tactileAudio.toggleMute();
                syncSoundUI(active);
            }
        });
    }

    if (perimeterSoundBtn) {
        perimeterSoundBtn.addEventListener('click', () => {
            if (window.tactileAudio) {
                const active = window.tactileAudio.toggleMute();
                syncSoundUI(active);
            }
        });
    }

    // Re-Enter Core Button (Resets portal without page reload)
    const reenterBtn = document.getElementById('btn-reenter-core');
    if (reenterBtn && corePortal) {
        reenterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'instant' });
            corePortal.resetCore();
            if (window.tactileAudio) {
                window.tactileAudio.playActionTick();
            }
        });
    }

    // Menu Pill Interaction
    const menuBtn = document.getElementById('hud-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            if (window.tactileAudio) window.tactileAudio.playGlassTick(2600);
            alert('Tactile Studio® Navigation: Index // Selected Works // Spatial Direction');
        });
    }

    // Smooth Anchor Scroll Navigation for Phones & 3D Accessories
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                    if (window.tactileAudio) window.tactileAudio.playActionTick();
                }
            }
        });
    });

    // ==========================================================================
    // ==========================================================================
    // 4. CUSTOM CURSOR & AMBIENT RADIAL CANVAS (HIGH-PERFORMANCE EVENT-DRIVEN)
    // ==========================================================================
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let cursorRafId = null;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursorDot) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }
        if (!cursorRafId) {
            cursorRafId = requestAnimationFrame(updateCursor);
        }
    }, { passive: true });

    function updateCursor() {
        const dx = mouseX - ringX;
        const dy = mouseY - ringY;
        ringX += dx * 0.18;
        ringY += dy * 0.18;

        if (cursorRing) {
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
        }

        if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
            cursorRafId = requestAnimationFrame(updateCursor);
        } else {
            cursorRafId = null;
        }
    }

    const interactiveElements = document.querySelectorAll('a, button, .perimeter-pill, .portal-sound-btn, .merci-card, .merci-filter-btn, .merci-nav-link');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('hovering');
        });
    });

    // Ambient Radial Canvas - Redraw strictly on mouse movement, never in a free-running 60fps loop!
    const ambientCanvas = document.getElementById('ambient-canvas');
    if (ambientCanvas) {
        const ambCtx = ambientCanvas.getContext('2d');
        let ambW = window.innerWidth;
        let ambH = window.innerHeight;

        function resizeAmbient() {
            ambW = window.innerWidth;
            ambH = window.innerHeight;
            ambientCanvas.width = ambW;
            ambientCanvas.height = ambH;
            drawAmbient();
        }
        window.addEventListener('resize', resizeAmbient);
        resizeAmbient();

        let ambientNeedsDraw = false;
        function drawAmbient() {
            ambCtx.clearRect(0, 0, ambW, ambH);
            const cx = mouseX > 0 ? mouseX : ambW * 0.5;
            const cy = mouseY > 0 ? mouseY : ambH * 0.4;
            const rad = ambCtx.createRadialGradient(cx, cy, 20, cx, cy, 550);
            rad.addColorStop(0, 'rgba(147, 51, 234, 0.045)');
            rad.addColorStop(0.5, 'rgba(59, 7, 100, 0.02)');
            rad.addColorStop(1, 'transparent');

            ambCtx.fillStyle = rad;
            ambCtx.fillRect(0, 0, ambW, ambH);
            ambientNeedsDraw = false;
        }

        window.addEventListener('mousemove', () => {
            if (!ambientNeedsDraw) {
                ambientNeedsDraw = true;
                requestAnimationFrame(drawAmbient);
            }
        }, { passive: true });
    }

    // ==========================================================================
    // 5. SHOWCASE BACKGROUND VIDEOS (CONTINUOUS INFINITE LOOP ENGINE)
    // - Videos play continuously when near or inside their section
    // - Off-screen pausing frees up GPU video decoder bandwidth for 60fps smooth scrolling
    // ==========================================================================
    const phonesVideo = document.getElementById('phones-bg-video');
    const accessoriesVideo = document.getElementById('accessories-bg-video');
    const phonesSection = document.getElementById('merci-projects-section');
    const accessoriesSection = document.getElementById('accessories-3d-section');

    const setupBackgroundVideo = (video) => {
        if (!video) return;

        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('loop', '');
        video.setAttribute('autoplay', '');

        // Gapless seamless loop
        video.addEventListener('ended', () => {
            video.currentTime = 0;
            video.muted = true;
            video.play().catch(() => {});
        });

        video.addEventListener('waiting', () => {
            video.play().catch(() => {});
        });
    };

    setupBackgroundVideo(phonesVideo);
    setupBackgroundVideo(accessoriesVideo);

    // Smart Viewport Video Manager: Plays video when near/in section, pauses when scrolled far away
    if (typeof IntersectionObserver !== 'undefined') {
        const videoSectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const vid = entry.target.querySelector('video.section-bg-video');
                if (!vid) return;

                if (entry.isIntersecting) {
                    vid.muted = true;
                    if (vid.paused) vid.play().catch(() => {});
                } else {
                    if (!vid.paused) vid.pause();
                }
            });
        }, { rootMargin: '250px 0px 250px 0px', threshold: 0.02 });

        if (phonesSection) videoSectionObserver.observe(phonesSection);
        if (accessoriesSection) videoSectionObserver.observe(accessoriesSection);
    } else {
        // Fallback
        if (phonesVideo) phonesVideo.play().catch(() => {});
        if (accessoriesVideo) accessoriesVideo.play().catch(() => {});
    }

    // Quick wake-up on first user interaction if browser blocked autoplay
    const wakeUpActiveVideos = () => {
        const vh = window.innerHeight;
        [
            { sec: phonesSection, vid: phonesVideo },
            { sec: accessoriesSection, vid: accessoriesVideo }
        ].forEach(({ sec, vid }) => {
            if (sec && vid) {
                const rect = sec.getBoundingClientRect();
                if (rect.top < vh + 200 && rect.bottom > -200) {
                    vid.muted = true;
                    if (vid.paused) vid.play().catch(() => {});
                }
            }
        });
    };

    ['click', 'touchstart', 'scroll', 'wheel'].forEach(evt => {
        window.addEventListener(evt, wakeUpActiveVideos, { passive: true });
    });
});
