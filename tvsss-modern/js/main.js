/* ============================================================
   TVSSS MODERN — MAIN
   Entry point — initialises all modules
   ============================================================ */

(function () {
  'use strict';

  document.documentElement.classList.add('js-loaded');

  /* ── Hero slideshow ── */
  (function initHero() {
    const slides  = document.querySelectorAll('.hero-slide');
    const dots    = document.querySelectorAll('.hero-dot');
    const counter = document.getElementById('hero-slide-num');
    if (!slides.length) return;

    let current = 0;
    let timer;

    function goTo(idx) {
      slides[current].classList.remove('is-active');
      dots[current]?.classList.remove('is-active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current]?.classList.add('is-active');
      if (counter) counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    }

    function startAuto() { timer = setInterval(() => goTo(current + 1), 6000); }
    function stopAuto()  { clearInterval(timer); }

    goTo(0);
    startAuto();

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); });
    });

    /* Keyboard arrow */
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { stopAuto(); goTo(current + 1); startAuto(); }
      if (e.key === 'ArrowLeft')  { stopAuto(); goTo(current - 1); startAuto(); }
    });

    /* Touch swipe */
    let touchStartX = 0;
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      heroEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
      heroEl.addEventListener('touchend',   e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) { stopAuto(); goTo(dx < 0 ? current + 1 : current - 1); startAuto(); }
      }, { passive: true });
    }
  })();

  /* ── Segment tabs ── */
  (function initSegments() {
    const tabs   = document.querySelectorAll('.segment-tab');
    const panels = document.querySelectorAll('.segment-panel');
    if (!tabs.length) return;

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
        panels.forEach(p => p.classList.remove('is-active'));
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        panels[i]?.classList.add('is-active');
      });
    });
  })();

  /* ── Manufacturing horizontal drag scroll ── */
  (function initMfgScroll() {
    const el = document.querySelector('.mfg-scroll-container');
    if (!el) return;
    let isDown = false, startX, scrollLeft;
    el.addEventListener('mousedown',  e => { isDown = true; el.classList.add('active'); startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; });
    el.addEventListener('mouseleave', () => { isDown = false; el.classList.remove('active'); });
    el.addEventListener('mouseup',    () => { isDown = false; el.classList.remove('active'); });
    el.addEventListener('mousemove',  e => { if (!isDown) return; e.preventDefault(); const x = e.pageX - el.offsetLeft; el.scrollLeft = scrollLeft - (x - startX) * 1.5; });
  })();

  /* ── Simple count-up (fallback without GSAP) ── */
  (function initCountUp() {
    if (typeof ScrollTrigger !== 'undefined') return; /* GSAP handles it */
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        if (isNaN(target)) return;
        let start = 0;
        const duration = 1800;
        const step = target / (duration / 16);
        const interval = setInterval(() => {
          start = Math.min(start + step, target);
          el.textContent = Math.round(start).toLocaleString() + suffix;
          if (start >= target) clearInterval(interval);
        }, 16);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
      el.textContent = '0';
      observer.observe(el);
    });
  })();

  /* ── Timeline scroll + node activation ── */
  (function initTimeline() {
    const items = document.querySelectorAll('.timeline-item');
    if (!items.length) return;
    /* Activate first item on load */
    items[0].classList.add('is-active');

    const scrollWrap = document.querySelector('.timeline-scroll-wrap');
    if (!scrollWrap) return;
    scrollWrap.addEventListener('scroll', () => {
      const wrapRect = scrollWrap.getBoundingClientRect();
      items.forEach(item => {
        const r = item.getBoundingClientRect();
        const centerX = r.left + r.width / 2;
        if (centerX > wrapRect.left && centerX < wrapRect.left + wrapRect.width * 0.6) {
          items.forEach(i => i.classList.remove('is-active'));
          item.classList.add('is-active');
        }
      });
    }, { passive: true });
  })();

  /* ── Mobile nav sub-menu ── */
  /* Handled in navigation.js */

  /* ── Smooth internal links ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

})();
