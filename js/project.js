// ============================================================
// Project detail page: load project by slug (bilingual), wire
// up video source, and link to the next project.
// ============================================================

function getSlugFromUrl() {
  return new URLSearchParams(window.location.search).get('slug');
}

async function loadProject() {
  const slug = getSlugFromUrl();
  if (!slug) return;
  const lang = currentLang();

  try {
    const { data: project, error } = await supabaseClient
      .from('projects')
      .select('*, categories(name, name_en, slug)')
      .eq('slug', slug)
      .single();

    if (error || !project) {
      document.getElementById('project-title').textContent = 'Project not found';
      return;
    }

    const title = (lang === 'en' && project.title_en) ? project.title_en : project.title;
    const description = (lang === 'en' && project.description_en) ? project.description_en : project.description;
    const catName = project.categories
      ? ((lang === 'en' && project.categories.name_en) ? project.categories.name_en : project.categories.name)
      : '';

    document.title = `${title} — Saif El Sheikh`;
    document.getElementById('project-title').textContent = title;
    document.getElementById('project-category').textContent =
      `${catName} ${project.year ? '· ' + project.year : ''}`;
    document.getElementById('project-description').textContent = description || '';
    document.getElementById('project-client').textContent = project.client || '—';
    document.getElementById('project-year').textContent = project.year || '—';

    const video = document.getElementById('project-video');
    if (video && project.video_url) {
      video.src = project.video_url;
      if (project.thumbnail_url) video.poster = project.thumbnail_url;
    }

    const softwareWrap = document.getElementById('project-software');
    if (project.software && project.software.length) {
      softwareWrap.innerHTML = project.software
        .map(s => `<span class="software-tag">${s}</span>`).join('');
    }

    loadNextProject(project.sort_order, project.id, lang);

    if (window.gsap) {
      gsap.from(['#project-title', '#project-category'], {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
      });
    }
  } catch (e) {
    document.getElementById('project-title').textContent = 'Something went wrong';
  }
}

async function loadNextProject(currentSortOrder, currentId, lang) {
  try {
    const { data, error } = await supabaseClient
      .from('projects')
      .select('title, title_en, slug')
      .eq('published', true)
      .gt('sort_order', currentSortOrder)
      .order('sort_order', { ascending: true })
      .limit(1);

    let next = data && data[0];

    if (!next) {
      const { data: first } = await supabaseClient
        .from('projects')
        .select('title, title_en, slug, id')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .limit(1);
      if (first && first[0] && first[0].id !== currentId) next = first[0];
    }

    if (next) {
      const link = document.getElementById('next-project-link');
      link.href = `project.html?slug=${next.slug}`;
      document.getElementById('next-project-title').textContent =
        (lang === 'en' && next.title_en) ? next.title_en : next.title;
      link.hidden = false;
    }
  } catch (e) { /* no next project shown */ }
}

document.addEventListener('DOMContentLoaded', loadProject);
