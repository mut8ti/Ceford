/* Smooth scrolling (Lenis) + scroll-triggered reveals (GSAP ScrollTrigger).
 *
 * Pages never import GSAP directly. They mark up intent instead:
 *
 *   data-reveal              fade + rise as it enters the viewport
 *   data-reveal="left|right" slide in from that side
 *   data-reveal="scale"      settle up from slightly small
 *   data-reveal-group        stagger this element's direct children
 *
 * Anything hidden here is hidden by JS-set CSS (html.js-motion), so with JS
 * off or blocked the page renders fully visible — the content is never
 * dependent on the animation running.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const DISTANCE = 28;

const FROM = {
  up:    { opacity: 0, y: DISTANCE },
  left:  { opacity: 0, x: -DISTANCE },
  right: { opacity: 0, x: DISTANCE },
  scale: { opacity: 0, scale: 0.96 },
};

const TO = { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.7, ease: 'power2.out' };

/* ---------- Smooth scroll ----------
   Lenis takes over the scroll position, so ScrollTrigger has to be told about
   it or every trigger fires at the wrong offset. */
function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.05,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // Touch stays native: syncTouch defaults to false, and hijacking scroll on
    // phones feels broken. (smoothTouch was removed in Lenis v1 — don't re-add it.)
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Make in-page anchors go through Lenis so they ease instead of jumping.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -100 });
  });

  return lenis;
}

/* ---------- Reveals ---------- */
function initReveals() {
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    const from = FROM[el.dataset.reveal] || FROM.up;
    gsap.fromTo(el, from, {
      ...TO,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
    const items = gsap.utils.toArray(group.children);
    if (!items.length) return;
    const from = FROM[group.dataset.revealGroup] || FROM.up;
    gsap.fromTo(items, from, {
      ...TO,
      stagger: 0.09,
      scrollTrigger: { trigger: group, start: 'top 88%', once: true },
    });
  });
}

/* ---------- Hero intro ----------
   Deliberately does not touch the <h1>: it is the LCP element, and hiding it
   to animate it in would delay the metric we spent effort protecting. */
function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const bits = hero.querySelectorAll('[data-hero-item]');
  if (!bits.length) return;
  gsap.fromTo(bits, { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.12, delay: 0.15 });
}

initSmoothScroll();
initHero();
initReveals();

// Images settle after first paint and shift trigger positions with them.
window.addEventListener('load', () => ScrollTrigger.refresh());
