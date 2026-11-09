// Optional GSAP helpers. The portfolio's essential navigation and reveal fallback live in main.js.
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

export function initHero() {
  if (!gsap) return;
  gsap.fromTo(".hero-word", { yPercent: 115, rotate: 2 }, {
    yPercent: 0, rotate: 0, duration: 1.25, stagger: .13, ease: "expo.out"
  });
}

export function initSmoothScroll() {
  if (!gsap || !ScrollTrigger || !window.Lenis) return null;
  const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: .9 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
  return lenis;
}
