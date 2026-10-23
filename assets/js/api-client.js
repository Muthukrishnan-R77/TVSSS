/* ====================================================================
 * TVS Sensing Solutions — Centralized API Client
 * Enterprise-grade HTTP client with environment-aware URL resolution,
 * automatic authorization headers, timeout handling, and error mapping.
 * ==================================================================== */

(function (window) {
  'use strict';

  // 1. Intelligent Environment & Base URL Resolution
  function resolveApiBaseUrl() {
    // A. Explicit global configuration override (e.g. from env-config.js or window)
    if (window.TVSS_CONFIG && window.TVSS_CONFIG.API_URL) {
      return window.TVSS_CONFIG.API_URL.replace(/\/+$/, '');
    }
    if (window.TVSS_API_BASE_URL) {
      return window.TVSS_API_BASE_URL.replace(/\/+$/, '');
    }

    // B. Browser environment checks
    if (typeof window !== 'undefined' && window.location) {
      var origin = window.location.origin || '';
      var hostname = window.location.hostname || '';
      var port = window.location.port || '';
      var protocol = window.location.protocol || '';

      // Running from file:// protocol (local filesystem opening)
      if (protocol === 'file:' || !origin || origin === 'null') {
        return 'http://localhost:5000/api';
      }

      // Served directly by the Node.js Express server on port 5000
      if (port === '5000') {
        return '/api';
      }

      // Running on a separate local dev server (e.g. npx serve on 3000, Vite on 5173, Live Server on 5500/8080)
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
        return 'http://localhost:5000/api';
      }

      // Production / Staging deployment on standard domain (reverse proxy or same server)
      return '/api';
    }

    // Fallback default
    return '/api';
  }

  var API_BASE_URL = resolveApiBaseUrl();

  // Storage keys
  var TOKEN_KEY = 'tvss_admin_token';
  var USER_KEY = 'tvss_admin_user';

  // Client Object Definition
  var TVSS_API = {
    baseUrl: API_BASE_URL,

    // Token & Session Management
    getToken: function () {
      try {
        return localStorage.getItem(TOKEN_KEY) || null;
      } catch (e) {
        return null;
      }
    },

    getUser: function () {
      try {
        var raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    },

    setSession: function (token, user) {
      try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch (e) {
        console.warn('TVSS_API: Failed to save session to localStorage', e);
      }
    },

    clearSession: function () {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch (e) {
        console.warn('TVSS_API: Failed to clear session from localStorage', e);
      }
    },

    isAuthenticated: function () {
      return !!this.getToken();
    },

    getHeaders: function (isMultipart) {
      var headers = {};
      if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
      }
      var token = this.getToken();
      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      }
      return headers;
    },

    handleUnauthorized: function (message) {
      this.clearSession();
      var isLoginPage = typeof window !== 'undefined' && window.location.pathname.endsWith('login.html');
      if (!isLoginPage && typeof window !== 'undefined') {
        var msg = message || 'Your session has expired. Please log in again to continue.';
        alert(msg);
        window.location.href = '/admin/login.html';
      }
    },

    checkResponse: async function (response) {
      if (response.status === 401) {
        var isLoginPage = typeof window !== 'undefined' && window.location.pathname.endsWith('login.html');
        if (!isLoginPage) {
          var errData = {};
          try { errData = await response.clone().json(); } catch (e) {}
          this.handleUnauthorized(errData.message || 'Session expired or invalid. Please log in again.');
          throw new Error('Session expired');
        }
      }
      return response;
    },

    // Centralized Request Handler with Timeout & Comprehensive Error Normalization
    request: async function (endpoint, options) {
      options = options || {};
      var method = (options.method || 'GET').toUpperCase();
      var timeoutMs = options.timeout || 12000;
      var isMultipart = options.body instanceof (window.FormData || Object);

      // Clean up endpoint path
      var path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
      var fullUrl = (path.startsWith('http://') || path.startsWith('https://'))
        ? path
        : (this.baseUrl + path);

      // Prepare headers
      var headers = Object.assign({}, this.getHeaders(isMultipart), options.headers || {});
      if (isMultipart) {
        // Let the browser automatically set the correct multipart boundary
        delete headers['Content-Type'];
      }

      // Configure AbortController for timeout handling
      var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var timeoutId = null;
      if (controller) {
        timeoutId = setTimeout(function () {
          controller.abort();
        }, timeoutMs);
      }

      var fetchOptions = {
        method: method,
        headers: headers,
        signal: controller ? controller.signal : undefined
      };

      if (options.body && method !== 'GET' && method !== 'HEAD') {
        if (isMultipart || typeof options.body === 'string') {
          fetchOptions.body = options.body;
        } else {
          fetchOptions.body = JSON.stringify(options.body);
        }
      }

      try {
        var response = await fetch(fullUrl, fetchOptions);
        if (timeoutId) clearTimeout(timeoutId);

        // Session authorization check
        await this.checkResponse(response);

        // Parse JSON response safely
        var contentType = response.headers.get('content-type') || '';
        var data = null;
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          var text = await response.text();
          data = { success: response.ok, message: text };
        }

        if (!response.ok) {
          var errorMessage = (data && (data.message || data.error)) || ('Request failed with HTTP ' + response.status);
          var apiError = new Error(errorMessage);
          apiError.status = response.status;
          apiError.data = data;
          apiError.isNetworkError = false;
          throw apiError;
        }

        return data;

      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);

        // Check if aborted by timeout
        if (err.name === 'AbortError') {
          var timeoutError = new Error('Server request timed out after ' + (timeoutMs / 1000) + 's. Please check your network connection.');
          timeoutError.isTimeout = true;
          timeoutError.isNetworkError = true;
          timeoutError.status = 408;
          throw timeoutError;
        }

        // Check if browser failed to reach server (Connection refused, DNS failure, CORS failure)
        if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch'))) {
          var connError = new Error('Unable to connect to backend server. Please verify the Node.js server is running on ' + this.baseUrl + '.');
          connError.isNetworkError = true;
          connError.originalError = err;
          throw connError;
        }

        throw err;
      }
    },

    // HTTP Helper Methods
    get: function (endpoint, options) {
      return this.request(endpoint, Object.assign({}, options, { method: 'GET' }));
    },

    post: function (endpoint, body, options) {
      return this.request(endpoint, Object.assign({}, options, { method: 'POST', body: body }));
    },

    put: function (endpoint, body, options) {
      return this.request(endpoint, Object.assign({}, options, { method: 'PUT', body: body }));
    },

    patch: function (endpoint, body, options) {
      return this.request(endpoint, Object.assign({}, options, { method: 'PATCH', body: body }));
    },

    delete: function (endpoint, options) {
      return this.request(endpoint, Object.assign({}, options, { method: 'DELETE' }));
    },

    upload: function (endpoint, formData, options) {
      return this.request(endpoint, Object.assign({}, options, { method: 'POST', body: formData }));
    },

    getServerUrl: function (path) {
      var base = (this.baseUrl || '').replace(/\/api\/?$/, '');
      if (!path) return base;
      if (typeof path !== 'string') return path;
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      if (!path.startsWith('/')) path = '/' + path;
      return base ? (base + path) : path;
    },

    // Authentication Workflows
    login: async function (email, password) {
      var res = await this.post('/auth/login', { email: email, password: password });
      if (res && res.success && res.token) {
        this.setSession(res.token, res.user || { email: email, name: 'TVS Administrator' });
      }
      return res;
    },

    logout: async function () {
      try {
        await this.post('/auth/logout', {});
      } catch (e) {
        // Ignore network errors on logout
      } finally {
        this.clearSession();
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login.html';
        }
      }
    },

    forgotPassword: function (email) {
      return this.post('/auth/forgot-password', { email: email });
    },

    resetPassword: function (token, newPassword) {
      return this.post('/auth/reset-password', { token: token, newPassword: newPassword });
    },

    changePassword: function (newPassword) {
      return this.post('/auth/change-password', { newPassword: newPassword });
    },

    // Health & Diagnostic Checks
    checkHealth: async function () {
      try {
        var res = await this.get('/health', { timeout: 4000 });
        return { isOnline: true, data: res };
      } catch (err) {
        return { isOnline: false, error: err.message, isNetworkError: !!err.isNetworkError };
      }
    },

    checkDatabaseHealth: async function () {
      try {
        var res = await this.get('/health/database', { timeout: 4000 });
        return { isOnline: true, isConnected: !!res.success, data: res };
      } catch (err) {
        return { isOnline: false, isConnected: false, error: err.message };
      }
    }
  };

  // Expose globally
  window.TVSS_API = TVSS_API;

  // Support AMD / CommonJS if used
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TVSS_API;
  }
})(typeof window !== 'undefined' ? window : this);
