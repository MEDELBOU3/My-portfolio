// animations.js
gsap.registerPlugin(ScrollTrigger);
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
            ease: "power2.in"
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