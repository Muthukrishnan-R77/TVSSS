/* ============================================================
   TVSSS MODERN — FILTERS
   Used on Products page for filtering/sorting
   ============================================================ */

(function () {
  'use strict';

  const filterBtns = document.querySelectorAll('[data-filter]');
  const filterTargets = document.querySelectorAll('[data-category]');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      filterTargets.forEach(target => {
        const cat = target.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          target.style.display = '';
          requestAnimationFrame(() => target.classList.add('is-visible'));
        } else {
          target.classList.remove('is-visible');
          target.style.display = 'none';
        }
      });
    });
  });

})();
