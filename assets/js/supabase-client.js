/* supabase-client.js — Supabase SDK Initialization & Helper Functions */
(function(window) {
  'use strict';

  var env = window.TVSSS_ENV || {};
  var SUPABASE_URL = env.SUPABASE_URL || '';
  var SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || '';

  var supabaseClient = null;

  function initSupabase() {
    if (supabaseClient) return supabaseClient;
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      if (SUPABASE_URL && SUPABASE_URL.indexOf('your-supabase-project') === -1) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } else {
        console.warn('TVSSS Admin: Supabase credentials not configured yet in env-config.js');
      }
    } else {
      console.error('TVSSS Admin: Supabase JS library not loaded');
    }
    return supabaseClient;
  }

  // Get initialized client
  function getClient() {
    return supabaseClient || initSupabase();
  }

  // Helper to generate SEO-friendly slug
  function slugify(text) {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  // Auth Helpers
  function getSession() {
    var client = getClient();
    if (!client) return Promise.resolve(null);
    return client.auth.getSession().then(function(res) {
      return res.data ? res.data.session : null;
    }).catch(function(err) {
      console.error('Session check error:', err);
      return null;
    });
  }

  function requireAuth(redirectUrl) {
    var target = redirectUrl || '/admin/login';
    return getSession().then(function(session) {
      if (!session) {
        window.location.href = target;
        return null;
      }
      return session;
    });
  }

  function loginAdmin(email, password) {
    var client = getClient();
    if (!client) {
      return Promise.reject(new Error('Supabase client is not configured. Please check assets/js/env-config.js.'));
    }
    return client.auth.signInWithPassword({
      email: email,
      password: password
    }).then(function(res) {
      if (res.error) throw res.error;
      return res.data;
    });
  }

  function logoutAdmin() {
    var client = getClient();
    if (!client) return Promise.resolve();
    return client.auth.signOut().then(function() {
      window.location.href = '/admin/login';
    });
  }

  function resetPasswordForEmail(email) {
    var client = getClient();
    if (!client) return Promise.reject(new Error('Supabase client not configured'));
    return client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/admin/login'
    });
  }

  // Storage Upload Helper
  function uploadFile(bucket, path, file) {
    var client = getClient();
    if (!client) return Promise.reject(new Error('Supabase client not initialized'));

    // Generate unique path
    var ext = file.name.split('.').pop();
    var cleanName = slugify(file.name.substring(0, file.name.lastIndexOf('.'))) || 'file';
    var fullPath = path + '/' + Date.now() + '_' + cleanName + '.' + ext;

    return client.storage.from(bucket).upload(fullPath, file, {
      cacheControl: '3600',
      upsert: true
    }).then(function(res) {
      if (res.error) throw res.error;
      // Get Public URL
      var pubRes = client.storage.from(bucket).getPublicUrl(fullPath);
      return {
        path: fullPath,
        url: pubRes.data ? pubRes.data.publicUrl : ''
      };
    });
  }

  function deleteFile(bucket, fullPath) {
    var client = getClient();
    if (!client || !fullPath) return Promise.resolve();
    return client.storage.from(bucket).remove([fullPath]);
  }

  // Export to global scope
  window.TVSSS = window.TVSSS || {};
  window.TVSSS.Supabase = {
    getClient: getClient,
    init: initSupabase,
    slugify: slugify,
    getSession: getSession,
    requireAuth: requireAuth,
    loginAdmin: loginAdmin,
    logoutAdmin: logoutAdmin,
    resetPasswordForEmail: resetPasswordForEmail,
    uploadFile: uploadFile,
    deleteFile: deleteFile
  };

})(window);
