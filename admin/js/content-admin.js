// ============================================================
// Content (site_settings) admin — bilingual AR/EN
// ============================================================

async function loadContentAdmin() {
  const { data } = await supabaseClient.from('site_settings').select('*');
  if (!data) return;
  const settings = {};
  data.forEach(row => { settings[row.key] = row.value; });

  if (settings.hero) {
    const ar = settings.hero.ar || {}; const en = settings.hero.en || {};
    document.getElementById('hero_title_ar').value = ar.title || '';
    document.getElementById('hero_subtitle_ar').value = ar.subtitle || '';
    document.getElementById('hero_title_en').value = en.title || '';
    document.getElementById('hero_subtitle_en').value = en.subtitle || '';
    document.getElementById('hero_showreel').value = settings.hero.showreel_video_url || '';
  }
  if (settings.about) {
    document.getElementById('about_text_ar').value = (settings.about.ar && settings.about.ar.text) || '';
    document.getElementById('about_text_en').value = (settings.about.en && settings.about.en.text) || '';
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
    const ar = settings.seo.ar || {}; const en = settings.seo.en || {};
    document.getElementById('seo_title_ar').value = ar.title || '';
    document.getElementById('seo_description_ar').value = ar.description || '';
    document.getElementById('seo_title_en').value = en.title || '';
    document.getElementById('seo_description_en').value = en.description || '';
  }
}

async function saveContent(e) {
  e.preventDefault();

  const rows = [
    { key: 'hero', value: {
      ar: {
        title: document.getElementById('hero_title_ar').value.trim(),
        subtitle: document.getElementById('hero_subtitle_ar').value.trim(),
      },
      en: {
        title: document.getElementById('hero_title_en').value.trim(),
        subtitle: document.getElementById('hero_subtitle_en').value.trim(),
      },
      showreel_video_url: document.getElementById('hero_showreel').value.trim(),
    }},
    { key: 'about', value: {
      ar: { text: document.getElementById('about_text_ar').value.trim() },
      en: { text: document.getElementById('about_text_en').value.trim() },
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
      ar: {
        title: document.getElementById('seo_title_ar').value.trim(),
        description: document.getElementById('seo_description_ar').value.trim(),
      },
      en: {
        title: document.getElementById('seo_title_en').value.trim(),
        description: document.getElementById('seo_description_en').value.trim(),
      },
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
