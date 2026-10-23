/**
 * TVS Sensing Solutions — Premium 2026 Interactive Frontend
 * Animations: IntersectionObserver + CSS transitions (no GSAP required)
 * Features:
 *   1. Sticky header
 *   2. Mobile menu
 *   3. Scroll reveal
 *   4. Count-up stats
 *   5. Segment switcher
 *   6. Sticky product showcase
 *   7. Engineering progress timeline
 *   8. IIoT node animation
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ─────────────────────────────────────────────
   * 1. STICKY HEADER
   * ───────────────────────────────────────────── */
  const header = document.querySelector('.tvsss-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─────────────────────────────────────────────
   * 2. MOBILE MENU
   * ───────────────────────────────────────────── */
  const toggleBtn  = document.querySelector('.tvsss-mobile-toggle');
  const mobileMenu = document.querySelector('.tvsss-mobile-menu');
  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-active');
      toggleBtn.setAttribute('aria-expanded', open);
      toggleBtn.innerHTML = open ? '&#x2715;' : '&#x2630;';
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('is-active');
        toggleBtn.setAttribute('aria-expanded', false);
        toggleBtn.innerHTML = '&#x2630;';
      });
    });
  }

  /* ─────────────────────────────────────────────
   * 3. SCROLL REVEAL (data-reveal)
   * ───────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObs.observe(el));
  }

  /* ─────────────────────────────────────────────
   * 4. COUNT-UP ANIMATION
   * ───────────────────────────────────────────── */
  const countEls = document.querySelectorAll('.tvsss-count-up');
  if (countEls.length) {
    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

    const animateCount = (el) => {
      const target   = parseFloat(el.getAttribute('data-count'));
      const suffix   = el.getAttribute('data-suffix') || '';
      const prefix   = el.getAttribute('data-prefix') || '';
      const duration = 1800;
      const start    = performance.now();

      const tick = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = easeOutQuart(progress);
        const current  = Math.floor(eased * target);
        el.textContent = prefix + current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + target.toLocaleString() + suffix;
      };
      requestAnimationFrame(tick);
    };

    const countObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });

    countEls.forEach(el => countObs.observe(el));
  }

  /* ─────────────────────────────────────────────
   * 5. SEGMENT SWITCHER
   * ───────────────────────────────────────────── */
  const categoryData = {
    '2-wheeler': {
      title:  '2 Wheeler Automotive Solutions',
      desc:   'High-precision speed sensors, position sensors, temperature sensors, and switches engineered for two-wheelers and scooters under extreme environmental conditions.',
      badge:  '01 / 09 &bull; TWO WHEELER MOBILITY',
      img:    'assets/images/industry/industry-two-wheeler.jpg'
    },
    '3-wheeler': {
      title:  '3 Wheeler Automotive Solutions',
      desc:   'Engineered sensor systems, fuel level sensors, thermal cut-outs, and robust electro-mechanical switches for passenger and commercial 3-wheelers.',
      badge:  '02 / 09 &bull; THREE WHEELER MOBILITY',
      img:    'assets/images/industry/industry-three-wheeler.jpg'
    },
    '4-wheeler': {
      title:  '4 Wheeler Passenger Vehicles',
      desc:   'IATF 16949 certified automotive sensors including brake light switches, reverse light switches, speed sensors, and EV battery management sensors.',
      badge:  '03 / 09 &bull; PASSENGER AUTOMOTIVE',
      img:    'assets/images/industry/industry-four-wheeler.jpg'
    },
    'commercial': {
      title:  'Commercial Vehicles & Heavy Duty',
      desc:   'Heavy-duty solenoid assemblies, pressure switches, speed sensors, and ruggedized electronic controls for trucks, buses, and haulage vehicles.',
      badge:  '04 / 09 &bull; COMMERCIAL HEAVY DUTY',
      img:    'assets/images/industry/industry-commercial.jpg'
    },
    'off-road': {
      title:  'Off-Road & Agricultural Vehicles',
      desc:   'Precision agricultural sensors, hydraulic solenoids, rotary switches, and position monitors engineered for tractors and construction equipment.',
      badge:  '05 / 09 &bull; OFF-ROAD & TRACTORS',
      img:    'assets/images/industry/industry-offroad.jpg'
    },
    'input': {
      title:  'Computer Input Devices',
      desc:   'High-reliability switches, optical encoders, and custom input mechanisms for industrial terminals, computing hardware, and specialized equipment.',
      badge:  '06 / 09 &bull; COMPUTING INTERFACES',
      img:    'assets/images/industry/industry-computer-input.jpg'
    },
    'industrial': {
      title:  'Industrial Products & Automation',
      desc:   'Smart sensing solutions, industrial switches, solenoids, and custom electro-mechanical sub-assemblies for factory machinery.',
      badge:  '07 / 09 &bull; FACTORY AUTOMATION',
      img:    'assets/images/industry/industry-industrial.jpg'
    },
    'appliance': {
      title:  'Home & Commercial Appliances',
      desc:   'Custom switches, temperature cut-offs, reed switches, and sensor modules for washing machines, water heaters, and home appliances.',
      badge:  '08 / 09 &bull; APPLIANCE CONTROLS',
      img:    'assets/images/industry/industry-appliance.jpg'
    },
    'iot': {
      title:  'IIoT & Smart Connected Solutions',
      desc:   'Wireless sensor nodes, cloud-connected gateways, edge sensing devices, and Industry 4.0 monitoring hardware for smart factories.',
      badge:  '09 / 09 &bull; INDUSTRY 4.0 IIOT',
      img:    'assets/images/industry/industry-iot.jpg'
    }
  };

  const categoryItems = document.querySelectorAll('.tvsss-category-item');
  const segmentTitle  = document.getElementById('tvsss-segment-title');
  const segmentDesc   = document.getElementById('tvsss-segment-desc');
  const segmentBadge  = document.getElementById('tvsss-segment-badge');
  const segmentImg    = document.getElementById('tvsss-segment-img');
  const segmentImgWrap = document.querySelector('.tvsss-segment-panel__img');

  const switchSegment = (key) => {
    const data = categoryData[key];
    if (!data) return;

    // Fade out image
    if (segmentImgWrap) segmentImgWrap.classList.add('is-changing');

    setTimeout(() => {
      if (segmentTitle) segmentTitle.textContent = data.title;
      if (segmentDesc)  segmentDesc.textContent  = data.desc;
      if (segmentBadge) segmentBadge.innerHTML   = data.badge;
      if (segmentImg)   segmentImg.src           = data.img;
      if (segmentImgWrap) segmentImgWrap.classList.remove('is-changing');
    }, 250);
  };

  categoryItems.forEach(item => {
    item.addEventListener('click', function () {
      const key = this.getAttribute('data-segment');
      categoryItems.forEach(ci => ci.classList.remove('is-active'));
      this.classList.add('is-active');
      switchSegment(key);
    });
  });

  /* ─────────────────────────────────────────────
   * 6. STICKY PRODUCT SHOWCASE
   * Highlights product entry when its image is in view
   * ───────────────────────────────────────────── */
  const productEntries  = document.querySelectorAll('.tvsss-product-entry');
  const productStageImg = document.querySelector('.tvsss-products-stage__img');
  const productStageTag = document.querySelector('.tvsss-products-stage__tag');
  const productStage    = document.querySelector('.tvsss-products-stage');

  const productImages = {
    'ev':       'wp-content/uploads/2022/03/EV-Solutions-1024x1024.jpg',
    'sensors':  'wp-content/uploads/2022/03/Sensors-sensing-solutions-1024x1024.jpg',
    'solenoids':'wp-content/uploads/2022/03/Solenoids-1024x1024.jpg',
    'elec-mech':'wp-content/uploads/2022/03/Electro-Mechanical-Assembly-1024x1024.jpg',
    'switches': 'wp-content/uploads/2022/03/Switches-Controls-1024x1024.jpg',
    'computer': 'wp-content/uploads/2022/03/Computer-Input-devices-1024x1024.jpg',
    'iot':      'wp-content/uploads/2022/03/IOT-4.0-Products-1024x1024.jpg'
  };

  const activateEntry = (key, title, entryEl) => {
    productEntries.forEach(e => e.classList.remove('is-active'));
    if (entryEl) entryEl.classList.add('is-active');
    if (productStage) productStage.classList.add('is-transitioning');

    setTimeout(() => {
      if (productStageImg && productImages[key]) {
        productStageImg.src = productImages[key];
        productStageImg.alt = title || '';
      }
      if (productStageTag) productStageTag.textContent = title || '';
      if (productStage) productStage.classList.remove('is-transitioning');
    }, 250);
  };

  if (productEntries.length && productStageImg) {
    // Click to activate
    productEntries.forEach(entry => {
      entry.addEventListener('click', function () {
        const key   = this.getAttribute('data-product');
        const title = this.querySelector('.tvsss-product-entry__title')?.textContent || '';
        activateEntry(key, title, this);
      });
    });

    // IntersectionObserver — auto-highlight as user scrolls
    const productListObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const key   = e.target.getAttribute('data-product');
          const title = e.target.querySelector('.tvsss-product-entry__title')?.textContent || '';
          activateEntry(key, title, e.target);
        }
      });
    }, { threshold: 0.5, rootMargin: '-10% 0px -40% 0px' });

    productEntries.forEach(e => productListObs.observe(e));

    // Activate first by default
    const firstEntry = productEntries[0];
    if (firstEntry) {
      firstEntry.classList.add('is-active');
      const key   = firstEntry.getAttribute('data-product');
      const title = firstEntry.querySelector('.tvsss-product-entry__title')?.textContent || '';
      if (productStageImg && productImages[key]) productStageImg.src = productImages[key];
      if (productStageTag) productStageTag.textContent = title;
    }
  }

  /* ─────────────────────────────────────────────
   * 7. ENGINEERING TIMELINE PROGRESS
   * ───────────────────────────────────────────── */
  const engSection  = document.querySelector('.tvsss-eng-section');
  const engProgress = document.querySelector('.tvsss-eng-progress');
  const engSteps    = document.querySelectorAll('.tvsss-eng-step');

  if (engSection && engProgress) {
    const engObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          engProgress.classList.add('is-full');
          engSteps.forEach((step, i) => {
            setTimeout(() => {
              step.classList.add('is-active');
            }, i * 300);
          });
          engObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    engObs.observe(engSection);
  }

  /* ─────────────────────────────────────────────
   * 8. IIOT NODE ANIMATION
   * ───────────────────────────────────────────── */
  const iiotNodes   = document.querySelectorAll('.tvsss-iiot-node');
  const iiotSection = document.querySelector('.tvsss-iiot-section');

  if (iiotNodes.length && iiotSection) {
    const iiotObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          iiotNodes.forEach((node, i) => {
            setTimeout(() => node.classList.add('is-lit'), i * 280);
          });
          iiotObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    iiotObs.observe(iiotSection);
  }

  /* ─────────────────────────────────────────────
   * 9. PARALLAX ON HERO BACKGROUND
   * ───────────────────────────────────────────── */
  const heroBg = document.querySelector('.tvsss-hero__bg-img');
  if (heroBg) {
    const onScrollParallax = () => {
      const scrollY = window.scrollY;
      // Subtle shift: max 80px drift over viewport height
      const shift = Math.min(scrollY * 0.25, 80);
      heroBg.style.transform = `scale(1.06) translateY(${shift}px)`;
    };
    window.addEventListener('scroll', onScrollParallax, { passive: true });
  }

  /* ─────────────────────────────────────────────
   * 10. REDUCE MOTION SUPPORT
   * ───────────────────────────────────────────── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.classList.add('is-visible');
    });
    if (heroBg) heroBg.style.animation = 'none';
  }
});
