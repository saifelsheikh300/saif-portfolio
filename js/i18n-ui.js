// ============================================================
// Static UI text translations (AR/EN) — for labels that aren't
// stored in Supabase (nav, section labels, buttons, footer).
// ============================================================

const translations = {
  ar: {
    nav_work: 'الأعمال', nav_about: 'نبذة', nav_contact: 'تواصل',
    eyebrow: 'بيتم المونتاج دلوقتي',
    label_work: '// أعمال مختارة', label_about: '// نبذة عني', label_contact: '// تواصل معايا',
    contact_title: 'يلا نصنع حاجة مميزة مع بعض.',
    footer_rights: 'كل الحقوق محفوظة.',
    page_title_work: 'الأعمال', filter_all: 'الكل',
    empty_state: 'لسه مفيش مشاريع مضافة.',
    label_about_project: 'عن المشروع', label_software: 'البرامج المستخدمة',
    label_client: 'العميل', label_year: 'السنة', next_project: 'المشروع التالي',
  },
  en: {
    nav_work: 'Work', nav_about: 'About', nav_contact: 'Contact',
    eyebrow: 'NOW EDITING',
    label_work: '// Selected Work', label_about: '// About', label_contact: '// Get in Touch',
    contact_title: "Let's create something together.",
    footer_rights: 'All rights reserved.',
    page_title_work: 'Work', filter_all: 'All',
    empty_state: 'No projects added yet.',
    label_about_project: 'About Project', label_software: 'Software',
    label_client: 'Client', label_year: 'Year', next_project: 'Next Project',
  },
};

function applyStaticTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (translations[lang] && translations[lang][key] !== undefined) {
      el.textContent = translations[lang][key];
    }
  });
}

document.addEventListener('langchange', (e) => applyStaticTranslations(e.detail.lang));
document.addEventListener('DOMContentLoaded', () => applyStaticTranslations(currentLang()));
