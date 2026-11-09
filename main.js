/* Reliable portfolio interactions. No required dependency on GSAP, Lenis or WebGL. */
(() => {
  "use strict";
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setupNavigation() {
    const button = $("#menu-toggle");
    const closeButton = $("#menu-close");
    const menu = $("#mobile-menu");
    if (!button || !menu) return;

    let open = false;
    const links = $$('a[href^="#"]', menu);

    function showMenu() {
      if (open) return;
      open = true;
      // Set visibility and geometry inline so the overlay cannot remain clipped by stale CSS.
      menu.style.display = "flex";
      menu.style.visibility = "visible";
      menu.style.opacity = "1";
      menu.style.pointerEvents = "auto";
      menu.style.zIndex = "9999";
      menu.style.clipPath = "inset(0 0 0 0)";
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      button.setAttribute("aria-expanded", "true");
      button.classList.add("is-open");
      document.body.classList.add("menu-is-open");

      const items = $$(".mobile-menu-inner a", menu);
      items.forEach((item, index) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(30px)";
        item.style.transition = "opacity .65s ease, transform .65s cubic-bezier(.2,.7,.2,1)";
        window.setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, reducedMotion ? 0 : 100 + index * 85);
      });
    }

    function hideMenu() {
      if (!open) return;
      open = false;
      menu.classList.remove("is-open");
      menu.style.clipPath = "inset(0 0 100% 0)";
      menu.style.pointerEvents = "none";
      menu.setAttribute("aria-hidden", "true");
      button.setAttribute("aria-expanded", "false");
      button.classList.remove("is-open");
      document.body.classList.remove("menu-is-open");
      window.setTimeout(() => {
        if (!open) {
          menu.style.visibility = "hidden";
          menu.style.display = "";
          menu.style.opacity = "";
          menu.style.zIndex = "";
        }
      }, reducedMotion ? 0 : 700);
    }

    button.addEventListener("click", event => {
      event.preventDefault();
      open ? hideMenu() : showMenu();
    });
    if (closeButton) closeButton.addEventListener("click", hideMenu);
    links.forEach(link => link.addEventListener("click", event => {
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      hideMenu();
      if (target) {
        event.preventDefault();
        window.setTimeout(() => target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" }), 30);
        history.replaceState(null, "", `#${id}`);
      }
    }));
    window.addEventListener("keydown", event => {
      if (event.key === "Escape") hideMenu();
    });
  }

  function setupCursor() {
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    if (!dot || !ring || !window.matchMedia("(pointer: fine)").matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let ringX = x;
    let ringY = y;
    let active = true;

    // The native cursor stays visible; the custom elements are a visible animated companion.
    dot.style.cssText += ";position:fixed;left:0;top:0;opacity:1;z-index:10001;pointer-events:none;transform:translate3d(-100px,-100px,0)";
    ring.style.cssText += ";position:fixed;left:0;top:0;opacity:1;z-index:10000;pointer-events:none;transform:translate3d(-100px,-100px,0)";
    window.addEventListener("pointermove", event => {
      x = event.clientX;
      y = event.clientY;
      dot.style.transform = `translate3d(${x - 3}px,${y - 3}px,0)`;
    }, { passive: true });

    function animateRing() {
      if (!active) return;
      ringX += (x - ringX) * .16;
      ringY += (y - ringY) * .16;
      ring.style.transform = `translate3d(${ringX - 17}px,${ringY - 17}px,0)`;
      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);

    $$("a,button,.project-visual,.lab-row").forEach(el => {
      el.addEventListener("pointerenter", () => ring.classList.add("is-hovering"));
      el.addEventListener("pointerleave", () => ring.classList.remove("is-hovering"));
    });
    window.addEventListener("blur", () => { active = false; });
    window.addEventListener("focus", () => { if (!active) { active = true; requestAnimationFrame(animateRing); } });
  }

  function setupScrollReveals() {
    const selectors = [
      ".section-label", ".reveal-copy", ".reveal-heading", ".project",
      ".discipline", ".about-title", ".about-body", ".lab-row",
      ".approach-heading", ".stack-line", ".contact-top", ".contact-section h2",
      ".contact-mail", ".contact-bottom"
    ];
    const targets = Array.from(new Set(selectors.flatMap(selector => $$(selector))));
    if (!targets.length) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(el => el.classList.add("is-visible"));
      return;
    }

    targets.forEach(el => el.classList.add("scroll-reveal"));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: "0px 0px -35px 0px" });

    targets.forEach(el => observer.observe(el));
  }

  function setupHeroMotion() {
    const words = $$(".hero-word");
    words.forEach((word, index) => {
      word.classList.add("hero-word-ready");
      if (!reducedMotion) {
        window.setTimeout(() => word.classList.add("hero-word-in"), 180 + index * 130);
      } else {
        word.classList.add("hero-word-in");
      }
    });

    const preloader = $("#preloader");
    if (preloader) {
      window.setTimeout(() => {
        preloader.classList.add("preloader-dismiss");
        window.setTimeout(() => preloader.remove(), 700);
      }, 250);
    }
  }

  function setupCardMotion() {
    if (!window.matchMedia("(pointer: fine)").matches || reducedMotion) return;
    $$(".project-visual,.lab-row").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - .5;
        const py = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(1000px) rotateX(${-py * 2.8}deg) rotateY(${px * 2.8}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  function init() {
    setupNavigation();
    setupCursor();
    setupScrollReveals();
    setupHeroMotion();
    setupCardMotion();

    // GSAP is an enhancement only. If it exists, add subtle scroll-linked parallax.
    if (window.gsap && window.ScrollTrigger && !reducedMotion) {
      try {
        window.gsap.registerPlugin(window.ScrollTrigger);
        window.gsap.utils.toArray(".hero-grid").forEach(el => {
          window.gsap.to(el, {
            yPercent: 14,
            ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
          });
        });
        window.addEventListener("load", () => window.ScrollTrigger.refresh(), { once: true });
      } catch (error) {
        console.warn("Optional GSAP enhancement skipped:", error);
      }
    }

    // Load WebGL background last; it can never block the page interactions.
    import("./assets/fluid.js").then(module => {
      module.initFluid();
      module.updateFluidTheme(false);
    }).catch(error => console.warn("Optional fluid background skipped:", error));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
