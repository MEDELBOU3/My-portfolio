//main.js

import {
    initHeroAnimation,
    createMenuTimeline,
    initMagneticElements,
    initParallaxImages,
    initScrollReveals,
    initStackedCards,
    initZoomTransition,
    initEngineeringSection,
    initWorkOverlay,
    initAboutOverlay,
    initProcessOverlay,
    initGameSection, // <--- Add this import
    initVisionSection,
} from './animations.js';
import { initFluid, updateFluidTheme, } from './fluid.js';

document.addEventListener("DOMContentLoaded", () => {
    initFluid();

    // =========================================
    // 1. Initialize Lenis Smooth Scroll
    // =========================================
    window.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
    });

    // Sync Lenis with GSAP ScrollTrigger
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Tell GSAP about Lenis updates
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000)
    });
    gsap.ticker.lagSmoothing(0);


    // =========================================
    // 2. Run Animations
    // =========================================
    initHeroAnimation();
    initMagneticElements();
    initStackedCards();
    initZoomTransition();
    initEngineeringSection();
    initWorkOverlay();
    initAboutOverlay();
    initParallaxImages(); // Parallax effect on scroll
    initScrollReveals();  // Text fade-in on scroll
    initProcessOverlay(); // Process overlay animations
    initGameSection(); // <--- Call the new animation function
    initVisionSection();
    // =========================================
    // 3. Menu Setup
    // =========================================
    const menuOpenBtn = document.getElementById('menu-open');
    const menuCloseBtn = document.getElementById('menu-close');
    const menuTimeline = createMenuTimeline();

    menuOpenBtn.addEventListener('click', () => {
        // lenis.stop(); // Optional: stop scrolling when menu is open
        document.body.style.pointerEvents = "none";
        document.querySelector('.menu-overlay').style.pointerEvents = "auto";
        menuTimeline.timeScale(1).play();
    });

    menuCloseBtn.addEventListener('click', () => {
        menuTimeline.timeScale(1.5).reverse();
        // lenis.start(); // Resume scrolling
        setTimeout(() => { document.body.style.pointerEvents = "auto"; }, 1000);
    });

    // =========================================
    // 4. Footer Utilities (Clock & Back to top)
    // =========================================

    // Live Clock (Morocco Time)
    const timeElement = document.getElementById('local-time');
    if (timeElement) {
        setInterval(() => {
            const now = new Date();
            // Format to Casablanca (Morocco) time
            const options = {
                timeZone: 'Africa/Casablanca',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            timeElement.textContent = now.toLocaleTimeString('en-US', options) + ' (WET)';
        }, 1000);
    }

    // Back to Top functionality using Lenis
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            // Tell Lenis to scroll smoothly back to the top of the page
            lenis.scrollTo(0, { duration: 2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        });
    }


    // ==========================================
    // THEME TOGGLE LOGIC
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeLabel = document.getElementById('theme-label');
    const htmlElement = document.documentElement; // Targets the <html> tag
    const themeIcon = document.getElementById('theme-icon');

    // 1. Check if user already chose a theme in a previous session
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';

    // Apply saved theme on load
    if (savedTheme === 'light') {
        htmlElement.setAttribute('data-theme', 'light');
        if (themeLabel) themeLabel.textContent = 'DARK'; // Show opposite action
    }

    // 2. Toggle Theme on Click
    themeToggleBtn.addEventListener('click', () => {
        const isCurrentlyLight = htmlElement.getAttribute('data-theme') === 'light';
        const nextThemeIsLight = !isCurrentlyLight;

        // Toggle attribute
        if (nextThemeIsLight) {
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('portfolio-theme', 'light');
            if (themeLabel) themeLabel.textContent = 'DARK';
        } else {
            htmlElement.removeAttribute('data-theme');
            localStorage.setItem('portfolio-theme', 'dark');
            if (themeLabel) themeLabel.textContent = 'LIGHT';
        }

        // GSAP Text Animation
        if (themeLabel) {
            gsap.to(themeLabel, {
                y: -10, opacity: 0, duration: 0.2, onComplete: () => {
                    gsap.fromTo(themeLabel, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2 });
                }
            });
        }
        // Swap the icon
        
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';

        // Update the icon attribute
        themeIcon.setAttribute('data-lucide', isLight ? 'moon' : 'sun');

        // Re-render icons
        lucide.createIcons();

        // Update the Fluid Shader
        updateFluidTheme(isLight);
    });
});