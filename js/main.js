// ============================================================
// SAIF EL SHEIKH — PERSONAL PORTFOLIO
// main.js (With Supabase Backend Integration)
// ============================================================

// ---- STATE ----
const state = {
  theme: localStorage.getItem('theme') || 'dark',
  lang: localStorage.getItem('lang') || 'ar',
  videos: [],
  categories: [],
  siteData: JSON.parse(localStorage.getItem('siteData') || 'null'),
};

// ---- DEFAULTS FALLBACK ----
const defaultSiteData = {
  name_ar: 'سيف الشيخ',
  name_en: 'Saif El Sheikh',
  title_ar: 'فيديو إيديتور · موشن ديزاينر',
  title_en: 'Video Editor · Motion Designer',
  dob: '2009',
  bio_ar: 'أنا سيف، فيديو إيديتور متخصص في تحويل الفيديوهات الخام والفويس أوفر لمحتوى احترافي يشد المشاهد ويخليه يكمل الفيديو للآخر. بشتغل بـ Adobe Premiere Pro و After Effects وبقدر أعمل مونتاج ريلز وشورتس وتيك توك، فيديوهات يوتيوب كاملة، فيديوهات إعلانية وترويجية، موشن جرافيك وأنيميشن نصوص، وتصحيح ألوان.',
  bio_en: "I'm Saif, a video editor specialized in transforming raw footage and voice-overs into professional content that grabs attention and keeps viewers watching until the end. I work with Adobe Premiere Pro & After Effects delivering Reels, YouTube videos, promotional content, motion graphics, and color grading.",
  whatsapp: '201125655690',
  email: 'saifelsheikh@example.com',
  profilePhoto: null,
  socials: {
    instagram: { url: 'https://instagram.com', visible: true },
    facebook: { url: 'https://facebook.com', visible: true },
    youtube: { url: 'https://youtube.com', visible: true },
    tiktok: { url: 'https://tiktok.com', visible: true },
    whatsapp: { url: 'https://wa.me/201125655690', visible: true },
  },
  accentColor: '#00C6FF',
};

function getSiteData() {
  return state.siteData || defaultSiteData;
}

// ---- SUPABASE DATA FETCHING ----
async function syncFromSupabase() {
  if (typeof supabaseClient === 'undefined' || !supabaseClient) return;

  try {
    // 1. Fetch site_settings
    const { data: settingsData, error: sErr } = await supabaseClient
      .from('site_settings')
      .select('*');

    if (!sErr && settingsData && settingsData.length > 0) {
      const settings = {};
      settingsData.forEach(row => { settings[row.key] = row.value; });

      const current = getSiteData();
      const hero = settings.hero || {};
      const heroAr = hero.ar || {};
      const heroEn = hero.en || {};
      const about = settings.about || {};
      const aboutAr = about.ar || {};
      const aboutEn = about.en || {};
      const contact = settings.contact || {};
      const profile = settings.profile || {};
      const branding = settings.branding || {};
      const rawSocials = settings.social_links || current.socials;

      // Normalize socials whether they are strings or objects
      const normalizedSocials = { ...current.socials };
      if (rawSocials && typeof rawSocials === 'object') {
        Object.entries(rawSocials).forEach(([k, v]) => {
          if (typeof v === 'string') {
            normalizedSocials[k] = { url: v, visible: true };
          } else if (v && typeof v === 'object') {
            normalizedSocials[k] = { url: v.url || '', visible: v.visible !== false };
          }
        });
      }

      const merged = {
        ...current,
        name_ar: heroAr.title || profile.name_ar || current.name_ar,
        name_en: heroEn.title || profile.name_en || current.name_en,
        title_ar: heroAr.subtitle || profile.title_ar || current.title_ar,
        title_en: heroEn.subtitle || profile.title_en || current.title_en,
        dob: profile.dob || current.dob,
        bio_ar: (aboutAr.text || about.text || profile.bio_ar || current.bio_ar),
        bio_en: (aboutEn.text || profile.bio_en || current.bio_en),
        profilePhoto: profile.profile_photo || current.profilePhoto,
        whatsapp: contact.whatsapp || current.whatsapp,
        email: contact.email || current.email,
        accentColor: branding.accent_color || current.accentColor,
        socials: normalizedSocials,
      };

      state.siteData = merged;
      localStorage.setItem('siteData', JSON.stringify(merged));

      if (merged.accentColor) {
        document.documentElement.style.setProperty('--accent', merged.accentColor);
      }
    }
  } catch (err) {
    console.log('Supabase sync notice:', err);
  }
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme(state.theme);
  applyLang(state.lang);
  initBackground();
  initNavbar();
  initBackToTop();
  initScrollReveal();

  // Sync latest cloud data
  await syncFromSupabase();

  initPageSpecific();
});

// ---- THEME ----
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

// ---- LANGUAGE ----
function applyLang(lang) {
  state.lang = lang;
  document.body.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  localStorage.setItem('lang', lang);
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = lang === 'ar' ? 'EN' : 'ع';

  // Update nav logo
  const arLogo = document.querySelector('.nav-logo.ar');
  const enLogo = document.querySelector('.nav-logo.en');
  if (arLogo && enLogo) {
    arLogo.style.display = lang === 'ar' ? '' : 'none';
    enLogo.style.display = lang === 'en' ? '' : 'none';
  }
}

function toggleLang() {
  applyLang(state.lang === 'ar' ? 'en' : 'ar');
}

// ---- ANIMATED BACKGROUND ----
function initBackground() {
  const canvas = document.querySelector('.bg-canvas');
  if (!canvas) return;

  // Particles
  const container = canvas.querySelector('.particles-container');
  if (container && container.children.length === 0) {
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${80 + Math.random() * 20}%;
        animation-duration: ${6 + Math.random() * 8}s;
        animation-delay: ${Math.random() * 8}s;
        width: ${2 + Math.random() * 3}px;
        height: ${2 + Math.random() * 3}px;
        opacity: 0;
      `;
      container.appendChild(p);
    }
  }

  // Mouse parallax on orbs
  const orb1 = canvas.querySelector('.orb-1');
  const orb2 = canvas.querySelector('.orb-2');
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    if (orb1) orb1.style.transform = `translate(${x}px, ${y}px)`;
    if (orb2) orb2.style.transform = `translate(${-x * 0.7}px, ${-y * 0.7}px)`;
  });

  // Scroll parallax
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (orb1) orb1.style.marginTop = `${scrollY * 0.1}px`;
    if (orb2) orb2.style.marginBottom = `${scrollY * 0.08}px`;
  }, { passive: true });
}

// ---- NAVBAR ----
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  const themeBtn = document.getElementById('themeToggle');
  const langBtn = document.getElementById('langToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  if (langBtn) langBtn.addEventListener('click', toggleLang);
}

// ---- BACK TO TOP ----
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---- SCROLL REVEAL ----
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${i * 0.08}s`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ---- PAGE-SPECIFIC INIT ----
function initPageSpecific() {
  const path = window.location.pathname.split('/').pop() || 'index.html';

  if (path === 'index.html' || path === '') {
    initHome();
  } else if (path === 'portfolio.html') {
    initPortfolio();
  } else if (path === 'contact.html') {
    initContact();
  }
}

// ---- HOME PAGE ----
function initHome() {
  loadProfileData();
  initTypewriter();
  loadPortfolioPreview();
}

function loadProfileData() {
  const data = getSiteData();

  // Dynamic names & titles
  const heroNameAr = document.querySelector('.hero-name .ar');
  const heroNameEn = document.querySelector('.hero-name .en');
  if (heroNameAr && data.name_ar) heroNameAr.textContent = data.name_ar;
  if (heroNameEn && data.name_en) heroNameEn.textContent = data.name_en;

  const heroBioAr = document.querySelector('.hero-bio.ar');
  const heroBioEn = document.querySelector('.hero-bio.en');
  if (heroBioAr && data.bio_ar) heroBioAr.textContent = data.bio_ar;
  if (heroBioEn && data.bio_en) heroBioEn.textContent = data.bio_en;

  const dobAr = document.querySelector('.hero-dob .ar');
  const dobEn = document.querySelector('.hero-dob .en');
  if (dobAr && data.dob) dobAr.textContent = `مواليد ${data.dob}`;
  if (dobEn && data.dob) dobEn.textContent = `Born ${data.dob}`;

  // Profile photo
  const photoEl = document.getElementById('profilePhoto');
  const placeholder = document.querySelector('.photo-placeholder');
  if (photoEl && data.profilePhoto) {
    photoEl.src = data.profilePhoto;
    photoEl.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
  }

  // WhatsApp button
  const waBtn = document.getElementById('waBtn');
  if (waBtn && data.whatsapp) {
    waBtn.href = `https://wa.me/${data.whatsapp}`;
  }
}

function initTypewriter() {
  const el = document.getElementById('typewriterText');
  if (!el) return;
  const data = getSiteData();

  let charIndex = 0;
  let currentText = '';
  let isDeleting = false;

  function type() {
    const textAr = data.title_ar || 'فيديو إيديتور · موشن ديزاينر';
    const textEn = data.title_en || 'Video Editor · Motion Designer';
    const text = state.lang === 'ar' ? textAr : textEn;

    if (!isDeleting) {
      currentText = text.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === text.length) {
        isDeleting = true;
        setTimeout(type, 2500);
        return;
      }
    } else {
      currentText = text.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        setTimeout(type, 400);
        return;
      }
    }
    el.textContent = currentText;
    setTimeout(type, isDeleting ? 45 : 80);
  }
  type();

  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      charIndex = 0;
      currentText = '';
      isDeleting = false;
    });
  }
}

async function loadPortfolioPreview() {
  try {
    let videos = [];

    // Try Supabase first
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*, categories(name, name_en)')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .limit(3);

      if (!error && data && data.length > 0) {
        videos = data.map(p => ({
          id: p.id,
          title_ar: p.title,
          title_en: p.title_en || p.title,
          category: p.categories ? p.categories.name : 'فيديو',
          category_en: p.categories ? (p.categories.name_en || p.categories.name) : 'Video',
          youtube_id: p.youtube_id || extractYouTubeId(p.video_url || ''),
          youtube_url: p.video_url,
          thumbnail_url: p.thumbnail_url
        }));
      }
    }

    // Fallback if empty
    if (!videos || videos.length === 0) {
      const stored = localStorage.getItem('portfolioVideos');
      if (stored) {
        videos = JSON.parse(stored).slice(0, 3);
      } else {
        const res = await fetch('data.json');
        const d = await res.json();
        videos = (d.videos || []).slice(0, 3);
      }
    }

    state.videos = videos;
    renderVideoCards(videos, 'previewGrid');
  } catch (e) {
    console.log('Preview load fallback', e);
  }
}

function renderVideoCards(videos, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!videos || videos.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">
        <span class="ar">لا توجد أعمال حالياً</span>
        <span class="en">No projects available</span>
      </div>
    `;
    return;
  }

  videos.forEach(video => {
    const card = document.createElement('div');
    card.className = 'video-card reveal';
    const rawUrl = video.video_url || video.youtube_url || '';
    const info = parseVideoInfo(rawUrl);
    const ytId = video.youtube_id || (info.type === 'youtube' ? info.id : 'dQw4w9WgXcQ');
    const thumbUrl = video.thumbnail_url || info.thumbUrl || `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;

    card.innerHTML = `
      <div class="video-thumb">
        <img src="${thumbUrl}" alt="${video.title_ar || video.title_en}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80'">
        <div class="video-play-btn">
          <div class="play-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A0F2C">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="video-info">
        <div class="video-category">${state.lang === 'ar' ? (video.category || 'فيديو') : (video.category_en || video.category || 'Video')}</div>
        <div class="video-title ar">${video.title_ar || ''}</div>
        <div class="video-title en">${video.title_en || video.title_ar || ''}</div>
      </div>
    `;
    card.addEventListener('click', () => openModal(video));
    container.appendChild(card);
  });

  setTimeout(initScrollReveal, 50);
}

// ---- PORTFOLIO PAGE ----
async function initPortfolio() {
  let videos = [];
  let categories = [];

  try {
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      // 1. Fetch categories
      const { data: catData } = await supabaseClient
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catData && catData.length > 0) {
        categories = catData;
      }

      // 2. Fetch projects
      const { data: projData } = await supabaseClient
        .from('projects')
        .select('*, categories(id, name, name_en, slug)')
        .eq('published', true)
        .order('sort_order', { ascending: true });

      if (projData && projData.length > 0) {
        videos = projData.map(p => ({
          id: p.id,
          title_ar: p.title,
          title_en: p.title_en || p.title,
          category_id: p.category_id,
          category: p.categories ? p.categories.name : 'أعمال عامة',
          category_en: p.categories ? (p.categories.name_en || p.categories.name) : 'General',
          youtube_id: p.youtube_id || extractYouTubeId(p.video_url || ''),
          youtube_url: p.video_url,
          thumbnail_url: p.thumbnail_url,
          featured: p.featured,
        }));
      }
    }
  } catch (err) {
    console.log('Supabase portfolio fetch note:', err);
  }

  // Fallback if needed
  if (!videos || videos.length === 0) {
    const stored = localStorage.getItem('portfolioVideos');
    if (stored) {
      videos = JSON.parse(stored);
      categories = JSON.parse(localStorage.getItem('portfolioCategories') || '[]');
    } else {
      const res = await fetch('data.json');
      const d = await res.json();
      videos = d.videos || [];
      categories = (d.categories || []).map((c, i) => ({ id: i, name: c, name_en: c, slug: c }));
    }
  }

  state.videos = videos;
  state.categories = categories;

  renderFilters();
  renderVideoCards(state.videos, 'portfolioGrid');
}

function renderFilters() {
  const container = document.getElementById('filterTabs');
  if (!container) return;
  container.innerHTML = '';

  const allTab = document.createElement('button');
  allTab.className = 'filter-tab active reveal';
  allTab.textContent = state.lang === 'ar' ? 'الكل' : 'All';
  allTab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    allTab.classList.add('active');
    renderVideoCards(state.videos, 'portfolioGrid');
  });
  container.appendChild(allTab);

  state.categories.forEach((cat, i) => {
    if (cat.name === 'الكل' || cat.name === 'All') return;
    const btn = document.createElement('button');
    btn.className = 'filter-tab reveal';
    btn.textContent = state.lang === 'ar' ? cat.name : (cat.name_en || cat.name);
    btn.style.transitionDelay = `${(i + 1) * 0.05}s`;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filtered = state.videos.filter(v => {
        if (v.category_id && cat.id) return v.category_id === cat.id;
        return v.category === cat.name || v.category === cat.name_en;
      });
      renderVideoCards(filtered, 'portfolioGrid');
    });

    container.appendChild(btn);
  });

  setTimeout(initScrollReveal, 50);
}

// Quick search in portfolio
function handlePortfolioSearch(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    renderVideoCards(state.videos, 'portfolioGrid');
    return;
  }
  const filtered = state.videos.filter(v => {
    const titleAr = (v.title_ar || v.title || '').toLowerCase();
    const titleEn = (v.title_en || '').toLowerCase();
    const cat = (v.category || '').toLowerCase();
    const catEn = (v.category_en || '').toLowerCase();
    return titleAr.includes(q) || titleEn.includes(q) || cat.includes(q) || catEn.includes(q);
  });
  renderVideoCards(filtered, 'portfolioGrid');
}

// ---- CONTACT PAGE ----
function initContact() {
  const data = getSiteData();
  const socialsContainer = document.getElementById('socialLinks');

  if (socialsContainer && data.socials) {
    socialsContainer.innerHTML = '';
    const socialMeta = {
      instagram: { icon: '📸', name_ar: 'إنستاغرام', name_en: 'Instagram', bg: '#e1306c22', color: '#e1306c' },
      facebook: { icon: '👤', name_ar: 'فيسبوك', name_en: 'Facebook', bg: '#1877f222', color: '#1877f2' },
      youtube: { icon: '▶️', name_ar: 'يوتيوب', name_en: 'YouTube', bg: '#ff000022', color: '#ff0000' },
      tiktok: { icon: '🎵', name_ar: 'تيك توك', name_en: 'TikTok', bg: '#00f2ea22', color: '#00f2ea' },
      whatsapp: { icon: '💬', name_ar: 'واتساب', name_en: 'WhatsApp', bg: '#25d36622', color: '#25d366' },
    };

    Object.entries(data.socials).forEach(([key, val]) => {
      if (!val || val.visible === false) return;
      const meta = socialMeta[key];
      if (!meta) return;
      const a = document.createElement('a');
      a.href = val.url || '#';
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'social-link reveal';
      a.innerHTML = `
        <div class="social-icon" style="background:${meta.bg}; color:${meta.color}">${meta.icon}</div>
        <div>
          <div class="social-name ar">${meta.name_ar}</div>
          <div class="social-name en">${meta.name_en}</div>
          <div class="social-handle">${(val.url || '').replace('https://', '').replace('http://', '')}</div>
        </div>
      `;
      socialsContainer.appendChild(a);
    });
    setTimeout(initScrollReveal, 50);
  }

  // Contact form -> WhatsApp
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const msg = document.getElementById('contactMsg').value.trim();
      if (!name || !msg) return;
      const waNumber = data.whatsapp || '201125655690';
      const text = encodeURIComponent(`مرحباً سيف، أنا ${name}\nالرسالة: ${msg}`);
      window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
    });
  }
}

// ---- VIDEO MODAL LIGHTBOX (Supports Cloudflare Stream, Cloudflare R2 / MP4, YouTube, Vimeo) ----
function parseVideoInfo(url) {
  if (!url) return { type: 'unknown', url: '', embedUrl: '', thumbUrl: '' };
  const u = url.trim();

  // 1. YouTube
  const ytMatch = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\n?#]+)/);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      type: 'youtube',
      id: id,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1`,
      thumbUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    };
  }

  // 2. Cloudflare Stream
  const cfMatch = u.match(/(?:videodelivery\.net|cloudflarestream\.com)\/([a-zA-Z0-9_-]+)/);
  if (cfMatch) {
    const id = cfMatch[1].replace('/manifest/video.m3u8', '').replace('/thumbnails/thumbnail.jpg', '');
    return {
      type: 'cloudflare_stream',
      id: id,
      embedUrl: `https://iframe.videodelivery.net/${id}?autoplay=true`,
      thumbUrl: `https://videodelivery.net/${id}/thumbnails/thumbnail.jpg`
    };
  }

  // 3. Vimeo
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    return {
      type: 'vimeo',
      id: id,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1`,
      thumbUrl: ''
    };
  }

  // 4. Google Drive (Direct HTML5 Stream + Auto Thumbnail)
  const gdriveMatch = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (gdriveMatch) {
    const id = gdriveMatch[1];
    return {
      type: 'direct',
      id: id,
      videoUrl: `https://drive.google.com/uc?export=download&id=${id}`,
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      thumbUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1280`
    };
  }

  // 4. Direct video files (Cloudflare R2, MP4, WebM, MOV)
  if (u.match(/\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i) || u.includes('r2.dev') || u.includes('r2.cloudflarestorage.com')) {
    return {
      type: 'direct',
      videoUrl: u,
      embedUrl: '',
      thumbUrl: ''
    };
  }

  // Default fallback if unknown embed/url
  return {
    type: 'generic_iframe',
    embedUrl: u,
    thumbUrl: ''
  };
}

function openModal(video) {
  const overlay = document.getElementById('videoModal');
  const iframe = document.getElementById('modalIframe');
  const modalVideo = document.getElementById('modalVideo');
  const titleEl = document.getElementById('modalTitle');
  if (!overlay) return;

  const url = video.video_url || video.youtube_url || '';
  const info = parseVideoInfo(url);

  if (titleEl) {
    titleEl.textContent = state.lang === 'ar' ? (video.title_ar || video.title || 'عرض الفيديو') : (video.title_en || video.title_ar || video.title || 'Video Player');
  }

  if (info.type === 'direct') {
    if (iframe) { iframe.style.display = 'none'; iframe.src = ''; }
    if (modalVideo) {
      modalVideo.style.display = 'block';
      modalVideo.src = info.videoUrl;
      modalVideo.onerror = () => {
        if (info.embedUrl) {
          modalVideo.style.display = 'none';
          if (iframe) {
            iframe.style.display = 'block';
            iframe.src = info.embedUrl;
          }
        }
      };
      modalVideo.load();
      modalVideo.play().catch(() => {});
    }
  } else {
    if (modalVideo) { modalVideo.pause(); modalVideo.style.display = 'none'; modalVideo.src = ''; }
    if (iframe) {
      iframe.style.display = 'block';
      iframe.src = info.embedUrl || url;
    }
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('videoModal');
  const iframe = document.getElementById('modalIframe');
  const modalVideo = document.getElementById('modalVideo');
  if (!overlay) return;

  overlay.classList.remove('open');
  if (iframe) { iframe.src = ''; iframe.style.display = 'none'; }
  if (modalVideo) { modalVideo.pause(); modalVideo.src = ''; modalVideo.style.display = 'none'; }
  document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'videoModal') closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Helper for extracting YouTube Video ID (legacy compatibility)
function extractYouTubeId(url) {
  const info = parseVideoInfo(url);
  return info.type === 'youtube' ? info.id : null;
}

// Toast notification helper
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:var(--accent); color:#0A0F2C;
    padding:12px 24px; border-radius:10px;
    font-weight:700; font-size:0.92rem;
    box-shadow: 0 8px 30px rgba(0,198,255,0.4);
    animation: pageIn 0.3s ease;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}
