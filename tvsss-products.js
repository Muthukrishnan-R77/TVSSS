/* ============================================================
   TVSSS PRODUCTS ENGINE — tvsss-products.js
   Instant Search, Catalogue Filtering, Dynamic Routing,
   Enquiry Modal & Related Products Handler
   ============================================================ */

(function () {
  'use strict';

  // Determine relative root based on script tag src or pathname
  function getRootDepth() {
    // 1. Check if explicitly set on a meta tag
    var metaRoot = document.querySelector('meta[name="tvsss-root"]');
    if (metaRoot && metaRoot.getAttribute('content')) {
      return metaRoot.getAttribute('content');
    }

    // 2. Check the script tag that loaded tvsss-products.js
    var currentScript = document.currentScript;
    if (!currentScript) {
      var scripts = document.querySelectorAll('script[src*="tvsss-products.js"]');
      if (scripts.length > 0) currentScript = scripts[scripts.length - 1];
    }
    if (currentScript) {
      var src = currentScript.getAttribute('src') || '';
      var match = src.match(/^(\.\.\/|\.\/)+/);
      if (match) return match[0];
      if (src.indexOf('/') === -1) return './';
    }

    // 3. Fallback based on pathname
    var path = window.location.pathname.replace(/\\/g, '/');
    var knownCategories = [
      'sensors-sensing-solutions', 'solenoids', 'switches-controls',
      'electro-mechanical-assembly', 'electric-vehicles-solutions',
      'computer-input-devices', 'iot-4-0-products', 'products'
    ];
    for (var k = 0; k < knownCategories.length; k++) {
      var cat = knownCategories[k];
      var idx = path.lastIndexOf('/' + cat + '/');
      if (idx !== -1) {
        var sub = path.substring(idx + ('/' + cat + '/').length);
        var subSegments = sub.split('/').filter(Boolean);
        if (subSegments.length > 0 && subSegments[subSegments.length - 1].indexOf('.html') !== -1) {
          subSegments.pop();
        }
        var depth = 1 + subSegments.length;
        var p = '';
        for (var d = 0; d < depth; d++) p += '../';
        return p;
      }
    }

    return './';
  }

  var ROOT_PREFIX = getRootDepth();

  // Helper to normalize asset/page URL
  function resolveUrl(relativeUrl) {
    if (!relativeUrl) return '#';
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://') || relativeUrl.startsWith('mailto:') || relativeUrl.startsWith('tel:')) {
      return relativeUrl;
    }
    var clean = relativeUrl.replace(/^(\.\.\/)+/, '').replace(/^\.?\//, '');
    return ROOT_PREFIX + clean;
  }

  // Safe catalogue access
  var catalogue = window.TVSSS_CATALOGUE || [];
  var categories = window.TVSSS_CATEGORIES || [];

  /* ── 1. INSTANT SEARCH ENGINE ───────────────────────────── */
  function initSearch() {
    var searchInputs = document.querySelectorAll('.p-search-input, #pSearchInput, #pCatalogueSearch');
    if (!searchInputs.length) return;

    searchInputs.forEach(function (input) {
      var wrapper = input.closest('.p-search-box') || input.parentElement;
      var dropdown = wrapper.querySelector('.p-search-dropdown');
      var clearBtn = wrapper.querySelector('.p-search-clear');

      if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'p-search-dropdown';
        wrapper.appendChild(dropdown);
      }

      function executeSearch(query) {
        var q = (query || '').trim().toLowerCase();
        if (!q) {
          dropdown.innerHTML = '';
          dropdown.classList.remove('active');
          if (clearBtn) clearBtn.style.display = 'none';
          return;
        }

        if (clearBtn) clearBtn.style.display = 'inline-flex';

        // Filter matching products
        var matches = catalogue.filter(function (p) {
          var titleMatch = p.title.toLowerCase().indexOf(q) !== -1;
          var catMatch = p.categoryName.toLowerCase().indexOf(q) !== -1;
          var slugMatch = p.slug.toLowerCase().indexOf(q) !== -1;
          var specMatch = (p.features || []).some(function (f) { return f.toLowerCase().indexOf(q) !== -1; });
          var marketMatch = (p.markets || []).some(function (m) { return m.toLowerCase().indexOf(q) !== -1; });
          var appMatch = (p.applications || []).some(function (a) { return a.toLowerCase().indexOf(q) !== -1; });
          var segMatch = (p.segments || []).some(function (s) { return s.toLowerCase().indexOf(q) !== -1; });
          return titleMatch || catMatch || slugMatch || specMatch || marketMatch || appMatch || segMatch;
        });

        if (matches.length === 0) {
          dropdown.innerHTML = '<div class="p-search-no-results">' +
            '<p style="font-weight: 600; margin-bottom: 0.25rem;">No direct matching products found for "' + escapeHtml(query) + '"</p>' +
            '<p style="font-size: 0.8125rem;">Try searching for <em>coil, sensor, switch, abs, atex, speed, valve</em></p>' +
            '</div>';
          dropdown.classList.add('active');
          return;
        }

        var html = '<ul class="p-search-results-list">';
        matches.slice(0, 7).forEach(function (item) {
          var targetUrl = resolveUrl(item.url);
          var imgUrl = resolveUrl(item.image);
          html += '<li>' +
            '<a href="' + targetUrl + '" class="p-search-result-item">' +
            '<img src="' + imgUrl + '" alt="' + escapeHtml(item.title) + '" class="p-search-result-thumb" loading="lazy" onerror="this.onerror=null;this.src=\'' + resolveUrl('wp-content/uploads/2022/03/Sensors-sensing-solutions-300x300.jpg') + '\'">' +
            '<div class="p-search-result-info">' +
            '<div class="p-search-result-cat">' + escapeHtml(item.categoryName) + '</div>' +
            '<div class="p-search-result-title">' + highlightMatch(item.title, q) + '</div>' +
            '<div class="p-search-result-meta">' + escapeHtml(item.shortDesc || item.categoryName) + '</div>' +
            '</div>' +
            '<span class="p-search-result-arrow">&rarr;</span>' +
            '</a>' +
            '</li>';
        });

        if (matches.length > 7) {
          html += '<li style="padding: 0.75rem 1.25rem; text-align: center; background: #F8FAFC; border-top: 1px solid #E2E8F0;">' +
            '<span style="font-size: 0.8125rem; color: #64748B;">+' + (matches.length - 7) + ' more matches available in catalogue</span>' +
            '</li>';
        }

        html += '</ul>';
        dropdown.innerHTML = html;
        dropdown.classList.add('active');
      }

      input.addEventListener('input', function () {
        executeSearch(this.value);
        // Also trigger catalogue filter if on catalogue page
        var catalogueGrid = document.getElementById('pCatalogueGrid');
        if (catalogueGrid && window.pFilterCatalogue) {
          window.pFilterCatalogue({ search: this.value });
        }
      });

      input.addEventListener('focus', function () {
        if (this.value.trim()) executeSearch(this.value);
      });

      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          input.value = '';
          executeSearch('');
          input.focus();
          if (window.pFilterCatalogue) window.pFilterCatalogue({ search: '' });
        });
      }

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!wrapper.contains(e.target)) {
          dropdown.classList.remove('active');
        }
      });

      // Keyboard navigation
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          dropdown.classList.remove('active');
        } else if (e.key === 'Enter') {
          var firstLink = dropdown.querySelector('.p-search-result-item');
          if (firstLink) {
            e.preventDefault();
            window.location.href = firstLink.getAttribute('href');
          }
        }
      });
    });

    // Handle popular search tag clicks
    document.querySelectorAll('.p-search-tag-chip').forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        e.preventDefault();
        var tag = this.textContent.trim();
        var mainInput = document.querySelector('.p-search-input');
        if (mainInput) {
          mainInput.value = tag;
          mainInput.dispatchEvent(new Event('input'));
          mainInput.focus();
        }
      });
    });
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    var regex = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
    return escapeHtml(text).replace(regex, '<mark style="background: rgba(24, 183, 232, 0.25); color: #063B5C; padding: 0 2px; border-radius: 2px;">$1</mark>');
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(string) {
    if (!string) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ── 2. CATALOGUE FILTER & SORT SYSTEM ──────────────────── */
  function initCatalogue() {
    var grid = document.getElementById('pCatalogueGrid');
    if (!grid) return;

    var countEl = document.getElementById('pCatalogueCount');
    var sortSelect = document.getElementById('pCatalogueSort');
    var clearAllBtn = document.getElementById('pClearAllFilters');
    var miniSearchInput = document.getElementById('pCatalogueMiniSearch');
    var mobileFilterBtn = document.getElementById('pMobileFilterBtn');
    var sidebar = document.querySelector('.p-filters-sidebar');

    // Parse URL params for pre-selected filters (e.g. ?category=solenoids&segment=ev&search=coil)
    var urlParams = new URLSearchParams(window.location.search);
    var currentFilters = {
      category: urlParams.get('category') || (grid.dataset.defaultCategory || 'all'),
      segment: urlParams.get('segment') || 'all',
      search: urlParams.get('search') || '',
      sort: 'featured'
    };

    // Set initial form controls to match params
    if (currentFilters.category !== 'all') {
      var catRadio = document.querySelector('input[name="pCategoryFilter"][value="' + currentFilters.category + '"]');
      if (catRadio) catRadio.checked = true;
    }
    if (currentFilters.segment !== 'all') {
      var segRadio = document.querySelector('input[name="pSegmentFilter"][value="' + currentFilters.segment + '"]');
      if (segRadio) segRadio.checked = true;
    }
    if (currentFilters.search) {
      if (miniSearchInput) miniSearchInput.value = currentFilters.search;
      var mainSearch = document.querySelector('.p-search-input');
      if (mainSearch) mainSearch.value = currentFilters.search;
    }

    function renderProducts() {
      var filtered = catalogue.filter(function (p) {
        // Category check
        if (currentFilters.category !== 'all' && p.category !== currentFilters.category) {
          return false;
        }
        // Segment check
        if (currentFilters.segment !== 'all') {
          var segMatch = (p.segments || []).some(function (s) {
            return s.toLowerCase().indexOf(currentFilters.segment.toLowerCase()) !== -1;
          });
          if (!segMatch) return false;
        }
        // Search text check
        if (currentFilters.search) {
          var q = currentFilters.search.toLowerCase();
          var titleMatch = p.title.toLowerCase().indexOf(q) !== -1;
          var catMatch = p.categoryName.toLowerCase().indexOf(q) !== -1;
          var specMatch = (p.features || []).some(function (f) { return f.toLowerCase().indexOf(q) !== -1; });
          var marketMatch = (p.markets || []).some(function (m) { return m.toLowerCase().indexOf(q) !== -1; });
          var appMatch = (p.applications || []).some(function (a) { return a.toLowerCase().indexOf(q) !== -1; });
          if (!titleMatch && !catMatch && !specMatch && !marketMatch && !appMatch) return false;
        }
        return true;
      });

      // Sort
      if (currentFilters.sort === 'name-asc') {
        filtered.sort(function (a, b) { return a.title.localeCompare(b.title); });
      } else if (currentFilters.sort === 'name-desc') {
        filtered.sort(function (a, b) { return b.title.localeCompare(a.title); });
      } else if (currentFilters.sort === 'category') {
        filtered.sort(function (a, b) { return a.categoryName.localeCompare(b.categoryName); });
      }

      // Update count text
      if (countEl) {
        countEl.innerHTML = 'Showing <span>' + filtered.length + '</span> of ' + catalogue.length + ' products';
      }

      // Render cards
      if (filtered.length === 0) {
        grid.innerHTML = '<div class="p-empty-state">' +
          '<div class="p-empty-state__icon">🔍</div>' +
          '<h3 class="p-empty-state__title">No matching products found</h3>' +
          '<p class="p-empty-state__desc">Try adjusting your filters, clearing your search query, or selecting another category.</p>' +
          '<button class="p-btn-primary" id="pResetFiltersBtn">Reset All Filters</button>' +
          '</div>';
        var resetBtn = document.getElementById('pResetFiltersBtn');
        if (resetBtn) {
          resetBtn.addEventListener('click', resetFilters);
        }
        return;
      }

      var cardsHtml = '';
      filtered.forEach(function (p) {
        var cardUrl = resolveUrl(p.url);
        var imgUrl = resolveUrl(p.image);
        var specsPills = '';
        if (p.features && p.features.length) {
          specsPills = p.features.slice(0, 2).map(function (f) {
            return '<span class="p-product-card__spec-chip">' + escapeHtml(f.slice(0, 45)) + (f.length > 45 ? '...' : '') + '</span>';
          }).join('');
        }

        var marketTag = (p.markets && p.markets.length) ? p.markets[0] : (p.segments ? p.segments[0] : 'Automotive');

        cardsHtml += '<a href="' + cardUrl + '" class="p-product-card" data-category="' + p.category + '">' +
          '<div class="p-product-card__thumb">' +
          '<span class="p-product-card__cat-pill">' + escapeHtml(p.categoryName) + '</span>' +
          '<img src="' + imgUrl + '" alt="' + escapeHtml(p.title) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + resolveUrl('wp-content/uploads/2022/03/Sensors-sensing-solutions-300x300.jpg') + '\'">' +
          '</div>' +
          '<div class="p-product-card__body">' +
          '<h3 class="p-product-card__title">' + escapeHtml(p.title) + '</h3>' +
          '<p class="p-product-card__desc">' + escapeHtml(p.shortDesc) + '</p>' +
          '<div class="p-product-card__specs">' + specsPills + '</div>' +
          '<div class="p-product-card__footer">' +
          '<span class="p-product-card__market">' + escapeHtml(marketTag) + '</span>' +
          '<span class="p-product-card__cta">View Product &rarr;</span>' +
          '</div>' +
          '</div>' +
          '</a>';
      });

      grid.innerHTML = cardsHtml;
    }

    function resetFilters() {
      currentFilters.category = 'all';
      currentFilters.segment = 'all';
      currentFilters.search = '';
      currentFilters.sort = 'featured';

      var allCatRadio = document.querySelector('input[name="pCategoryFilter"][value="all"]');
      if (allCatRadio) allCatRadio.checked = true;
      var allSegRadio = document.querySelector('input[name="pSegmentFilter"][value="all"]');
      if (allSegRadio) allSegRadio.checked = true;

      var mainSearch = document.querySelector('.p-search-input');
      if (mainSearch) mainSearch.value = '';
      if (miniSearchInput) miniSearchInput.value = '';
      if (sortSelect) sortSelect.value = 'featured';

      updateUrl();
      renderProducts();
    }

    function updateUrl() {
      var url = new URL(window.location);
      if (currentFilters.category !== 'all') url.searchParams.set('category', currentFilters.category);
      else url.searchParams.delete('category');

      if (currentFilters.segment !== 'all') url.searchParams.set('segment', currentFilters.segment);
      else url.searchParams.delete('segment');

      if (currentFilters.search) url.searchParams.set('search', currentFilters.search);
      else url.searchParams.delete('search');

      window.history.replaceState({}, '', url.toString());
    }

    // Category radios
    document.querySelectorAll('input[name="pCategoryFilter"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        currentFilters.category = this.value;
        updateUrl();
        renderProducts();
        if (sidebar && window.innerWidth <= 1024) sidebar.classList.remove('active');
      });
    });

    // Segment radios
    document.querySelectorAll('input[name="pSegmentFilter"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        currentFilters.segment = this.value;
        updateUrl();
        renderProducts();
        if (sidebar && window.innerWidth <= 1024) sidebar.classList.remove('active');
      });
    });

    // Mini search inside toolbar
    if (miniSearchInput) {
      miniSearchInput.addEventListener('input', function () {
        currentFilters.search = this.value;
        updateUrl();
        renderProducts();
      });
    }

    // Sort select
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        currentFilters.sort = this.value;
        renderProducts();
      });
    }

    // Clear filters button
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', resetFilters);
    }

    // Mobile filter toggle
    if (mobileFilterBtn && sidebar) {
      mobileFilterBtn.addEventListener('click', function () {
        sidebar.classList.toggle('active');
      });
    }

    // Expose global hook for header search to filter catalogue
    window.pFilterCatalogue = function (options) {
      if (options.search !== undefined) {
        currentFilters.search = options.search;
        if (miniSearchInput) miniSearchInput.value = options.search;
      }
      if (options.category !== undefined) {
        currentFilters.category = options.category;
      }
      updateUrl();
      renderProducts();
    };

    // Initial render
    renderProducts();
  }

  /* ── 3. ENQUIRY MODAL SYSTEM ────────────────────────────── */
  function initEnquiryModal() {
    var backdrop = document.getElementById('pEnquiryModal');
    if (!backdrop) {
      // Create dynamically if not present in HTML
      backdrop = document.createElement('div');
      backdrop.id = 'pEnquiryModal';
      backdrop.className = 'p-modal-backdrop';
      backdrop.innerHTML = '<div class="p-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="pModalTitle">' +
        '<div class="p-modal-header">' +
        '<div>' +
        '<h3 class="p-modal-header__title" id="pModalTitle">Product Technical Enquiry</h3>' +
        '<div class="p-modal-header__subtitle" id="pModalSubtitle">Connecting directly with TVSSS Application Engineering</div>' +
        '</div>' +
        '<button class="p-modal-close" id="pModalCloseBtn" aria-label="Close modal">&times;</button>' +
        '</div>' +
        '<div class="p-modal-body">' +
        '<form id="pEnquiryForm">' +
        '<div class="p-form-group">' +
        '<label class="p-form-label">Product Selected</label>' +
        '<input type="text" class="p-form-input" id="pFormProduct" readonly style="background: #F8FAFC; font-weight: 600; color: #063B5C;">' +
        '</div>' +
        '<div class="p-form-row">' +
        '<div class="p-form-group">' +
        '<label class="p-form-label" for="pFormName">Your Name *</label>' +
        '<input type="text" class="p-form-input" id="pFormName" required placeholder="John Doe">' +
        '</div>' +
        '<div class="p-form-group">' +
        '<label class="p-form-label" for="pFormCompany">Company / Organization *</label>' +
        '<input type="text" class="p-form-input" id="pFormCompany" required placeholder="OEM or Tier-1 Company">' +
        '</div>' +
        '</div>' +
        '<div class="p-form-row">' +
        '<div class="p-form-group">' +
        '<label class="p-form-label" for="pFormEmail">Work Email *</label>' +
        '<input type="email" class="p-form-input" id="pFormEmail" required placeholder="name@company.com">' +
        '</div>' +
        '<div class="p-form-group">' +
        '<label class="p-form-label" for="pFormPhone">Phone / Mobile *</label>' +
        '<input type="tel" class="p-form-input" id="pFormPhone" required placeholder="+91 98765 43210">' +
        '</div>' +
        '</div>' +
        '<div class="p-form-row">' +
        '<div class="p-form-group">' +
        '<label class="p-form-label" for="pFormSegment">Vehicle Segment</label>' +
        '<select class="p-form-select" id="pFormSegment">' +
        '<option value="Two Wheeler">Two Wheeler</option>' +
        '<option value="Passenger Cars">Passenger Cars</option>' +
        '<option value="Commercial Vehicles">Commercial Vehicles</option>' +
        '<option value="Electric Vehicles">Electric Vehicles</option>' +
        '<option value="Industrial / Automation">Industrial / Automation</option>' +
        '<option value="Other">Other Application</option>' +
        '</select>' +
        '</div>' +
        '<div class="p-form-group">' +
        '<label class="p-form-label" for="pFormQty">Expected Annual Volume</label>' +
        '<select class="p-form-select" id="pFormQty">' +
        '<option value="Prototype (<1,000)">Prototype (&lt;1,000 units)</option>' +
        '<option value="1,000 - 50,000">1,000 - 50,000 units</option>' +
        '<option value="50,000 - 500,000">50,000 - 500,000 units</option>' +
        '<option value="500,000+">500,000+ units / High-Volume OEM</option>' +
        '</select>' +
        '</div>' +
        '</div>' +
        '<div class="p-form-group">' +
        '<label class="p-form-label" for="pFormMsg">Application Details / Custom Requirements</label>' +
        '<textarea class="p-form-textarea" id="pFormMsg" rows="3" placeholder="Please specify target operating temperature, cable length, connector type, or environmental requirements..."></textarea>' +
        '</div>' +
        '<div id="pFormSuccess" style="display: none; background: #ECFDF5; border: 1px solid #10B981; color: #065F46; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem;">' +
        '<strong>Thank you!</strong> Your technical enquiry has been prepared. Our application engineering team will contact you within 24 hours.' +
        '</div>' +
        '<button type="submit" class="p-btn-primary" style="width: 100%;" id="pFormSubmitBtn">Submit Technical Enquiry &rarr;</button>' +
        '</form>' +
        '</div>' +
        '<div class="p-modal-footer">' +
        '<div class="p-direct-contact">' +
        '<span>Or contact direct:</span>' +
        '<a href="mailto:contact@tvsss.co.in">contact@tvsss.co.in</a>' +
        '<span>&bull;</span>' +
        '<a href="tel:+914522911444">+91 452-2911444</a>' +
        '</div>' +
        '</div>' +
        '</div>';
      document.body.appendChild(backdrop);
    }

    var closeBtn = document.getElementById('pModalCloseBtn');
    var form = document.getElementById('pEnquiryForm');
    var productInput = document.getElementById('pFormProduct');
    var successAlert = document.getElementById('pFormSuccess');
    var submitBtn = document.getElementById('pFormSubmitBtn');

    function openModal(productTitle, categoryName) {
      if (productInput) productInput.value = (productTitle || 'TVS Sensing Solutions Product') + (categoryName ? ' (' + categoryName + ')' : '');
      if (successAlert) successAlert.style.display = 'none';
      if (form) form.style.display = 'block';
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && backdrop.classList.contains('active')) closeModal();
    });

    // Delegate click for any element with [data-enquire-product]
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-enquire-product], .p-trigger-enquire');
      if (trigger) {
        e.preventDefault();
        var prodName = trigger.getAttribute('data-enquire-product') || trigger.dataset.productName || document.title;
        var catName = trigger.getAttribute('data-enquire-category') || '';
        openModal(prodName, catName);
      }
    });

    // Form submission handler
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.getElementById('pFormName').value;
        var company = document.getElementById('pFormCompany').value;
        var email = document.getElementById('pFormEmail').value;
        var phone = document.getElementById('pFormPhone').value;
        var product = productInput.value;
        var segment = document.getElementById('pFormSegment').value;
        var msg = document.getElementById('pFormMsg').value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Preparing Enquiry...';

        // Prepare mailto fallback
        var subject = encodeURIComponent('Technical Product Enquiry: ' + product);
        var body = encodeURIComponent(
          'Name: ' + name + '\n' +
          'Company: ' + company + '\n' +
          'Email: ' + email + '\n' +
          'Phone: ' + phone + '\n' +
          'Product: ' + product + '\n' +
          'Vehicle Segment: ' + segment + '\n' +
          'Details:\n' + msg
        );

        setTimeout(function () {
          successAlert.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Technical Enquiry →';

          // Optionally open mail client
          var mailtoUrl = 'mailto:contact@tvsss.co.in?subject=' + subject + '&body=' + body;
          try {
            window.location.href = mailtoUrl;
          } catch (err) {}

          setTimeout(function () {
            closeModal();
            form.reset();
          }, 3000);
        }, 600);
      });
    }
  }

  /* ── 4. RELATED PRODUCTS GENERATOR ──────────────────────── */
  function initRelatedProducts() {
    var relatedGrid = document.getElementById('pRelatedGrid');
    if (!relatedGrid) return;

    var currentCategory = relatedGrid.dataset.category || '';
    var currentSlug = relatedGrid.dataset.slug || '';

    // Find products in same category excluding current
    var sameCategory = catalogue.filter(function (p) {
      return p.category === currentCategory && p.slug !== currentSlug;
    });

    // If less than 3, add other related products
    if (sameCategory.length < 3) {
      catalogue.forEach(function (p) {
        if (p.slug !== currentSlug && sameCategory.indexOf(p) === -1 && sameCategory.length < 3) {
          sameCategory.push(p);
        }
      });
    }

    var html = '';
    sameCategory.slice(0, 3).forEach(function (p) {
      var cardUrl = resolveUrl(p.url);
      var imgUrl = resolveUrl(p.image);
      html += '<a href="' + cardUrl + '" class="p-product-card">' +
        '<div class="p-product-card__thumb">' +
        '<span class="p-product-card__cat-pill">' + escapeHtml(p.categoryName) + '</span>' +
        '<img src="' + imgUrl + '" alt="' + escapeHtml(p.title) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + resolveUrl('wp-content/uploads/2022/03/Sensors-sensing-solutions-300x300.jpg') + '\'">' +
        '</div>' +
        '<div class="p-product-card__body">' +
        '<h4 class="p-product-card__title">' + escapeHtml(p.title) + '</h4>' +
        '<p class="p-product-card__desc">' + escapeHtml(p.shortDesc) + '</p>' +
        '<div class="p-product-card__footer">' +
        '<span class="p-product-card__market">' + escapeHtml(p.markets && p.markets[0] ? p.markets[0] : 'Automotive') + '</span>' +
        '<span class="p-product-card__cta">View Product &rarr;</span>' +
        '</div>' +
        '</div>' +
        '</a>';
    });

    relatedGrid.innerHTML = html;
  }

  /* ── INITIALIZE ALL ON DOM READY ────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initSearch();
    initCatalogue();
    initEnquiryModal();
    initRelatedProducts();
  });

})();
