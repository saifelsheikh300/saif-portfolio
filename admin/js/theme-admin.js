// ============================================================
// Theme colors admin
// ============================================================

async function loadThemeAdmin() {
  const { data } = await supabaseClient.from('theme_settings').select('*');
  if (!data) return;
  data.forEach(row => {
    const prefix = row.mode; // 'dark' or 'light'
    const bgEl = document.getElementById(`${prefix}_background`);
    const accentEl = document.getElementById(`${prefix}_accent`);
    const cardEl = document.getElementById(`${prefix}_card`);
    const textEl = document.getElementById(`${prefix}_text_color`);
    if (bgEl) bgEl.value = row.background;
    if (accentEl) accentEl.value = row.accent;
    if (cardEl) cardEl.value = row.card;
    if (textEl) textEl.value = row.text_color;
  });
}

async function saveTheme(e) {
  e.preventDefault();
  const rows = ['dark', 'light'].map(mode => ({
    mode,
    background: document.getElementById(`${mode}_background`).value,
    accent: document.getElementById(`${mode}_accent`).value,
    card: document.getElementById(`${mode}_card`).value,
    text_color: document.getElementById(`${mode}_text_color`).value,
  }));

  const { error } = await supabaseClient.from('theme_settings').upsert(rows, { onConflict: 'mode' });
  if (error) { showToast('حصل خطأ: ' + error.message); return; }
  showToast('الألوان اتحفظت ✅');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('theme-form');
  if (form) form.addEventListener('submit', saveTheme);
});
