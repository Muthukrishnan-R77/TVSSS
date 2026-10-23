/* media-store.js — Unified Data Store for TVSS Media Content (LocalStorage + Supabase Sync) */
(function(window) {
  'use strict';

  var SEED_POSTS = [
    {
      id: "1",
      slug: "ev-india-expo-2021",
      title: "EV India Expo – 2021",
      category: "Exhibition",
      publish_date: "2021-12-25",
      display_date: "25th December to 26th December 2021",
      location: "India Expo mart, Greater Noida",
      short_description: "TVS sensing solutions participated in EV India Expo – 2021 in India Expo mart, Greater Noida from 25th December to 26th December 2021.",
      description: "TVS sensing solutions participated in EV India Expo – 2021 in India Expo mart, Greater Noida from 25th December to 26th December 2021.",
      featured_image: "1.png",
      gallery_images: ["1.png"],
      video_url: "",
      video_type: "",
      external_url: "",
      display_order: 1,
      status: "Published",
      created_at: "2021-12-25T10:00:00.000Z",
      updated_at: "2021-12-25T10:00:00.000Z"
    },
    {
      id: "2",
      slug: "green-vehicle-expo-2021",
      title: "Green Vehicle Expo – 2021",
      category: "Automotive Exhibition",
      publish_date: "2021-11-27",
      display_date: "27th November to 29th November 2021",
      location: "Bangalore International Expo Centre, Bangalore",
      short_description: "TVS sensing solutions participated in Green Vehicle Expo – 2021 in Bangalore International Expo Centre, Bangalore expo 27th November to 29th November 2021.",
      description: "TVS sensing solutions participated in Green Vehicle Expo – 2021 in Bangalore International Expo Centre, Bangalore expo 27th November to 29th November 2021.",
      featured_image: "2.png",
      gallery_images: ["2.png"],
      video_url: "",
      video_type: "",
      external_url: "",
      display_order: 2,
      status: "Published",
      created_at: "2021-11-27T10:00:00.000Z",
      updated_at: "2021-11-27T10:00:00.000Z"
    }
  ];

  var STORAGE_KEY = 'tvsss_media_posts';

  function sanitizePost(p) {
    if (!p) return p;
    var idStr = String(p.id || '');
    var slugStr = String(p.slug || '').toLowerCase();
    var titleStr = String(p.title || '').toLowerCase();

    if (idStr === '1' || slugStr.indexOf('ev-india-expo') !== -1 || titleStr.indexOf('ev india expo') !== -1) {
      p.id = "1";
      p.slug = "ev-india-expo-2021";
      p.title = "TVS Sensing Solutions Participates in EV India Expo";
      p.category = "EXHIBITION";
      p.display_date = "25th December to 26th December 2021";
      p.publish_date = "2021-12-25";
      p.featured_image = "1.png";
      p.gallery_images = ["1.png"];
      p.short_description = "TVS sensing solutions participated in EV India Expo – 2021 in India Expo mart, Greater Noida from 25th December to 26th December 2021.";
      p.description = "TVS sensing solutions participated in EV India Expo – 2021 in India Expo mart, Greater Noida from 25th December to 26th December 2021.";
    } else if (idStr === '2' || slugStr.indexOf('green-vehicle-expo') !== -1 || titleStr.indexOf('green vehicle expo') !== -1) {
      p.id = "2";
      p.slug = "green-vehicle-expo-2021";
      p.title = "Green Vehicle Expo – 2021";
      p.category = "EXHIBITION";
      p.display_date = "27th November to 29th November 2021";
      p.publish_date = "2021-11-27";
      p.featured_image = "2.png";
      p.gallery_images = ["2.png"];
      p.short_description = "TVS sensing solutions participated in Green Vehicle Expo – 2021 in Bangalore International Expo Centre, Bangalore expo 27th November to 29th November 2021.";
      p.description = "TVS sensing solutions participated in Green Vehicle Expo – 2021 in Bangalore International Expo Centre, Bangalore expo 27th November to 29th November 2021.";
    }
    return p;
  }

  function isUnwantedSmartFactoryPost(p) {
    if (!p) return false;
    var slug = String(p.slug || '').toLowerCase();
    var title = String(p.title || '').toLowerCase();
    var desc = String(p.description || p.short_description || '').toLowerCase();
    return (title.indexOf('smart factory') !== -1 || desc.indexOf('smart factory') !== -1 || slug.indexOf('smart-factory') !== -1);
  }

  function initLocalStore() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored.indexOf('1.jpg') !== -1 || stored.indexOf('D:') !== -1 || stored.indexOf('12.jpeg') !== -1 || stored.indexOf('/media/') !== -1)) {
      localStorage.removeItem(STORAGE_KEY);
      stored = null;
    }
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS.map(sanitizePost)));
      return SEED_POSTS.map(sanitizePost);
    }
    try {
      var parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS.map(sanitizePost)));
        return SEED_POSTS.map(sanitizePost);
      }
      // Remove unwanted smart factory post and sanitize seed posts
      parsed = parsed.filter(function(p) { return !isUnwantedSmartFactoryPost(p); });

      SEED_POSTS.forEach(function(sp) {
        var idx = parsed.findIndex(function(p) { return String(p.id) === String(sp.id) || p.slug === sp.slug; });
        if (idx !== -1) {
          parsed[idx] = sanitizePost(parsed[idx]);
        } else {
          parsed.push(sanitizePost(sp));
        }
      });
      parsed = parsed.map(function(p) {
        return sanitizePost(p);
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    } catch(e) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS.map(sanitizePost)));
      return SEED_POSTS.map(sanitizePost);
    }
  }

  function getLocalPosts() {
    return initLocalStore();
  }

  function saveLocalPosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }

  function fileToDataURL(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(e) { resolve(e.target.result); };
      reader.onerror = function(err) { reject(err); };
      reader.readAsDataURL(file);
    });
  }

  var MediaStore = {
    getPosts: function(options) {
      options = options || {};
      var client = window.TVSSS && window.TVSSS.Supabase ? window.TVSSS.Supabase.getClient() : null;

      if (client) {
        var query = client.from('media_posts').select('*');
        if (options.status) {
          query = query.eq('status', options.status);
        } else if (!options.includeDrafts) {
          query = query.eq('status', 'Published');
        }
        query = query.order('publish_date', { ascending: false });

        return query.then(function(res) {
          if (res.error || !res.data || res.data.length === 0) {
            return filterLocalPosts(options);
          }
          var clean = res.data.map(sanitizePost).filter(function(p) { return !isUnwantedSmartFactoryPost(p); });
          return clean;
        }).catch(function() {
          return filterLocalPosts(options);
        });
      }

      return Promise.resolve(filterLocalPosts(options));
    },

    getPostBySlugOrId: function(identifier) {
      var client = window.TVSSS && window.TVSSS.Supabase ? window.TVSSS.Supabase.getClient() : null;

      if (client && identifier) {
        var cleanId = String(identifier).trim().toLowerCase().replace(/\/+$/, '').replace(/\.html$/, '');
        return client.from('media_posts').select('*').or('slug.eq.' + cleanId + ',id.eq.' + cleanId).single()
          .then(function(res) {
            if (res.data) return sanitizePost(res.data);
            return findLocalPost(identifier);
          }).catch(function() {
            return findLocalPost(identifier);
          });
      }

      return Promise.resolve(findLocalPost(identifier));
    },

    savePost: function(postData) {
      var posts = getLocalPosts();
      var now = new Date().toISOString();

      if (!postData.id) {
        postData.id = 'post_' + Date.now();
        postData.created_at = now;
      }
      postData.updated_at = now;
      if (!postData.slug) {
        postData.slug = window.TVSSS && window.TVSSS.Supabase && window.TVSSS.Supabase.slugify
          ? window.TVSSS.Supabase.slugify(postData.title || 'post')
          : (postData.title || 'post').toLowerCase().replace(/[^\w]+/g, '-');
      }

      var existingIdx = posts.findIndex(function(p) { return String(p.id) === String(postData.id) || p.slug === postData.slug; });
      if (existingIdx !== -1) {
        posts[existingIdx] = Object.assign({}, posts[existingIdx], postData);
      } else {
        posts.unshift(postData);
      }
      saveLocalPosts(posts);

      var client = window.TVSSS && window.TVSSS.Supabase ? window.TVSSS.Supabase.getClient() : null;
      if (client) {
        client.from('media_posts').upsert(postData).catch(function(err) {
          console.warn('Supabase save warning:', err);
        });
      }

      return Promise.resolve(postData);
    },

    updatePostStatus: function(id, newStatus) {
      var posts = getLocalPosts();
      var target = posts.find(function(p) { return String(p.id) === String(id) || p.slug === id; });
      if (target) {
        target.status = newStatus;
        if (newStatus === 'Published') {
          target.published_at = new Date().toISOString();
        }
        saveLocalPosts(posts);
      }
      var client = window.TVSSS && window.TVSSS.Supabase ? window.TVSSS.Supabase.getClient() : null;
      if (client) {
        var payload = { status: newStatus };
        if (newStatus === 'Published') payload.published_at = new Date().toISOString();
        client.from('media_posts').update(payload).eq('id', id).catch(function(err) {
          console.warn('Supabase update warning:', err);
        });
      }
      return Promise.resolve(target);
    },

    deletePost: function(id) {
      var posts = getLocalPosts();
      posts = posts.filter(function(p) { return String(p.id) === String(id) && p.slug !== id; });
      saveLocalPosts(posts);

      var client = window.TVSSS && window.TVSSS.Supabase ? window.TVSSS.Supabase.getClient() : null;
      if (client) {
        client.from('media_posts').delete().eq('id', id).catch(function(err) {
          console.warn('Supabase delete warning:', err);
        });
      }

      return Promise.resolve(true);
    },

    uploadImage: function(file) {
      var client = window.TVSSS && window.TVSSS.Supabase ? window.TVSSS.Supabase.getClient() : null;
      if (client) {
        return window.TVSSS.Supabase.uploadFile('tvsss-media', 'images', file)
          .then(function(res) { return res.url; })
          .catch(function() { return fileToDataURL(file); });
      }
      return fileToDataURL(file);
    },

    getSeedPosts: function() {
      return SEED_POSTS;
    }
  };

  function filterLocalPosts(options) {
    var posts = getLocalPosts();
    if (options.status) {
      posts = posts.filter(function(p) { return p.status === options.status; });
    } else if (!options.includeDrafts) {
      posts = posts.filter(function(p) { return p.status === 'Published'; });
    }
    if (options.category && options.category !== 'ALL') {
      posts = posts.filter(function(p) { return p.category === options.category; });
    }
    posts.sort(function(a, b) {
      return new Date(b.publish_date || b.created_at || 0) - new Date(a.publish_date || a.created_at || 0);
    });
    return posts;
  }

  function findLocalPost(identifier) {
    var posts = getLocalPosts().map(sanitizePost);
    var evPost = posts.find(function(p) { return p.id === '1' || (p.slug && p.slug.indexOf('ev-india-expo') !== -1); }) || SEED_POSTS[0];
    var defaultPost = evPost;

    if (!identifier || identifier === 'detail.html' || identifier === 'detail') {
      return sanitizePost(defaultPost);
    }

    var cleanId = String(identifier).trim().toLowerCase().replace(/\/+$/, '').replace(/\.html$/, '');
    if (!cleanId) return defaultPost;

    var found = posts.find(function(p) {
      if (!p) return false;
      var slug = String(p.slug || '').toLowerCase().trim();
      var idStr = String(p.id || '').toLowerCase().trim();
      return slug === cleanId || idStr === cleanId || (slug && cleanId.indexOf(slug) !== -1) || (slug && slug.indexOf(cleanId) !== -1);
    });

    return found || defaultPost;
  }

  window.TVSSS = window.TVSSS || {};
  window.TVSSS.MediaStore = MediaStore;

})(window);
