// ============================================================
// Main site logic: theme, Supabase content loading, GSAP motion
// ============================================================

gsap.registerPlugin(ScrollTrigger);

/* ---------------- THEME ---------------- */
function applyTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('theme', mode);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = mode === 'dark' ? '☾' : '☀';

  // Recolor the 3D ribbon to match new accent
  requestAnimationFrame(() => {
    const accentHex = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim();
    if (window.__heroRibbonMaterials && window.THREE) {
      const c = new THREE.Color(accentHex);
      window.__heroRibbonMaterials.forEach(m => m.color.set(c));
    }
  });
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (systemPrefersDark ? 'dark' : 'light');
  applyTheme(initial);

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
}

/* ---------------- LOAD DYNAMIC THEME COLORS FROM SUPABASE ---------------- */
async function loadThemeSettings() {
  try {
    const { data, error } = await supabaseClient.from('theme_settings').select('*');
    if (error || !data) return;
    const styleTag = document.createElement('style');
    let css = '';
    data.forEach(row => {
      const selector = row.mode === 'dark' ? ':root' : '[data-theme="light"]';
      css += `${selector} { --bg:${row.background}; --accent:${row.accent}; --card:${row.card}; --text:${row.text_color}; }\n`;
    });
    styleTag.textContent = css;
    document.head.appendChild(styleTag);
  } catch (e) { /* fall back to CSS defaults silently */ }
}

/* ---------------- LOAD SITE CONTENT FROM SUPABASE ---------------- */
async function loadSiteContent() {
  try {
    const { data, error } = await supabaseClient.from('site_settings').select('*');
    if (error || !data) return;

    const settings = {};
    data.forEach(row => { settings[row.key] = row.value; });

    if (settings.hero) {
      const titleEl = document.getElementById('hero-title-text');
      const subtitleEl = document.getElementById('hero-subtitle-text');
      if (titleEl && settings.hero.title) titleEl.textContent = settings.hero.title;
      if (subtitleEl && settings.hero.subtitle) subtitleEl.textContent = settings.hero.subtitle;
    }

    if (settings.about) {
      const aboutEl = document.getElementById('about-text');
      if (aboutEl && settings.about.text) aboutEl.textContent = settings.about.text;
    }

    if (settings.contact) {
      const emailLink = document.getElementById('contact-email-link');
      const waLink = document.getElementById('contact-whatsapp-link');
      if (emailLink && settings.contact.email) {
        emailLink.href = `mailto:${settings.contact.email}`;
        emailLink.textContent = settings.contact.email;
        emailLink.hidden = false;
      }
      if (waLink && settings.contact.whatsapp) {
        waLink.href = `https://wa.me/${settings.contact.whatsapp}`;
        waLink.hidden = false;
      }
    }

    if (settings.social_links) {
      Object.entries(settings.social_links).forEach(([platform, url]) => {
        const el = document.querySelector(`[data-social="${platform}"]`);
        if (el && url) { el.href = url; el.hidden = false; }
      });
    }
  } catch (e) { /* keep default placeholder content */ }
}

/* ---------------- LOAD FEATURED PROJECTS (for future Work grid on home) ---------------- */
async function loadFeaturedProjects() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  try {
    const { data, error } = await supabaseClient
      .from('projects')
      .select('*, categories(name, slug)')
      .eq('featured', true)
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .limit(6);
    if (error || !data || data.length === 0) return;

    grid.innerHTML = data.map(p => `
      <a href="pages/project.html?slug=${p.slug}" class="work-card">
        <div class="work-card-media" style="background-image:url('${p.thumbnail_url || ''}')"></div>
        <div class="work-card-meta">
          <span class="work-card-title">${p.title}</span>
          <span class="work-card-category">${p.categories ? p.categories.name : ''}</span>
        </div>
      </a>
    `).join('');

    gsap.utils.toArray('.work-card').forEach((card, i) => {
      gsap.from(card, {
        y: 60, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%' },
        delay: i * 0.06,
      });
    });
  } catch (e) { /* leave grid empty gracefully */ }
}

/* ---------------- TIMECODE TICKER ---------------- */
function startTimecode() {
  const el = document.getElementById('timecode');
  if (!el) return;
  const start = performance.now();
  function frame() {
    const elapsed = (performance.now() - start) / 1000;
    const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(elapsed % 60).toString().padStart(2, '0');
    const f = Math.floor((elapsed * 24) % 24).toString().padStart(2, '0');
    el.textContent = `${h}:${m}:${s}:${f}`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------------- GLOBAL SCROLL PROGRESS BAR ---------------- */
function initScrollProgress() {
  gsap.to('.scroll-progress', {
    width: '100%',
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });
}

/* ---------------- INTRO SEQUENCE (letterbox + hero reveal) ---------------- */
function playIntroSequence() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.to('.letterbox-top', { height: '0vh', duration: 1.1, ease: 'power4.inOut' }, 0.15)
    .to('.letterbox-bottom', { height: '0vh', duration: 1.1, ease: 'power4.inOut' }, 0.15)
    .to('.eyebrow', { opacity: 1, duration: 0.5 }, 0.6)
    .to('.hero-title .line span', {
      y: '0%', duration: 1, stagger: 0.08, ease: 'power4.out',
    }, 0.7)
    .to('.hero-subtitle', { opacity: 1, duration: 0.7 }, '-=0.5')
    .to('.hero-scroll-cue', { opacity: 1, duration: 0.6 }, '-=0.3')
    .to('.scrub-line::after', {}, 0); // placeholder anchor

  // Animate the scrub line fill separately (pseudo-el workaround via CSS var)
  gsap.to('.scrub-line', {
    '--fill': '100%',
    duration: 2,
    delay: 1.6,
    ease: 'power2.inOut',
    onUpdate: function () {
      const val = this.targets()[0].style.getPropertyValue('--fill');
    },
  });
}

/* ---------------- SCROLL REVEALS FOR SECTIONS ---------------- */
function initScrollReveals() {
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 50, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}

/* ---------------- BOOT ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadThemeSettings();
  loadSiteContent();
  loadFeaturedProjects();
  startTimecode();
  initScrollProgress();
  initScrollReveals();
  playIntroSequence();
});
