// animations.js

gsap.registerPlugin(ScrollTrigger);

// 0. System Loader Animation
export const initLoader = () => {
    return new Promise((resolve) => {
        const tl = gsap.timeline({
            onComplete: resolve
        });

        const statusMessages = [
            "Allocating WebGL Buffer...",
            "Synchronizing Fluid Kernels...",
            "Indexing Project Manifest...",
            "Verifying Identity Module...",
            "Architecture Loaded."
        ];

        const statusText = document.getElementById('loader-status-text');
        const percentageText = document.getElementById('loader-percentage');

        tl.to('#loader-bar-fill', {
            width: "100%",
            duration: 2.5,
            ease: "power2.inOut",
            onUpdate: function() {
                const prog = Math.round(this.progress() * 100);
                if (percentageText) percentageText.innerText = `${prog}%`;
                if (statusText) {
                    const msgIndex = Math.floor(this.progress() * (statusMessages.length - 1));
                    statusText.innerText = statusMessages[msgIndex];
                }
            }
        })
        .to('#loader-overlay', {
            clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
            duration: 1.2,
            ease: "expo.inOut"
        })
        .to('#loader-overlay', {
            autoAlpha: 0,
            ease: "expo.inOut"
        });
    });
};

// 1. Initial Hero Reveal Timeline
export const initHeroAnimation = () => {
    // Split text into characters for the hero section
    const textToSplit = document.querySelectorAll('.split-text');
    new SplitType(textToSplit, { types: 'chars' });

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Set initial states
    gsap.set('.fade-in', { opacity: 0, y: 10 });
    gsap.set('.bg-overlay', { opacity: 0 });

    tl.to('.bg-overlay', { opacity: 0.6, duration: 2, ease: "power2.inOut" })
        .to('#stats-line', { scaleX: 1, duration: 1.5 }, "-=1.5")
        .to('.char', { y: 0, stagger: 0.04, duration: 1.2 }, "-=1.2")
        .to('.underline-wrapper::after', { scaleX: 1, duration: 1, ease: "expo.out" }, "-=0.8")
        .to('.fade-in', { opacity: 1, y: 0, stagger: 0.1, duration: 1 }, "-=0.8");
};

// 2. Create and Return the Menu Timeline
export const createMenuTimeline = () => {
    const menuTl = gsap.timeline({ paused: true, defaults: { ease: "expo.inOut" } });

    // Ensure link wrappers don't overwrite our hover transforms when animated
    gsap.set('.menu-link', { y: "110%" });
    gsap.set('.fade-menu-info', { opacity: 0, y: 20 });

    menuTl.to('.menu-overlay', {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // Open wipe
        duration: 1.2
    })
        .to('.menu-link', {
            y: "0%",
            stagger: 0.1,
            duration: 1,
            ease: "power4.out"
        }, "-=0.6") // Start slightly before wipe finishes
        .to('.fade-menu-info', {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.8");

    return menuTl;
};

// 3. Magnetic Element Effect Logic
export const initMagneticElements = () => {
    const magneticElements = document.querySelectorAll('.magnetic-element');

    magneticElements.forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            // Calculate distance from center to make it "pull" towards cursor
            const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.4;

            gsap.to(el, {
                x: x,
                y: y,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        el.addEventListener('mouseleave', () => {
            // Snap back to original position
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
};

// 4. Initialize Parallax Effect for Project Images
export const initParallaxImages = () => {
    const parallaxImages = document.querySelectorAll('.parallax-image');

    parallaxImages.forEach(image => {
        gsap.to(image, {
            y: "-20%", // Moves the image up inside the wrapper
            ease: "none",
            scrollTrigger: {
                trigger: image.parentElement, // Trigger based on the wrapper
                start: "top bottom", // Start when top of wrapper hits bottom of screen
                end: "bottom top",   // End when bottom of wrapper hits top of screen
                scrub: true          // Link animation to scroll bar
            }
        });
    });
};

// 5. Scroll Reveals for Work Section Text
export const initScrollReveals = () => {
    // Reveal project rows
    const projectRows = document.querySelectorAll('.project-row');

    projectRows.forEach(row => {
        gsap.from(row.querySelector('.project-info'), {
            opacity: 0,
            x: -50,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: row,
                start: "top 80%",
            }
        });
    });
};

export const initStackedCards = () => {
    const cards = gsap.utils.toArray('.stack-card');

    cards.forEach((card, index) => {
        // We don't scale down the very last card
        if (index === cards.length - 1) return;

        // As the NEXT card scrolls up to overlap, scale down and darken the CURRENT card
        gsap.to(card, {
            scale: 0.92, // Scales down slightly
            filter: "brightness(0.6)", // Darkens to create a shadow illusion
            ease: "none",
            scrollTrigger: {
                trigger: cards[index + 1], // The next card is the trigger
                start: "top 80%", // Start effect when next card is 80% down the screen
                end: "top 15%",   // End effect exactly when next card hits the sticky point (15vh)
                scrub: true,      // Tie it smoothly to the user's scrollbar
            }
        });
    });

    // Subtly slide up the text inside each card as it appears
    cards.forEach(card => {
        gsap.from(card.querySelectorAll('.card-title, .card-desc-wrapper'), {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: card,
                start: "top 70%",
            }
        });
    });
};

// 6. Infinite Zoom-Through Text Transition
export const initZoomTransition = () => {
    gsap.set(".zoom-text-wrapper", { transformOrigin: "center center" });

    // Timeline for the zoom
    const zoomTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".zoom-section",
            start: "top top",
            end: "bottom bottom",
            scrub: 2,
            onUpdate: (self) => {
                const contact = document.querySelector('.contact-section');
                // When we are 95% through the zoom, fade the contact section in
                if (self.progress > 0.95) {
                    contact.classList.add('is-visible');
                } else {
                    contact.classList.remove('is-visible');
                }
            }
        }
    });

    zoomTl.to(".zoom-text-wrapper", {
        scale: 200,
        ease: "power2.in",
    })
        .to(".white-flash-overlay", {
            opacity: 1,
            ease: "none",
            duration: 0.1
        }, "-=0.15");

    // Animate contact content
    gsap.from(".contact-title, .footer-fade-up", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".contact-section",
            start: "top 80%", // This now triggers based on the sticky contact section
        }
    });
};

export const initEngineeringSection = () => {
    // 1. Generate GitHub Graph Squares dynamically
    const graphContainer = document.getElementById('github-graph');
    if (graphContainer) {
        // Clear it first just in case
        graphContainer.innerHTML = '';

        // Generate 84 squares
        for (let i = 0; i < 84; i++) {
            let sq = document.createElement('div');
            sq.className = 'graph-sq';

            let intensity = Math.random();
            if (intensity > 0.85) sq.classList.add('high');
            else if (intensity > 0.6) sq.classList.add('med');
            else if (intensity > 0.3) sq.classList.add('low');

            graphContainer.appendChild(sq);
        }
    }

    // 2. Bento Boxes Scroll Reveal
    gsap.from('.bento-reveal', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".engineering-section",
            start: "top 80%",
        }
    });

    // 3. Animate the GitHub Squares popping in
    gsap.to('.graph-sq', {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: {
            each: 0.02,
            from: "random"
        },
        ease: "back.out(2)",
        scrollTrigger: {
            trigger: ".github-card",
            start: "top 80%"
        }
    });

    // 4. BULLETPROOF NUMBER COUNTER
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        const targetValue = parseInt(counter.getAttribute('data-target'), 10);

        // We create a dummy object to animate from 0 to the target
        let countObj = { val: 0 };

        gsap.to(countObj, {
            val: targetValue,
            duration: 2.5,
            ease: "power3.out",
            scrollTrigger: {
                trigger: counter,
                start: "top 85%",
            },
            onUpdate: function () {
                // Update the HTML on every frame of the animation
                let currentNum = Math.floor(countObj.val);
                // Add the "+" if it's the 850+ stat
                if (targetValue > 100) {
                    counter.innerText = currentNum + "+";
                } else {
                    counter.innerText = currentNum;
                }
            }
        });
    });
};


export const initWorkOverlay = () => {
    const workLink = document.getElementById('nav-work-link');
    const closeWorkBtn = document.getElementById('close-work-btn');
    const workOverlay = document.getElementById('work-overlay');

    // ==========================================
    // YOUTUBE VIDEO LIGHTBOX LOGIC
    // ==========================================
    const videoItems = document.querySelectorAll('.video-item');
    const videoModal = document.getElementById('wo-video-modal');
    const videoBackdrop = document.getElementById('wo-video-close-bg');
    const videoCloseBtn = document.getElementById('wo-video-close-btn');
    const iframeContainer = document.getElementById('wo-iframe-container');
    const videoWrapper = document.querySelector('.wo-video-wrapper');

    // Function to Open Video
    const openVideo = (ytId) => {
        // 1. Inject the iframe with autoplay enabled
        iframeContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&showinfo=0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;

        // 2. Allow mouse clicks on the modal
        videoModal.style.pointerEvents = "auto";
        videoWrapper.style.visibility = "visible"; // Ensure wrapper is visible before animating opacity

        // 3. Animate it onto the screen
        gsap.to(videoBackdrop, { opacity: 1, duration: 0.4, ease: "power2.out" });
        gsap.to(videoWrapper, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: "power4.out",
            delay: 0.1
        });
    };

    // Function to Close Video
    const closeVideo = () => {
        // 1. Animate it off the screen
        gsap.to(videoWrapper, {
            opacity: 0,
            scale: 0.95,
            y: 20,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => { // Hide wrapper completely after animation
                videoWrapper.style.visibility = "hidden";
            }
        });

        gsap.to(videoBackdrop, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                // 2. Hide modal from mouse clicks
                videoModal.style.pointerEvents = "none";

                // 3. CRITICAL: Destroy the iframe so the audio stops playing!
                iframeContainer.innerHTML = '';
            }
        });
    };

    // Attach click events to the numbers (01, 02, 03)
    videoItems.forEach(item => {
        item.addEventListener('click', () => {
            const ytId = item.getAttribute('data-yt');
            if (ytId) openVideo(ytId);
        });
    });

    // Close video when clicking the 'X' or the dark background
    if (videoBackdrop) videoBackdrop.addEventListener('click', closeVideo);
    if (videoCloseBtn) videoCloseBtn.addEventListener('click', closeVideo);
    // 1. Setup GSAP Timeline with Lenis Controls
    const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.inOut", duration: 1.2 },
        onStart: () => {
            // 1. Lock the body
            document.body.style.overflow = 'hidden';
            // 2. STOP Lenis so the overlay can scroll natively!
            if (window.lenis) window.lenis.stop();
        },
        onReverseComplete: () => {
            // 1. Unlock the body
            document.body.style.overflow = '';
            // 2. START Lenis again when overlay is fully closed
            if (window.lenis) window.lenis.start();
        }
    });

    tl.to(workOverlay, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    })
        .to('.wo-text', {
            y: "0%",
            stagger: 0.1,
            duration: 1,
            ease: "power3.out"
        }, "-=0.6")
        .from('.wo-list-item', {
            y: 50,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.8");

    // --- (The rest of your event listeners and floating image logic stays the same below here) ---

    if (workLink) {
        workLink.addEventListener('click', (e) => {
            e.preventDefault();
            tl.play();
        });
    }

    if (closeWorkBtn) {
        closeWorkBtn.addEventListener('click', () => {
            tl.reverse();
        });
    }

    const listItems = document.querySelectorAll('.wo-list-item');
    const floatWrapper = document.querySelector('.wo-floating-img');
    const floatImg = document.getElementById('wo-float-img');

    if (!floatWrapper || !floatImg) return;

    let xMove = gsap.quickTo(floatWrapper, "left", { duration: 0.4, ease: "power3" });
    let yMove = gsap.quickTo(floatWrapper, "top", { duration: 0.4, ease: "power3" });

    workOverlay.addEventListener('mousemove', (e) => {
        xMove(e.clientX);
        yMove(e.clientY);
    });

    listItems.forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            const newSrc = item.getAttribute('data-img');
            if (newSrc) floatImg.src = newSrc;

            gsap.to(floatWrapper, {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: "back.out(1.5)"
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(floatWrapper, {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                ease: "power2.in"
            });
        });
    });
};

export const initAboutOverlay = () => {
    const aboutLink = document.getElementById('nav-about-link');
    const closeAboutBtn = document.getElementById('close-about-btn');
    const aboutOverlay = document.getElementById('about-overlay');

    if (!aboutOverlay || !aboutLink) return;

    const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.inOut", duration: 1.4 },
        onStart: () => {
            document.body.style.overflow = 'hidden';
            if (window.lenis) window.lenis.stop();
        },
        onReverseComplete: () => {
            document.body.style.overflow = '';
            if (window.lenis) window.lenis.start();
        }
    });

    tl.to(aboutOverlay, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    })
        .to('.ao-text', {
            y: "0%",
            stagger: 0.1,
            duration: 1.2,
            ease: "power4.out"
        }, "-=0.8")
        .from('.ao-bio, .ao-expertise, .ao-value-item', {
            y: 40,
            opacity: 0,
            stagger: 0.1,
            duration: 1,
            ease: "power3.out"
        }, "-=1");

    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Close menu if it's open (assuming menuToggle logic exists elsewhere)
        const menuCloseBtn = document.getElementById('menu-close');
        if (menuCloseBtn) menuCloseBtn.click();

        tl.play();
    });

    closeAboutBtn.addEventListener('click', () => {
        tl.reverse();
    });
};

export const initProcessOverlay = () => {
    const processOverlay = document.getElementById('process-overlay');
    const items = document.querySelectorAll('.p-item');
const descBox = document.getElementById('p-desc');

items.forEach(item => {
    item.addEventListener('mouseenter', () => {
        const newDesc = item.getAttribute('data-desc');
        
        // Fade out effect
        descBox.style.opacity = '0';
        descBox.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            descBox.textContent = newDesc;
            descBox.style.opacity = '1';
            descBox.style.transform = 'translateY(0)';
        }, 200);
    });
});
    
    // Set initial state so it's not invisible
    gsap.set(items, { y: 100, opacity: 0 });

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.inOut", duration: 1 } });
    
    tl.to(processOverlay, { 
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1
    })
    .to(items, { 
        y: 0, 
        opacity: 1, 
        stagger: 0.1, 
        duration: 0.8,
        ease: "power3.out" 
    }, "-=0.5"); // Starts slightly before the wipe finishes

    // Trigger logic
    document.querySelector('#nav-process-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        processOverlay.style.display = 'block'; // Ensure it's in the DOM
        tl.play();
    });

    document.getElementById('close-process-btn').addEventListener('click', () => {
        tl.reverse();
    });
};

export const initGameSection = () => {
    const items = document.querySelectorAll('.engine-item');
    const img = document.getElementById('engine-img');
    const desc = document.getElementById('engine-desc');

    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Update Text
            desc.innerText = item.getAttribute('data-desc');
            
            // Image Transition
            gsap.to(img, {
                opacity: 0,
                duration: 0.2,
                onComplete: () => {
                    img.src = item.getAttribute('data-img');
                    gsap.to(img, { opacity: 1, duration: 0.4 });
                }
            });
        });
    });

    // Scroll Reveal
    gsap.from('.engine-item', {
        x: -50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.game-dev-section',
            start: "top 70%"
        }
    });
};

export const initVisionSection = () => {
    // Parallax effect for the vision image
    gsap.to('.vision-parallax-img', {
        y: '10%',
        ease: 'none',
        scrollTrigger: {
            trigger: '.vision-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });
};

export const initSidebarNavigator = () => {
    // 1. Overall Progress Fill
    gsap.to('#side-progress', {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: true
        }
    });

    // 2. Section Tracking
    const sections = [
        { id: 'canvas-container', label: 'HOME', num: '01' },
        { id: 'work', label: 'WORK', num: '02' },
        { id: 'engineering', label: 'CORE', num: '03' },
        { id: 'game-dev', label: 'GAME', num: '04' },
        { id: 'philosophy', label: 'VISION', num: '05' },
        { id: 'contact', label: 'CONTACT', num: '06' }
    ];

    const sideNum = document.getElementById('side-num');
    const sideLabel = document.getElementById('side-label');

    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: `#${section.id}`,
            start: "top center",
            end: "bottom center",
            onEnter: () => updateSidebar(section.num, section.label),
            onEnterBack: () => updateSidebar(section.num, section.label)
        });
    });

    function updateSidebar(num, label) {
        gsap.to([sideNum, sideLabel], {
            opacity: 0, y: -10, duration: 0.2, onComplete: () => {
                sideNum.innerText = num;
                sideLabel.innerText = label;
                gsap.to([sideNum, sideLabel], { opacity: 1, y: 0, duration: 0.2 });
            }
        });
    }
};

export const initTelemetryHUD = () => {
    const fpsEl = document.getElementById('hud-fps');
    const resEl = document.getElementById('hud-res');
    const veloEl = document.getElementById('hud-velo');
    const uptimeEl = document.getElementById('hud-uptime');
    const pingEl = document.getElementById('hud-ping');
    const hud = document.querySelector('.system-hud');
    const expandBtn = document.getElementById('hud-expand-trigger');
    const settingsBtn = document.getElementById('hud-settings-trigger');
    const calendarBtn = document.getElementById('hud-calendar-trigger');
    const diagBtn = document.getElementById('hud-diagnostics-trigger');
    const bioBtn = document.getElementById('hud-bio-trigger'); // Defined missing variable
    const authBtn = document.getElementById('hud-auth-trigger');
    const coffeeBtn = document.getElementById('hud-coffee-trigger');
    const bioTarget = document.getElementById('bio-typing-target'); // Moved declaration here
    const terminalBody = document.getElementById('hud-terminal');
    const cpuFill = document.getElementById('cpu-fill');
    const memFill = document.getElementById('mem-fill');
    const calDisplayStr = document.getElementById('cal-display-string');
    const coffeeFuelFill = document.getElementById('coffee-fuel-fill'); // Fixed reference
    const sparkCanvas = document.getElementById('sparkline-canvas');

    // Helper to clear all HUD states before switching
    const clearHudStates = () => {
        const states = ['is-expanded', 'is-settings', 'is-calendar', 'is-diagnostics', 'is-biography', 'is-coffee', 'is-auth'];
        hud.classList.remove(...states);
    };

    // 0. Expansion Logic
    if (expandBtn) {
        expandBtn.addEventListener('click', () => {
            const wasActive = hud.classList.contains('is-expanded');
            clearHudStates();
            if (!wasActive) {
                hud.classList.add('is-expanded');
                addLog("> TELEMETRY_FEED: EXPANDED");
            }
        });
    }

    // 0.1 Settings Logic (Environment Controls)
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            const wasActive = hud.classList.contains('is-settings');
            clearHudStates();
            if (!wasActive) hud.classList.add('is-settings');
        });
    }

    // 0.1.2 Calendar Logic
    if (calendarBtn) {
        calendarBtn.addEventListener('click', () => {
            const wasActive = hud.classList.contains('is-calendar');
            clearHudStates();
            if (!wasActive) hud.classList.add('is-calendar');
        });
    }

    // 0.1.3 Auth Logic
    if (authBtn) {
        authBtn.addEventListener('click', () => {
            const wasActive = hud.classList.contains('is-auth');
            clearHudStates();
            if (!wasActive) hud.classList.add('is-auth');
        });
    }

    if (diagBtn) {
        diagBtn.addEventListener('click', () => {
            const wasActive = hud.classList.contains('is-diagnostics');
            clearHudStates();
            
            if (!wasActive) {
                hud.classList.add('is-diagnostics');
                // Fix: Initialize canvas size when panel is opened
                if (sparkCanvas) {
                    requestAnimationFrame(() => {
                        sparkCanvas.width = sparkCanvas.parentElement.offsetWidth || 300;
                        sparkCanvas.height = sparkCanvas.parentElement.offsetHeight || 80;
                    });
                }
            }
        });
    }

    // 0.1.5 Coffee / Focus Protocol Logic
    let focusAudioCtx, focusOsc, focusGain;

    if (coffeeBtn) {
        coffeeBtn.addEventListener('click', () => {
            const wasActive = hud.classList.contains('is-coffee');
            clearHudStates();
            if (!wasActive) hud.classList.add('is-coffee');
            
            const isActive = hud.classList.contains('is-coffee');
            document.documentElement.setAttribute('data-focus-mode', isActive);
            
            if (isActive) {
                startFocusAudio();
                addLog("> FOCUS_PROTOCOL: INITIALIZED");
                animateCoffeeFuel();
            } else {
                stopFocusAudio();
                addLog("> FOCUS_PROTOCOL: TERMINATED");
            }
        });
    }

    function startFocusAudio() {
        try {
            focusAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            focusGain = focusAudioCtx.createGain();
            focusGain.gain.setValueAtTime(0, focusAudioCtx.currentTime);
            focusGain.gain.linearRampToValueAtTime(0.05, focusAudioCtx.currentTime + 2); // Fade in

            // Create a low-frequency ambient hum
            focusOsc = focusAudioCtx.createOscillator();
            focusOsc.type = 'sine';
            focusOsc.frequency.setValueAtTime(55, focusAudioCtx.currentTime); // A1 Note
            
            focusOsc.connect(focusGain);
            focusGain.connect(focusAudioCtx.destination);
            focusOsc.start();
        } catch(e) { console.warn("Audio not supported"); }
    }

    function stopFocusAudio() {
        if (focusGain && focusAudioCtx) {
            focusGain.gain.linearRampToValueAtTime(0, focusAudioCtx.currentTime + 0.5);
            setTimeout(() => {
                if (focusOsc) focusOsc.stop();
                if (focusAudioCtx) focusAudioCtx.close();
            }, 500);
        }
    }

    function animateCoffeeFuel() {
        if (coffeeFuelFill) {
            gsap.fromTo(coffeeFuelFill, { width: "0%" }, { width: "85%", duration: 3, ease: "power2.inOut" });
        }
    }

    // 0.1.4 Biography Logic
    let isTyping = false;
    const fullBio = "I am Mohamed El-bouanani, a Creative Developer specializing in high-performance digital environments. My philosophy is built on technical rigor and aesthetic precision. From proprietary C++ engines to fluid WebGL simulations, I bridge the gap between low-level architecture and high-end user experiences. Based in Morocco, I architect systems that aren't just seen, but felt.";

    if (bioBtn) {
        bioBtn.addEventListener('click', () => {
            const wasActive = hud.classList.contains('is-biography');
            clearHudStates();
            if (!wasActive) hud.classList.add('is-biography');

            if (!wasActive && !isTyping && hud.classList.contains('is-biography')) {
                startBioTypewriter();
            }
        });
    }

    function startBioTypewriter() {
        isTyping = true;
        bioTarget.innerText = "";
        let i = 0;
        
        // Safe Audio Context creation
        let audioCtx;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) { console.warn("AudioContext not supported"); }

        function typeCharacter() {
            if (i < fullBio.length && hud.classList.contains('is-biography')) {
                // Use textContent instead of innerText to preserve spaces during incremental updates
                bioTarget.textContent += fullBio.charAt(i);
                
                // Play technical "blip" sound if context exists
                if (audioCtx && i % 2 === 0) { 
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(440 + (Math.random() * 200), audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.05);
                }

                i++;
                setTimeout(typeCharacter, 25);
            } else {
                isTyping = false;
                if (audioCtx) audioCtx.close();
            }
        }
        typeCharacter();
    }

    // Generate Calendar Grid
    const calGrid = document.getElementById('cal-grid');
    const monthYearEl = document.getElementById('cal-month-year');

    // Ensure we have the grid and populate it
    if (calGrid && monthYearEl) {
        // Clear any existing placeholders/comments to ensure generation
        calGrid.innerHTML = '';
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const today = now.getDate();

        // Set Main Display String (e.g., Mon, Mar 15)
        const displayDate = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(now);
        if (calDisplayStr) calDisplayStr.innerText = displayDate;

        // Set Dynamic Month/Year header
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
        monthYearEl.innerText = `${monthName} ${year}`;

        const firstDay = new Date(year, month, 1).getDay(); // Day of week for the 1st
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days in month

        const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        dayLabels.forEach(d => {
            const el = document.createElement('div');
            el.className = 'cal-day';
            el.innerText = d;
            calGrid.appendChild(el);
        });

        // Add empty cells for the offset to align the 1st correctly
        for (let i = 0; i < firstDay; i++) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'cal-date';
            emptyEl.innerHTML = '&nbsp;'; 
            calGrid.appendChild(emptyEl);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const el = document.createElement('div');
            el.className = 'cal-date';
            if (i === today) el.classList.add('active');
            
            // Keep simulated availability logic for the professional persona
            if (i > today && (i % 6 === 0 || i % 7 === 0)) el.classList.add('available');
            
            el.innerText = i;
            calGrid.appendChild(el);
        }
    }

    // 0.2 Environment Overrides
    document.getElementById('toggle-grid')?.addEventListener('change', (e) => {
        const lines = document.querySelectorAll('.z-line, .f-line, .o-line, .bottom-grid, .stats-line');
        gsap.to(lines, { opacity: e.target.checked ? 1 : 0, duration: 0.5 });
        // Custom log to terminal
        addLog(`> GRID_SYSTEM: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
    });

    document.getElementById('toggle-noise')?.addEventListener('change', (e) => {
        gsap.to('.bg-overlay', { opacity: e.target.checked ? 0.6 : 0, duration: 0.5 });
        addLog(`> TOPOGRAPHIC_NOISE: ${e.target.checked ? 'ACTIVE' : 'INACTIVE'}`);
    });

    document.getElementById('toggle-fluid')?.addEventListener('change', (e) => {
        const canvas = document.getElementById('fluid-canvas');
        gsap.to(canvas, { opacity: e.target.checked ? 1 : 0, duration: 0.5 });
        addLog(`> FLUID_ENGINE: ${e.target.checked ? 'RUNNING' : 'SUSPENDED'}`);
    });

    document.getElementById('toggle-scanlines')?.addEventListener('change', (e) => {
        document.getElementById('scanline-overlay').classList.toggle('active', e.target.checked);
        addLog(`> CRT_EMULATION: ${e.target.checked ? 'ON' : 'OFF'}`);
    });

    document.getElementById('toggle-mono')?.addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-mono', e.target.checked ? 'true' : 'false');
        addLog(`> MONO_FILTER: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
    });

    document.getElementById('reset-overrides')?.addEventListener('click', () => {
        addLog(`> INITIATING_SYSTEM_RESET...`);
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });

    // Sparkline Performance Simulation
    if (sparkCanvas) {
        const ctx = sparkCanvas.getContext('2d');
        let points = Array(30).fill(40);
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-green').trim() || '#7d9e84';
        
        const drawSparkline = () => {
            // Only animate if diagnostics panel is active to save resources
            if (!hud.classList.contains('is-diagnostics')) {
                requestAnimationFrame(drawSparkline);
                return;
            }
            
            ctx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
            points.shift();
            points.push(40 + (Math.random() - 0.5) * 20);
            
            ctx.beginPath();
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            
            const step = sparkCanvas.width / (points.length - 1);
            points.forEach((p, i) => {
                i === 0 ? ctx.moveTo(0, p) : ctx.lineTo(i * step, p);
            });
            ctx.stroke();
            
            document.getElementById('diag-jitter').innerText = (Math.random() * 0.05).toFixed(3) + 'ms';
            requestAnimationFrame(drawSparkline);
        };
        drawSparkline();
    }

    // Terminal Log Simulation
    const logs = [
        "> Optimizing vertex shaders...",
        "> Lenis: Scroll depth updated.",
        "> Syncing 3D scene objects.",
        "> Bypassing cache for telemetry.",
        "> Refreshing fluid density map.",
        "> GSAP: Timeline node processed.",
        "> System integrity at 98.4%",
        "> Vortex channel link active."
    ];

    // Advanced Resource Simulation
    setInterval(() => {
        if (cpuFill) cpuFill.style.width = `${Math.floor(Math.random() * (60 - 20) + 20)}%`;
        if (memFill) memFill.style.width = `${Math.floor(Math.random() * (40 - 15) + 15)}%`;
        if (pingEl) pingEl.innerText = `${Math.floor(Math.random() * (42 - 14) + 14)}ms`;
    }, 3000);

    // Session Uptime
    let startTime = Date.now();
    setInterval(() => {
        let elapsed = Math.floor((Date.now() - startTime) / 1000);
        let mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        let secs = (elapsed % 60).toString().padStart(2, '0');
        if (uptimeEl) uptimeEl.innerText = `${mins}:${secs}`;
    }, 1000);

    setInterval(() => {
        if (terminalBody) {
            const log = document.createElement('div');
            log.className = 'log-line';
            log.innerText = logs[Math.floor(Math.random() * logs.length)];
            terminalBody.appendChild(log);
            if (terminalBody.childNodes.length > 12) terminalBody.removeChild(terminalBody.firstChild);
        }
    }, 4000);

    // 1. Viewport Tracking
    const updateRes = () => {
        resEl.innerText = `${window.innerWidth}×${window.innerHeight}`;
    };
    window.addEventListener('resize', updateRes);
    updateRes();

    // 2. FPS Calculation
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateFPS = () => {
        frameCount++;
        const now = performance.now();
        if (now >= lastTime + 1000) {
            fpsEl.innerText = frameCount;
            
            // Color feedback based on performance
            if (frameCount < 45) fpsEl.style.color = '#ff3366';
            else fpsEl.style.color = 'inherit';
            
            frameCount = 0;
            lastTime = now;
        }
        requestAnimationFrame(updateFPS);
    };
    requestAnimationFrame(updateFPS);

    // 3. Velocity Tracking (using Lenis if available)
    const updateVelocity = () => {
        if (window.lenis) {
            // Convert velocity to absolute 2-decimal string
            const velo = Math.abs(window.lenis.velocity).toFixed(2);
            veloEl.innerText = velo;
            
            // Hide HUD during massive scrolls to reduce distraction, unless expanded
            if (hud && !hud.classList.contains('is-expanded')) {
                hud.style.opacity = Math.abs(window.lenis.velocity) > 50 ? '0.3' : '1';
            }
        }
        requestAnimationFrame(updateVelocity);
    };
    requestAnimationFrame(updateVelocity);
};

/**
 * World-class logging utility exported for external modules (like auth.js)
 */
export const writeToTerminal = (msg) => {
    const terminalBody = document.getElementById('hud-terminal');
    if (terminalBody) {
        const log = document.createElement('div');
        log.className = 'log-line';
        log.innerText = msg;
        terminalBody.appendChild(log);
        if (terminalBody.childNodes.length > 12) terminalBody.removeChild(terminalBody.firstChild);
    }
};
