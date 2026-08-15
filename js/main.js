// ============================================================
// Home page logic: bilingual content loading, timecode, intro
// ============================================================

/* ---------------- LOAD SITE CONTENT FROM SUPABASE (bilingual) ---------------- */
async function loadSiteContent() {
  const lang = currentLang();
  try {
    const { data, error } = await supabaseClient.from('site_settings').select('*');
    if (error || !data) return;

    const settings = {};
    data.forEach(row => { settings[row.key] = row.value; });

    if (settings.hero) {
      const h = settings.hero[lang] || settings.hero;
      const titleEl = document.getElementById('hero-title-text');
      const subtitleEl = document.getElementById('hero-subtitle-text');
      if (titleEl && h.title) titleEl.textContent = h.title;
      if (subtitleEl && h.subtitle) subtitleEl.textContent = h.subtitle;
    }

    if (settings.about) {
      const a = settings.about[lang] || settings.about;
      const aboutEl = document.getElementById('about-text');
      if (aboutEl && a.text) aboutEl.textContent = a.text;
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

/* ---------------- LOAD FEATURED PROJECTS ---------------- */
async function loadFeaturedProjects() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  const lang = currentLang();
  try {
    const { data, error } = await supabaseClient
      .from('projects')
      .select('*, categories(name, name_en, slug)')
      .eq('featured', true)
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .limit(6);
    if (error || !data || data.length === 0) return;

    grid.className = 'work-grid';
    grid.innerHTML = data.map(p => {
      const title = (lang === 'en' && p.title_en) ? p.title_en : p.title;
      const catName = p.categories ? ((lang === 'en' && p.categories.name_en) ? p.categories.name_en : p.categories.name) : '';
      return `
      <a href="pages/project.html?slug=${p.slug}" class="work-card">
        <div class="work-card-media" style="background-image:url('${p.thumbnail_url || ''}')"></div>
        <div class="work-card-meta">
          <span class="work-card-title">${title}</span>
          <span class="work-card-category">${catName}</span>
        </div>
      </a>`;
    }).join('');

    if (window.gsap) {
      gsap.utils.toArray('.work-card').forEach((card, i) => {
        gsap.from(card, {
          y: 60, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%' },
          delay: i * 0.06,
        });
      });
    }
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

/* ---------------- INTRO SEQUENCE (letterbox + hero reveal) ---------------- */
function playIntroSequence() {
  if (!window.gsap) return;
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.to('.letterbox-top', { height: '0vh', duration: 1.1, ease: 'power4.inOut' }, 0.15)
    .to('.letterbox-bottom', { height: '0vh', duration: 1.1, ease: 'power4.inOut' }, 0.15)
    .to('.eyebrow', { opacity: 1, duration: 0.5 }, 0.6)
    .to('.hero-title .line span', {
      y: '0%', duration: 1, stagger: 0.08, ease: 'power4.out',
    }, 0.7)
    .to('.hero-subtitle', { opacity: 1, duration: 0.7 }, '-=0.5')
    .to('.hero-scroll-cue', { opacity: 1, duration: 0.6 }, '-=0.3');
}

/* ---------------- BOOT ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadSiteContent();
  loadFeaturedProjects();
  startTimecode();
  playIntroSequence();
});
