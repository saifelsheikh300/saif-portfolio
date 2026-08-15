// ============================================================
// Project detail page: load project by slug, populate content,
// wire up the video source, and link to the next project.
// ============================================================

function getSlugFromUrl() {
  return new URLSearchParams(window.location.search).get('slug');
}

async function loadProject() {
  const slug = getSlugFromUrl();
  if (!slug) return;

  try {
    const { data: project, error } = await supabaseClient
      .from('projects')
      .select('*, categories(name, slug)')
      .eq('slug', slug)
      .single();

    if (error || !project) {
      document.getElementById('project-title').textContent = 'Project not found';
      return;
    }

    document.title = `${project.title} — Saif El Sheikh`;
    document.getElementById('project-title').textContent = project.title;
    document.getElementById('project-category').textContent =
      `${project.categories ? project.categories.name : ''} ${project.year ? '· ' + project.year : ''}`;
    document.getElementById('project-description').textContent = project.description || '';
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

    loadNextProject(project.sort_order, project.id);
  } catch (e) {
    document.getElementById('project-title').textContent = 'Something went wrong';
  }
}

async function loadNextProject(currentSortOrder, currentId) {
  try {
    const { data, error } = await supabaseClient
      .from('projects')
      .select('title, slug')
      .eq('published', true)
      .gt('sort_order', currentSortOrder)
      .order('sort_order', { ascending: true })
      .limit(1);

    let next = data && data[0];

    // Wrap around to the first project if this was the last one
    if (!next) {
      const { data: first } = await supabaseClient
        .from('projects')
        .select('title, slug, id')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .limit(1);
      if (first && first[0] && first[0].id !== currentId) next = first[0];
    }

    if (next) {
      const link = document.getElementById('next-project-link');
      link.href = `project.html?slug=${next.slug}`;
      document.getElementById('next-project-title').textContent = next.title;
      link.hidden = false;
    }
  } catch (e) { /* no next project shown */ }
}

document.addEventListener('DOMContentLoaded', loadProject);
