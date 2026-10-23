/* tvsss-global.js — Shared Master Header/Footer & Interaction Behaviour for ALL Pages */
(function () {
  'use strict';

  // Mark JS as loaded for animation system
  document.documentElement.classList.add('js-reveal');

  /* ═══════════════════════════════════════════════════════════
     ONE SINGLE SHARED NAVBAR COMPONENT (Master Source of Truth)
  ═══════════════════════════════════════════════════════════════ */
  function getBasePath() {
    var scripts = document.querySelectorAll('script[src*="tvsss-global.js"]');
    if (scripts.length > 0) {
      var src = scripts[0].getAttribute('src') || '';
      var idx = src.indexOf('tvsss-global.js');
      if (idx > 0) {
        return src.substring(0, idx);
      }
    }
    return '';
  }

  function getActiveSection() {
    var path = (window.location.pathname || '').toLowerCase();
    if (path.indexOf('about-us') !== -1) return 'about-us';
    if (path.indexOf('tvs-group') !== -1 || path.indexOf('tvsgroup') !== -1) return 'tvs-group';
    if (path.indexOf('products') !== -1) return 'products';
    if (path.indexOf('automations') !== -1) return 'automations';
    if (path.indexOf('iiot') !== -1) return 'iiot';
    if (path.indexOf('manufacturing-excellence') !== -1) return 'manufacturing-excellence';
    if (path.indexOf('media') !== -1) return 'media';
    if (path.indexOf('customers') !== -1) return 'customers';
    if (path.indexOf('careers') !== -1) return 'careers';
    if (path.indexOf('reach-us') !== -1) return 'reach-us';
    return '';
  }

  function createMasterNavbarElements() {
    var base = getBasePath();
    var active = getActiveSection();

    var topbarHtml =
      '<div class="g-topbar" id="gTopbar">' +
        '<div class="g-topbar__inner">' +
          '<div class="g-topbar__social">' +
            '<a href="https://www.facebook.com/TVS-Sensing-Solutions-Private-Limited-102082955438831" target="_blank" rel="noopener noreferrer" class="g-topbar__social-link" aria-label="Facebook">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
            '</a>' +
            '<a href="https://twitter.com/TVSSS3" target="_blank" rel="noopener noreferrer" class="g-topbar__social-link" aria-label="Twitter">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' +
            '</a>' +
            '<a href="https://www.linkedin.com/company/tvs-sensing-solutions/" target="_blank" rel="noopener noreferrer" class="g-topbar__social-link" aria-label="LinkedIn">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>' +
            '</a>' +
          '</div>' +
          '<div class="g-topbar__contact">' +
            '<a href="tel:+914522911444" class="g-topbar__link" aria-label="Call TVS Sensing Solutions">' +
              '<span class="g-topbar__label">Office:</span> <span class="g-topbar__value">+91 452-2911444</span>' +
            '</a>' +
            '<span class="g-topbar__divider" aria-hidden="true">|</span>' +
            '<a href="mailto:contact@tvsss.co.in" class="g-topbar__link" aria-label="Email TVS Sensing Solutions">' +
              '<span class="g-topbar__label">Mail Id:</span> <span class="g-topbar__value">contact@tvsss.co.in</span>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    var headerHtml =
      '<header class="g-header" id="gHeader">' +
        '<div class="g-header__inner">' +
          '<a href="' + base + 'index.html" class="g-logo" aria-label="TVS Sensing Solutions Home">' +
            '<img src="' + base + 'wp-content/uploads/2022/01/tvs-logo-300x150.png" alt="TVS Sensing Solutions Logo">' +
            '<div class="g-brand-lockup">' +
              '<span class="g-brand-name">TVS SENSING SOLUTIONS</span>' +
              '<span class="g-brand-tagline">A TVS GROUP COMPANY</span>' +
            '</div>' +
          '</a>' +
          '<nav class="g-nav" aria-label="Main Navigation">' +
            '<a href="' + base + 'about-us/index.html" class="g-nav__link' + (active === 'about-us' ? ' active' : '') + '">About Us</a>' +
            '<a href="' + base + 'tvs-group/index.html" class="g-nav__link' + (active === 'tvs-group' ? ' active' : '') + '">TVS Group</a>' +
            '<a href="' + base + 'products/index.html" class="g-nav__link' + (active === 'products' ? ' active' : '') + '">Products &amp; Solutions</a>' +
            '<a href="' + base + 'automations/index.html" class="g-nav__link' + (active === 'automations' ? ' active' : '') + '">Automations</a>' +
            '<a href="' + base + 'iiot/index.html" class="g-nav__link' + (active === 'iiot' ? ' active' : '') + '">IIoT 4.0</a>' +
            '<a href="' + base + 'manufacturing-excellence/index.html" class="g-nav__link' + (active === 'manufacturing-excellence' ? ' active' : '') + '">Manufacturing Excellence</a>' +
            '<a href="' + base + 'media/index.html" class="g-nav__link' + (active === 'media' ? ' active' : '') + '">Media-TVSS</a>' +
            '<a href="' + base + 'customers/index.html" class="g-nav__link' + (active === 'customers' ? ' active' : '') + '">Customers</a>' +
            '<a href="' + base + 'careers/index.html" class="g-nav__link' + (active === 'careers' ? ' active' : '') + '">Careers</a>' +
            '<a href="' + base + 'reach-us/index.html" class="g-nav__link' + (active === 'reach-us' ? ' active' : '') + '">Reach Us</a>' +
          '</nav>' +
          '<button class="g-ham" id="gHam" aria-label="Toggle Navigation" aria-expanded="false">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
        '<nav class="g-mobile-nav" id="gMobileNav" aria-label="Mobile Navigation">' +
          '<a href="' + base + 'about-us/index.html" class="g-nav__link' + (active === 'about-us' ? ' active' : '') + '">About Us</a>' +
          '<a href="' + base + 'tvs-group/index.html" class="g-nav__link' + (active === 'tvs-group' ? ' active' : '') + '">TVS Group</a>' +
          '<a href="' + base + 'products/index.html" class="g-nav__link' + (active === 'products' ? ' active' : '') + '">Products &amp; Solutions</a>' +
          '<a href="' + base + 'automations/index.html" class="g-nav__link' + (active === 'automations' ? ' active' : '') + '">Automations</a>' +
          '<a href="' + base + 'iiot/index.html" class="g-nav__link' + (active === 'iiot' ? ' active' : '') + '">IIoT 4.0</a>' +
          '<a href="' + base + 'manufacturing-excellence/index.html" class="g-nav__link' + (active === 'manufacturing-excellence' ? ' active' : '') + '">Manufacturing Excellence</a>' +
          '<a href="' + base + 'media/index.html" class="g-nav__link' + (active === 'media' ? ' active' : '') + '">Media-TVSS</a>' +
          '<a href="' + base + 'customers/index.html" class="g-nav__link' + (active === 'customers' ? ' active' : '') + '">Customers</a>' +
          '<a href="' + base + 'careers/index.html" class="g-nav__link' + (active === 'careers' ? ' active' : '') + '">Careers</a>' +
          '<a href="' + base + 'reach-us/index.html" class="g-nav__link' + (active === 'reach-us' ? ' active' : '') + '">Reach Us</a>' +
        '</nav>' +
      '</header>';

    return { topbar: topbarHtml, header: headerHtml };
  }

  function mountMasterNavbar() {
    // If master navbar already initialized and bound, simply update active state
    if (document.body.getAttribute('data-tvs-navbar-mounted') === 'true') {
      highlightActiveNavigation();
      return;
    }

    var existingTopbars = document.querySelectorAll('.g-topbar, #gTopbar');
    var existingHeaders = document.querySelectorAll('.g-header, #gHeader, header.site-header, header#masthead');
    var existingMobileNavs = document.querySelectorAll('.g-mobile-nav, #gMobileNav, #mobileNav');

    // Remove any catalogue pdf buttons that might linger
    document.querySelectorAll('.g-header-pdf-btn, .catalogue-btn').forEach(function(btn) {
      btn.remove();
    });

    var hasStandardMarkup = existingTopbars.length > 0 &&
                            existingHeaders.length > 0 &&
                            document.querySelector('.g-header__inner') &&
                            document.querySelector('.g-nav');

    if (!hasStandardMarkup) {
      var navData = createMasterNavbarElements();
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = navData.topbar + navData.header;

      var targetMount = existingTopbars[0] || existingHeaders[0];
      var insertParent = targetMount && targetMount.parentNode ? targetMount.parentNode : document.body;
      var insertRef = targetMount || document.body.firstChild;

      while (tempDiv.firstChild) {
        insertParent.insertBefore(tempDiv.firstChild, insertRef);
      }

      existingTopbars.forEach(function (el) { el.remove(); });
      existingHeaders.forEach(function (el) { el.remove(); });
      existingMobileNavs.forEach(function (el) { el.remove(); });
    }

    document.body.setAttribute('data-tvs-navbar-mounted', 'true');
    highlightActiveNavigation();
    bindNavbarEvents();
  }

  function highlightActiveNavigation() {
    var active = getActiveSection();
    if (!active) return;
    document.querySelectorAll('.g-nav__link, .g-nav-link, .g-mobile-nav-link').forEach(function (link) {
      var href = (link.getAttribute('href') || '').toLowerCase();
      var text = (link.textContent || '').trim().toLowerCase();

      var isMatch = false;
      if (active === 'about-us' && (href.indexOf('about-us') !== -1 || text === 'about us')) isMatch = true;
      else if (active === 'tvs-group' && (href.indexOf('tvs-group') !== -1 || href.indexOf('tvsgroup') !== -1 || text === 'tvs group')) isMatch = true;
      else if (active === 'products' && (href.indexOf('products') !== -1 || text.indexOf('products') !== -1)) isMatch = true;
      else if (active === 'automations' && (href.indexOf('automations') !== -1 || text === 'automations')) isMatch = true;
      else if (active === 'iiot' && (href.indexOf('iiot') !== -1 || text.indexOf('iiot') !== -1)) isMatch = true;
      else if (active === 'manufacturing-excellence' && (href.indexOf('manufacturing-excellence') !== -1 || text.indexOf('manufacturing') !== -1)) isMatch = true;
      else if (active === 'media' && (href.indexOf('media') !== -1 || text.indexOf('media') !== -1)) isMatch = true;
      else if (active === 'customers' && (href.indexOf('customers') !== -1 || text === 'customers')) isMatch = true;
      else if (active === 'careers' && (href.indexOf('careers') !== -1 || text === 'careers')) isMatch = true;
      else if (active === 'reach-us' && (href.indexOf('reach-us') !== -1 || text.indexOf('reach') !== -1)) isMatch = true;

      if (isMatch) {
        link.classList.add('active');
        link.classList.add('g-active');
      } else {
        link.classList.remove('active');
        link.classList.remove('g-active');
      }
    });
  }

  function bindNavbarEvents() {
    /* ── HEADER SCROLL ──────────────────────────────────────── */
    var hdr = document.querySelector('.g-header');
    if (hdr) {
      window.addEventListener('scroll', function () {
        hdr.classList.toggle('scrolled', window.scrollY > 40);
      }, { passive: true });
    }

    /* ── MOBILE MENU (Works with both id & class selectors) ──── */
    var hams = document.querySelectorAll('.g-ham, #gHam');
    var mobs = document.querySelectorAll('.g-mobile-nav, #gMobileNav, #mobileNav');
    hams.forEach(function (ham) {
      // Avoid duplicate event listener
      if (ham.getAttribute('data-tvs-bound') === 'true') return;
      ham.setAttribute('data-tvs-bound', 'true');

      ham.addEventListener('click', function (e) {
        e.stopPropagation();
        mobs.forEach(function (mob) {
          var open = mob.classList.toggle('open');
          ham.classList.toggle('open', open);
          ham.setAttribute('aria-expanded', String(open));
        });
      });
    });

    mobs.forEach(function (mob) {
      if (mob.getAttribute('data-tvs-bound') === 'true') return;
      mob.setAttribute('data-tvs-bound', 'true');

      mob.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          mob.classList.remove('open');
          hams.forEach(function (h) {
            h.classList.remove('open');
            h.setAttribute('aria-expanded', 'false');
          });
        });
      });
    });
  }

  // Mount navbar as early as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountMasterNavbar);
  } else {
    mountMasterNavbar();
  }

  /* ── INTERSECTION REVEAL WITH FAIL-SAFE ──────────────────── */
  var revealEls = document.querySelectorAll('[data-g-reveal], [data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('g-vis');
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 40px 0px' });

    revealEls.forEach(function (el) {
      io.observe(el);
    });

    setTimeout(function () {
      revealEls.forEach(function (el) {
        el.classList.add('g-vis');
        el.classList.add('is-visible');
      });
    }, 1200);
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('g-vis');
      el.classList.add('is-visible');
    });
  }

  /* ── COUNT UP ANIMATION ──────────────────────────────────── */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function startCount(el) {
    var target = parseInt(el.dataset.target || el.dataset.count || el.dataset.gCount, 10);
    if (isNaN(target)) return;
    var suffix = el.dataset.suffix || el.dataset.gSuffix || '';
    var dur = 1400;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(easeOut(p) * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString() + suffix;
    }
    requestAnimationFrame(tick);
  }
  var countTriggers = document.querySelectorAll('.g-count-trigger, .tvsss-count-up, .au-count-up');
  if ('IntersectionObserver' in window && countTriggers.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (e.target.hasAttribute('data-target') || e.target.hasAttribute('data-count') || e.target.hasAttribute('data-g-count')) {
            startCount(e.target);
          }
          e.target.querySelectorAll('[data-target], [data-count], [data-g-count]').forEach(startCount);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    countTriggers.forEach(function (el) {
      cio.observe(el);
    });
  }

  /* ── PARALLAX (Subtle & Professional) ─────────────────────── */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var pImgs = document.querySelectorAll('[data-g-parallax]');
    if (pImgs.length) {
      window.addEventListener('scroll', function () {
        pImgs.forEach(function (img) {
          var sec = img.closest('section') || img.parentElement;
          var rect = sec.getBoundingClientRect();
          var mid = rect.top + rect.height / 2 - window.innerHeight / 2;
          img.style.transform = 'translateY(' + (mid * 0.08) + 'px) scale(1.05)';
        });
      }, { passive: true });
    }
  }

})();
