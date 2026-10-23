/* ============================================================
   TVSSS MODERN — NAVIGATION
   ============================================================ */

(function () {
  'use strict';

  const header     = document.getElementById('site-header');
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobile-nav');
  const megaMenus  = document.querySelectorAll('.mega-menu');
  const navItems   = document.querySelectorAll('.nav-item[data-mega]');
  const mobileToggles = document.querySelectorAll('.mobile-nav-toggle');

  let lastScrollY = 0;
  let ticking = false;
  let activeMega = null;

  /* ── Header scroll behaviour ── */
  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }

  function updateHeader() {
    if (lastScrollY > 60) {
      header.classList.remove('site-header--transparent');
      header.classList.add('site-header--solid-dark');
    } else {
      header.classList.add('site-header--transparent');
      header.classList.remove('site-header--solid-dark');
    }
    ticking = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateHeader();

  /* ── Mega menu ── */
  function openMega(item) {
    if (activeMega && activeMega !== item) closeMega(activeMega);
    const menuId = item.getAttribute('data-mega');
    const menu   = document.getElementById(menuId);
    if (!menu) return;
    item.classList.add('is-open');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    activeMega = item;
  }

  function closeMega(item) {
    const menuId = item.getAttribute('data-mega');
    const menu   = document.getElementById(menuId);
    if (!menu) return;
    item.classList.remove('is-open');
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    if (activeMega === item) activeMega = null;
  }

  navItems.forEach(item => {
    item.addEventListener('mouseenter', () => openMega(item));
    item.addEventListener('mouseleave', () => {
      setTimeout(() => {
        const menu = document.getElementById(item.getAttribute('data-mega'));
        if (menu && !menu.matches(':hover')) closeMega(item);
      }, 80);
    });
    item.querySelector('.nav-link').addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.classList.contains('is-open') ? closeMega(item) : openMega(item);
      }
      if (e.key === 'Escape') closeMega(item);
    });
  });

  megaMenus.forEach(menu => {
    menu.addEventListener('mouseleave', () => {
      const parentItem = document.querySelector(`[data-mega="${menu.id}"]`);
      if (parentItem) {
        setTimeout(() => {
          if (!parentItem.matches(':hover')) closeMega(parentItem);
        }, 80);
      }
    });
  });

  /* close on click outside */
  document.addEventListener('click', e => {
    if (activeMega && !activeMega.contains(e.target)) {
      closeMega(activeMega);
    }
  });

  /* Escape closes all */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activeMega) closeMega(activeMega);
  });

  /* ── Mobile hamburger ── */
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Close on backdrop click */
    mobileNav.addEventListener('click', e => {
      if (e.target === mobileNav) {
        hamburger.classList.remove('is-open');
        mobileNav.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Mobile accordion sub-menus ── */
  mobileToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const subMenu = document.getElementById(toggle.getAttribute('aria-controls'));
      const isOpen  = toggle.classList.toggle('is-open');
      if (subMenu) subMenu.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });
  });

  /* ── Active nav link ── */
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link, .mega-link, .footer-link').forEach(link => {
    if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href').replace('../', '/').replace('.html', ''))) {
      link.classList.add('nav-link--active');
    }
  });

})();
