/* admin-layout.js — Universal Admin Layout & Auth Handler */
(function (window) {
  'use strict';

  // 1. Intelligent Environment & Base URL Resolution
  function resolveApiBaseUrl() {
    if (window.TVSS_CONFIG && window.TVSS_CONFIG.API_URL) {
      return window.TVSS_CONFIG.API_URL.replace(/\/+$/, '');
    }
    if (window.TVSS_API_BASE_URL) {
      return window.TVSS_API_BASE_URL.replace(/\/+$/, '');
    }
    if (typeof window !== 'undefined' && window.location) {
      var origin = window.location.origin || '';
      var hostname = window.location.hostname || '';
      var port = window.location.port || '';
      var protocol = window.location.protocol || '';

      if (protocol === 'file:' || !origin || origin === 'null') {
        return 'http://localhost:5000/api';
      }
      if (port === '5000') {
        return '/api';
      }
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
        return 'http://localhost:5000/api';
      }
      return '/api';
    }
    return '/api';
  }

  var API_BASE_URL = resolveApiBaseUrl();
  var TOKEN_KEY = 'tvss_admin_token';
  var USER_KEY = 'tvss_admin_user';

  window.TVSS_API = window.TVSS_API || {};
  window.TVSS_API.baseUrl = window.TVSS_API.baseUrl || API_BASE_URL;

  window.TVSS_API.getToken = window.TVSS_API.getToken || function () {
    try { return localStorage.getItem(TOKEN_KEY) || null; } catch (e) { return null; }
  };

  window.TVSS_API.getUser = window.TVSS_API.getUser || function () {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || '{}'); } catch (e) { return {}; }
  };

  window.TVSS_API.setSession = window.TVSS_API.setSession || function (token, user) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) { console.warn('Failed to save session', e); }
  };

  window.TVSS_API.clearSession = window.TVSS_API.clearSession || function () {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) { console.warn('Failed to clear session', e); }
  };

  window.TVSS_API.isAuthenticated = window.TVSS_API.isAuthenticated || function () {
    return !!this.getToken();
  };

  window.TVSS_API.getHeaders = window.TVSS_API.getHeaders || function (isMultipart) {
    var headers = {};
    if (!isMultipart) headers['Content-Type'] = 'application/json';
    var token = this.getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  };

  window.TVSS_API.handleUnauthorized = window.TVSS_API.handleUnauthorized || function (message) {
    this.clearSession();
    var isLoginPage = typeof window !== 'undefined' && window.location.pathname.endsWith('login.html');
    if (!isLoginPage && typeof window !== 'undefined') {
      alert(message || 'Session expired. Please log in again.');
      window.location.href = '/admin/login.html';
    }
  };

  window.TVSS_API.checkResponse = window.TVSS_API.checkResponse || async function (response) {
    if (response.status === 401 && !window.location.pathname.endsWith('login.html')) {
      var errData = {};
      try { errData = await response.clone().json(); } catch(e) {}
      this.handleUnauthorized(errData.message || 'Session expired or invalid. Please log in again.');
      throw new Error('Session expired');
    }
    return response;
  };

  window.TVSS_API.request = window.TVSS_API.request || async function (endpoint, options) {
    options = options || {};
    var method = (options.method || 'GET').toUpperCase();
    var timeoutMs = options.timeout || 12000;
    var isMultipart = options.body instanceof (window.FormData || Object);

    var path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    var fullUrl = (path.startsWith('http://') || path.startsWith('https://')) ? path : (this.baseUrl + path);

    var headers = Object.assign({}, this.getHeaders(isMultipart), options.headers || {});
    if (isMultipart) delete headers['Content-Type'];

    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, timeoutMs) : null;

    var fetchOptions = {
      method: method,
      headers: headers,
      signal: controller ? controller.signal : undefined
    };

    if (options.body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = (isMultipart || typeof options.body === 'string') ? options.body : JSON.stringify(options.body);
    }

    try {
      var res = await fetch(fullUrl, fetchOptions);
      if (timeoutId) clearTimeout(timeoutId);
      await this.checkResponse(res);

      var contentType = res.headers.get('content-type') || '';
      var data = contentType.includes('application/json') ? await res.json() : { success: res.ok, message: await res.text() };

      if (!res.ok) {
        var err = new Error((data && (data.message || data.error)) || ('Request failed (' + res.status + ')'));
        err.status = res.status;
        err.data = data;
        err.isNetworkError = false;
        throw err;
      }
      return data;
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        var tErr = new Error('Server request timed out after ' + (timeoutMs / 1000) + 's.');
        tErr.isTimeout = true;
        tErr.isNetworkError = true;
        throw tErr;
      }
      if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch'))) {
        var nErr = new Error('Unable to connect to backend server. Please verify Node.js server is running on ' + this.baseUrl + '.');
        nErr.isNetworkError = true;
        throw nErr;
      }
      throw err;
    }
  };

  window.TVSS_API.get = window.TVSS_API.get || function (endpoint, options) {
    return this.request(endpoint, Object.assign({}, options, { method: 'GET' }));
  };

  window.TVSS_API.post = window.TVSS_API.post || function (endpoint, body, options) {
    return this.request(endpoint, Object.assign({}, options, { method: 'POST', body: body }));
  };

  window.TVSS_API.put = window.TVSS_API.put || function (endpoint, body, options) {
    return this.request(endpoint, Object.assign({}, options, { method: 'PUT', body: body }));
  };

  window.TVSS_API.patch = window.TVSS_API.patch || function (endpoint, body, options) {
    return this.request(endpoint, Object.assign({}, options, { method: 'PATCH', body: body }));
  };

  window.TVSS_API.delete = window.TVSS_API.delete || function (endpoint, options) {
    return this.request(endpoint, Object.assign({}, options, { method: 'DELETE' }));
  };

  window.TVSS_API.login = window.TVSS_API.login || async function (email, password) {
    var res = await this.post('/auth/login', { email: email, password: password });
    if (res && res.success && res.token) {
      this.setSession(res.token, res.user || { email: email, name: 'TVS Administrator' });
    }
    return res;
  };

  window.TVSS_API.logout = window.TVSS_API.logout || async function () {
    try { await this.post('/auth/logout', {}); } catch (e) {}
    this.clearSession();
    window.location.href = '/admin/login.html';
  };

  window.TVSS_API.forgotPassword = window.TVSS_API.forgotPassword || function (email) {
    return this.post('/auth/forgot-password', { email: email });
  };

  window.TVSS_API.resetPassword = window.TVSS_API.resetPassword || function (token, newPassword) {
    return this.post('/auth/reset-password', { token: token, newPassword: newPassword });
  };

  window.TVSS_API.changePassword = window.TVSS_API.changePassword || function (newPassword) {
    return this.post('/auth/change-password', { newPassword: newPassword });
  };

  function renderAdminLayout(activeNavKey, pageTitle) {
    // 1. Enforce Authentication check
    var isLoginPage = window.location.pathname.endsWith('login.html');
    var token = window.TVSS_API.getToken();

    if (!isLoginPage && !token) {
      window.location.href = '/admin/login.html';
      return;
    }

    var user = window.TVSS_API.getUser();
    var userName = user.name || 'Admin';

    // 2. Render Shared Sidebar
    var sidebarWrap = document.getElementById('adminSidebarWrap');
    if (sidebarWrap) {
      sidebarWrap.innerHTML =
        '<aside class="admin-sidebar">' +
          '<div class="admin-sidebar-brand">' +
            '<div class="admin-sidebar-logo-square">TVS</div>' +
            '<div class="admin-sidebar-brand-text">' +
              '<span class="admin-sidebar-title">TVS SENSING SOLUTIONS</span>' +
              '<span class="admin-sidebar-subtitle">A TVS GROUP COMPANY</span>' +
            '</div>' +
          '</div>' +
          '<nav class="admin-nav">' +
            '<a href="/admin/dashboard.html" class="admin-nav-item' + (activeNavKey === 'dashboard' ? ' active' : '') + '">' +
              '<svg class="admin-nav-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>' +
              '<span>Dashboard</span>' +
            '</a>' +
            '<a href="/admin/media/index.html" class="admin-nav-item' + (activeNavKey === 'media' ? ' active' : '') + '">' +
              '<svg class="admin-nav-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' +
              '<span>Media Management</span>' +
            '</a>' +
            '<a href="/admin/careers/index.html" class="admin-nav-item' + (activeNavKey === 'careers' ? ' active' : '') + '">' +
              '<svg class="admin-nav-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>' +
              '<span>Career Management</span>' +
            '</a>' +
            '<a href="/admin/career-applications/index.html" class="admin-nav-item' + (activeNavKey === 'career-applications' ? ' active' : '') + '">' +
              '<svg class="admin-nav-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>' +
              '<span>Career Applications</span>' +
            '</a>' +
            '<a href="/admin/enquiries/index.html" class="admin-nav-item' + (activeNavKey === 'enquiries' ? ' active' : '') + '">' +
              '<svg class="admin-nav-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>' +
              '<span>Enquiry Management</span>' +
            '</a>' +
          '</nav>' +
          '<div class="admin-sidebar-footer">' +
            '<button type="button" class="btn-sidebar-logout" id="jsAdminLogoutBtn">' +
              '<svg class="admin-nav-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>' +
              '<span>Logout</span>' +
            '</button>' +
          '</div>' +
        '</aside>';
    }

    // 3. Render Shared Header
    var topbarWrap = document.getElementById('adminTopbarWrap');
    if (topbarWrap) {
      topbarWrap.innerHTML =
        '<header class="admin-topbar">' +
          '<div class="admin-topbar-left">' +
            '<div class="admin-topbar-logo-block">' +
              '<div class="admin-sidebar-logo-square" style="width:34px; height:34px; font-size:0.9rem;">TVS</div>' +
              '<div>' +
                '<div class="admin-company-title">TVS SENSING SOLUTIONS</div>' +
                '<div class="admin-company-sub">A TVS GROUP COMPANY</div>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="menu-toggle-btn" title="Toggle Navigation">' +
              '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="admin-topbar-right">' +
            '<div class="admin-user-menu">' +
              '<div class="admin-avatar">' +
                '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>' +
              '</div>' +
              '<span class="admin-user-name">' + escapeHtml(userName) + '</span>' +
              '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>' +
            '</div>' +
          '</div>' +
        '</header>';
    }

    // Attach Logout Click handler
    document.addEventListener('click', function (e) {
      if (e.target && (e.target.id === 'jsAdminLogoutBtn' || e.target.closest('#jsAdminLogoutBtn'))) {
        window.TVSS_API.logout();
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.renderAdminLayout = renderAdminLayout;
  window.escapeHtml = escapeHtml;

})(window);
