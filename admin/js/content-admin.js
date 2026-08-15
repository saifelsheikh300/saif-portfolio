// ============================================================
// Content (site_settings) admin
// ============================================================

async function loadContentAdmin() {
  const { data } = await supabaseClient.from('site_settings').select('*');
  if (!data) return;
  const settings = {};
  data.forEach(row => { settings[row.key] = row.value; });

  if (settings.hero) {
    document.getElementById('hero_title').value = settings.hero.title || '';
    document.getElementById('hero_subtitle').value = settings.hero.subtitle || '';
    document.getElementById('hero_showreel').value = settings.hero.showreel_video_url || '';
  }
  if (settings.about) {
    document.getElementById('about_text').value = settings.about.text || '';
  }
  if (settings.contact) {
    document.getElementById('contact_email').value = settings.contact.email || '';
    document.getElementById('contact_whatsapp').value = settings.contact.whatsapp || '';
  }
  if (settings.social_links) {
    document.getElementById('social_instagram').value = settings.social_links.instagram || '';
    document.getElementById('social_behance').value = settings.social_links.behance || '';
    document.getElementById('social_youtube').value = settings.social_links.youtube || '';
    document.getElementById('social_tiktok').value = settings.social_links.tiktok || '';
  }
  if (settings.seo) {
    document.getElementById('seo_title').value = settings.seo.title || '';
    document.getElementById('seo_description').value = settings.seo.description || '';
  }
}

async function saveContent(e) {
  e.preventDefault();

  const rows = [
    { key: 'hero', value: {
      title: document.getElementById('hero_title').value.trim(),
      subtitle: document.getElementById('hero_subtitle').value.trim(),
      showreel_video_url: document.getElementById('hero_showreel').value.trim(),
    }},
    { key: 'about', value: {
      text: document.getElementById('about_text').value.trim(),
    }},
    { key: 'contact', value: {
      email: document.getElementById('contact_email').value.trim(),
      whatsapp: document.getElementById('contact_whatsapp').value.trim(),
    }},
    { key: 'social_links', value: {
      instagram: document.getElementById('social_instagram').value.trim(),
      behance: document.getElementById('social_behance').value.trim(),
      youtube: document.getElementById('social_youtube').value.trim(),
      tiktok: document.getElementById('social_tiktok').value.trim(),
    }},
    { key: 'seo', value: {
      title: document.getElementById('seo_title').value.trim(),
      description: document.getElementById('seo_description').value.trim(),
    }},
  ];

  const { error } = await supabaseClient.from('site_settings').upsert(rows, { onConflict: 'key' });
  if (error) { showToast('حصل خطأ: ' + error.message); return; }
  showToast('المحتوى اتحفظ ✅');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('content-form');
  if (form) form.addEventListener('submit', saveContent);
});
