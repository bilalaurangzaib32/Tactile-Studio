/**
 * Tactile Studio® — Contact & Inquiry Page Controller
 * Handles HUD bindings, dynamic 3D screen updates, chip toggles, and Web Audio API feedback
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize 3D Scene
    let contact3D = null;
    if (typeof THREE !== 'undefined' && typeof Contact3DScene !== 'undefined') {
        contact3D = new Contact3DScene();
    }

    // 2. Custom Cursor Tracking
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursorDot) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }
    });

    function renderCursor() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        if (cursorRing) {
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
        }
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // 3. Live Telemetry Clock (PKT)
    const telemetryTimeEl = document.getElementById('telemetry-time');
    function updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
        if (telemetryTimeEl) {
            telemetryTimeEl.textContent = `${timeStr} PKT`;
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 4. Form Elements & Dynamic 3D Phone Screen Sync
    const nameInput = document.getElementById('contact-name');
    const phoneInput = document.getElementById('contact-phone');
    const modelSelect = document.getElementById('contact-model');
    const msgInput = document.getElementById('contact-msg');
    const form = document.getElementById('contact-inquiry-form');
    const chipBtns = document.querySelectorAll('.chip-btn');
    const tokenBtns = document.querySelectorAll('.token-btn');

    let activeInquiryType = 'Buy Box Pack';

    function syncTo3DPhone() {
        if (!contact3D) return;
        contact3D.formData.name = nameInput ? nameInput.value.trim() : '';
        contact3D.formData.phone = phoneInput ? phoneInput.value.trim() : '';
        contact3D.formData.model = modelSelect ? modelSelect.value : '';
        contact3D.formData.type = activeInquiryType;
        contact3D.formData.msg = msgInput ? msgInput.value.trim() : '';
        contact3D.updateScreenTexture();
    }

    [nameInput, phoneInput, msgInput].forEach(input => {
        if (!input) return;
        input.addEventListener('input', syncTo3DPhone);

        // Dynamic Lighting Feedback on Focus
        input.addEventListener('focus', () => {
            if (contact3D) contact3D.setDynamicLighting(true);
            if (window.tactileAudio) window.tactileAudio.playGlassTick(3100);
        });

        input.addEventListener('blur', () => {
            if (contact3D) contact3D.setDynamicLighting(false);
        });
    });

    if (modelSelect) {
        modelSelect.addEventListener('change', () => {
            syncTo3DPhone();
            if (window.tactileAudio) window.tactileAudio.playActionTick();
        });
        modelSelect.addEventListener('focus', () => {
            if (contact3D) contact3D.setDynamicLighting(true);
        });
        modelSelect.addEventListener('blur', () => {
            if (contact3D) contact3D.setDynamicLighting(false);
        });
    }

    // 5. Inquiry Type Chips
    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chipBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeInquiryType = btn.dataset.type || 'Buy Box Pack';
            syncTo3DPhone();

            if (window.tactileAudio) {
                window.tactileAudio.playActionTick();
            }
        });
    });

    // 6. Fast Brand Selection Buttons & 3D Brand Token Event Sync
    function filterModelDropdown(brandKey) {
        tokenBtns.forEach(b => {
            if (b.dataset.brand === brandKey) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        if (modelSelect) {
            // Find first matching option in that optgroup
            const group = modelSelect.querySelector(`optgroup[data-brand="${brandKey}"]`);
            if (group && group.firstElementChild) {
                modelSelect.value = group.firstElementChild.value;
                syncTo3DPhone();
            }
        }
    }

    tokenBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const brand = btn.dataset.brand;
            filterModelDropdown(brand);
            if (window.tactileAudio) {
                window.tactileAudio.playGlassTick(2600);
            }
        });
    });

    // Listen to 3D raycasted click event on orbiting tokens
    window.addEventListener('brand:selected', (e) => {
        if (e.detail && e.detail.brand) {
            filterModelDropdown(e.detail.brand);
        }
    });

    // 7. Form Transmission & Web Audio Chime Confirmation
    const transmitBtn = document.getElementById('btn-transmit');
    const modal = document.getElementById('transmission-modal');
    const modalCloseBtn = document.getElementById('btn-modal-close');
    const modalRefCode = document.getElementById('modal-ref-code');
    const modalWaLink = document.getElementById('modal-wa-link');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (transmitBtn) {
                transmitBtn.classList.add('transmitting');
            }

            // Play Web Audio Confirmation Chime
            if (window.tactileAudio && window.tactileAudio.playTransmitChime) {
                window.tactileAudio.playTransmitChime();
            }

            // Generate WhatsApp custom direct message URL
            const nameVal = nameInput ? nameInput.value.trim() : '';
            const phoneVal = phoneInput ? phoneInput.value.trim() : '';
            const modelVal = modelSelect ? modelSelect.value : '';
            const msgVal = msgInput ? msgInput.value.trim() : '';
            const waMsg = `Hello Tactile Studio! I submitted an inquiry:\n- Model: ${modelVal}\n- Type: ${activeInquiryType}\n- Name: ${nameVal}\n- Phone: ${phoneVal}\n- Notes: ${msgVal}`;
            if (modalWaLink) {
                modalWaLink.href = `https://wa.me/923247118186?text=${encodeURIComponent(waMsg)}`;
            }

            // Simulate encrypted transmission dispatch (850ms)
            setTimeout(() => {
                if (transmitBtn) {
                    transmitBtn.classList.remove('transmitting');
                }

                // Generate random reference code
                const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
                if (modalRefCode) {
                    modalRefCode.textContent = `TX-${hex}P`;
                }

                if (modal) {
                    modal.classList.add('show');
                }
            }, 850);
        });
    }

    if (modalCloseBtn && modal) {
        modalCloseBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            if (form) form.reset();
            syncTo3DPhone();
            if (window.tactileAudio) {
                window.tactileAudio.playActionTick();
            }
        });
    }

    // 8. Sound Toggle Button Sync
    const soundToggleBtn = document.getElementById('sound-toggle');
    const soundLabel = document.getElementById('sound-label');

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            if (window.tactileAudio) {
                const active = window.tactileAudio.toggleMute();
                if (soundLabel) {
                    soundLabel.textContent = active ? 'SOUND: ON' : 'SOUND: OFF';
                }
            }
        });
    }

    // Initial 3D screen sync
    syncTo3DPhone();
});

