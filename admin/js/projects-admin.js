// ============================================================
// Projects CRUD (admin)
// ============================================================

let categoriesCache = [];

async function loadCategoriesIntoSelect() {
  const { data } = await supabaseClient.from('categories').select('*').order('sort_order');
  categoriesCache = data || [];
  const select = document.getElementById('project_category_id');
  select.innerHTML = categoriesCache.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadProjectsAdmin() {
  const list = document.getElementById('projects-list');
  list.innerHTML = '<p style="opacity:0.5;font-family:var(--font-mono);font-size:13px;">Loading…</p>';

  const { data, error } = await supabaseClient
    .from('projects')
    .select('*, categories(name)')
    .order('sort_order', { ascending: true });

  if (error || !data || !data.length) {
    list.innerHTML = '<p style="opacity:0.5;font-family:var(--font-mono);font-size:13px;">لسه مفيش مشاريع. دوس + عشان تضيف واحد.</p>';
    return;
  }

  list.innerHTML = data.map(p => `
    <div class="data-row" data-id="${p.id}">
      <div class="data-row-thumb" style="background-image:url('${p.thumbnail_url || ''}')"></div>
      <div class="data-row-main">
        <div class="data-row-title">${p.title} ${p.featured ? '⭐' : ''}</div>
        <div class="data-row-sub">${p.categories ? p.categories.name : ''} ${p.year ? '· ' + p.year : ''}</div>
      </div>
      <div class="data-row-actions">
        <button class="icon-btn edit-project-btn" data-id="${p.id}">✎</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.edit-project-btn').forEach(btn => {
    btn.addEventListener('click', () => openProjectModal(data.find(p => p.id === btn.dataset.id)));
  });
}

function openProjectModal(project) {
  document.getElementById('project-form').reset();
  const featuredBtn = document.getElementById('project_featured_toggle');

  if (project) {
    document.getElementById('project-modal-title').textContent = 'Edit Project';
    document.getElementById('project_id').value = project.id;
    document.getElementById('project_title').value = project.title || '';
    document.getElementById('project_slug').value = project.slug || '';
    document.getElementById('project_description').value = project.description || '';
    document.getElementById('project_category_id').value = project.category_id || '';
    document.getElementById('project_video_url').value = project.video_url || '';
    document.getElementById('project_thumbnail_url').value = project.thumbnail_url || '';
    document.getElementById('project_software').value = (project.software || []).join(', ');
    document.getElementById('project_client').value = project.client || '';
    document.getElementById('project_year').value = project.year || '';
    featuredBtn.dataset.value = project.featured ? 'true' : 'false';
    featuredBtn.classList.toggle('active', !!project.featured);
    document.getElementById('project-delete-btn').hidden = false;
    document.getElementById('project-delete-btn').dataset.id = project.id;
  } else {
    document.getElementById('project-modal-title').textContent = 'Add Project';
    document.getElementById('project_id').value = '';
    featuredBtn.dataset.value = 'false';
    featuredBtn.classList.remove('active');
    document.getElementById('project-delete-btn').hidden = true;
  }
  openModal('project-modal');
}

async function saveProject(e) {
  e.preventDefault();
  const id = document.getElementById('project_id').value;
  const payload = {
    title: document.getElementById('project_title').value.trim(),
    slug: document.getElementById('project_slug').value.trim(),
    description: document.getElementById('project_description').value.trim(),
    category_id: document.getElementById('project_category_id').value || null,
    video_url: document.getElementById('project_video_url').value.trim(),
    thumbnail_url: document.getElementById('project_thumbnail_url').value.trim(),
    software: document.getElementById('project_software').value
      .split(',').map(s => s.trim()).filter(Boolean),
    client: document.getElementById('project_client').value.trim(),
    year: parseInt(document.getElementById('project_year').value) || null,
    featured: document.getElementById('project_featured_toggle').dataset.value === 'true',
  };

  let error;
  if (id) {
    ({ error } = await supabaseClient.from('projects').update(payload).eq('id', id));
  } else {
    ({ error } = await supabaseClient.from('projects').insert(payload));
  }

  if (error) { showToast('حصل خطأ: ' + error.message); return; }
  closeModal('project-modal');
  showToast('اتحفظ ✅');
  loadProjectsAdmin();
}

async function deleteProject() {
  const id = document.getElementById('project-delete-btn').dataset.id;
  if (!confirm('متأكد عايز تمسح المشروع ده؟')) return;
  const { error } = await supabaseClient.from('projects').delete().eq('id', id);
  if (error) { showToast('حصل خطأ: ' + error.message); return; }
  closeModal('project-modal');
  showToast('اتمسح 🗑️');
  loadProjectsAdmin();
}

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('add-project-btn');
  if (addBtn) addBtn.addEventListener('click', () => openProjectModal(null));

  const cancelBtn = document.getElementById('project-cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal('project-modal'));

  const form = document.getElementById('project-form');
  if (form) form.addEventListener('submit', saveProject);

  const deleteBtn = document.getElementById('project-delete-btn');
  if (deleteBtn) deleteBtn.addEventListener('click', deleteProject);

  const featuredToggle = document.getElementById('project_featured_toggle');
  if (featuredToggle) {
    featuredToggle.addEventListener('click', () => {
      const isActive = featuredToggle.dataset.value === 'true';
      featuredToggle.dataset.value = isActive ? 'false' : 'true';
      featuredToggle.classList.toggle('active', !isActive);
    });
  }
});
