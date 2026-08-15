// ============================================================
// Shared theme logic (dark/light) + scroll progress bar
// Used on every page.
// ============================================================

// ============================================================
// Shared theme logic (dark/light) + language (AR/EN) + scroll
// progress bar. Used on every page.
// ============================================================

/* ---------------- LANGUAGE (AR / EN) ---------------- */
function currentLang() {
  return localStorage.getItem('lang') || 'ar';
}

function applyLang(lang, opts) {
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  localStorage.setItem('lang', lang);
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = lang === 'ar' ? 'EN' : 'AR';
  if (opts && opts.reload) { window.location.reload(); return; }
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

function initLang() {
  applyLang(currentLang());
  const btn = document.getElementById('lang-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      applyLang(currentLang() === 'ar' ? 'en' : 'ar', { reload: true });
    });
  }
}

async function loadBranding() {
  try {
    const { data, error } = await supabaseClient.from('site_settings').select('*').eq('key', 'branding').single();
    if (error || !data || !data.value || !data.value.logo_url) return;

    const logoImg = document.getElementById('logo-mark');
    if (logoImg) { logoImg.src = data.value.logo_url; logoImg.hidden = false; }

    const badge = document.getElementById('signature-badge');
    const badgeImg = document.getElementById('signature-badge-img');
    if (badge && badgeImg) { badgeImg.src = data.value.logo_url; badge.hidden = false; }
  } catch (e) { /* keep text-only branding */ }
}

function applyTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('theme', mode);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = mode === 'dark' ? '☾' : '☀';

  requestAnimationFrame(() => {
    if (window.__refreshBgSceneColor) window.__refreshBgSceneColor();
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
  } catch (e) { /* fall back to CSS defaults */ }
}

function initScrollProgress() {
  if (!window.gsap) return;
  gsap.to('.scroll-progress', {
    width: '100%',
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });
}

function initScrollReveals() {
  if (!window.gsap) return;
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 50, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  initLang();
  initTheme();
  loadThemeSettings();
  loadBranding();
  initScrollProgress();
  initScrollReveals();
});
