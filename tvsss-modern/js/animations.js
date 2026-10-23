/* ============================================================
   TVSSS MODERN — SCROLL ANIMATIONS
   Uses IntersectionObserver (fallback) + GSAP ScrollTrigger if available
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── IntersectionObserver fallback (no GSAP required) ── */
  if (!prefersReducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
  } else {
    /* immediately reveal all for reduced motion users */
    document.querySelectorAll('[data-animate]').forEach(el => el.classList.add('is-visible'));
  }

  /* ── GSAP ScrollTrigger (if GSAP loaded) ── */
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion) return;

    /* Hero Ken-Burns is handled by CSS animation on .is-active class */

    /* About image parallax */
    const aboutImg = document.querySelector('.about-image-wrap img');
    if (aboutImg) {
      gsap.to(aboutImg, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.about-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    }

    /* Stat number count-up */
    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.val).toLocaleString() + suffix;
            }
          });
        }
      });
    });

    /* Timeline progressive activation */
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length) {
      timelineItems.forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'left 70%',
          horizontal: true,
          scroller: '.timeline-scroll-wrap',
          once: true,
          onEnter: () => item.classList.add('is-active')
        });
      });
    }

    /* Section heading line draw */
    document.querySelectorAll('.section-heading-wrap').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => el.classList.add('is-visible')
      });
    });

    /* IIoT flow step stagger */
    const iiotSteps = document.querySelectorAll('.iiot-flow-step');
    if (iiotSteps.length) {
      gsap.from(iiotSteps, {
        opacity: 0,
        x: -30,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.iiot-flow',
          start: 'top 75%',
          once: true
        }
      });
    }
  }

  /* Wait for DOM ready + GSAP (CDN async) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initGSAP, 100));
  } else {
    setTimeout(initGSAP, 100);
  }

})();
