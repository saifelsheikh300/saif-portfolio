// ============================================================
// Shared theme logic (dark/light) + scroll progress bar
// Used on every page.
// ============================================================

function applyTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('theme', mode);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = mode === 'dark' ? '☾' : '☀';

  requestAnimationFrame(() => {
    if (window.__heroRibbonMaterials && window.THREE) {
      const accentHex = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent').trim();
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
  initTheme();
  loadThemeSettings();
  initScrollProgress();
  initScrollReveals();
});
