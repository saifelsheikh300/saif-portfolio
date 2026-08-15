// ============================================================
// Work page: load categories + all projects, handle filtering
// ============================================================

let allProjects = [];

function renderProjects(list) {
  const grid = document.getElementById('work-grid-full');
  const emptyState = document.getElementById('empty-state');

  if (!list.length) {
    grid.innerHTML = '';
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  grid.innerHTML = list.map(p => `
    <a href="project.html?slug=${p.slug}" class="work-card">
      <div class="work-card-media" style="background-image:url('${p.thumbnail_url || ''}')"></div>
      <div class="work-card-meta">
        <span class="work-card-title">${p.title}</span>
        <span class="work-card-category">${p.categories ? p.categories.name : ''}</span>
      </div>
    </a>
  `).join('');

  if (window.gsap) {
    gsap.utils.toArray('.work-card').forEach((card, i) => {
      gsap.fromTo(card,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: i * 0.05 }
      );
    });
  }
}

async function loadCategories() {
  const bar = document.getElementById('filter-bar');
  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data) return;

    data.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.dataset.slug = cat.slug;
      btn.textContent = cat.name;
      bar.appendChild(btn);
    });

    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-chip');
      if (!btn) return;
      bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');

      const slug = btn.dataset.slug;
      if (slug === 'all') {
        renderProjects(allProjects);
      } else {
        renderProjects(allProjects.filter(p => p.categories && p.categories.slug === slug));
      }
    });
  } catch (e) { /* keep just "All" filter */ }
}

async function loadAllProjects() {
  try {
    const { data, error } = await supabaseClient
      .from('projects')
      .select('*, categories(name, slug)')
      .eq('published', true)
      .order('sort_order', { ascending: true });
    if (error || !data) return;
    allProjects = data;
    renderProjects(allProjects);
  } catch (e) {
    document.getElementById('empty-state').hidden = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadAllProjects();
});
