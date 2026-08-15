// ============================================================
// Categories CRUD (admin)
// ============================================================

async function loadCategoriesAdmin() {
  const list = document.getElementById('categories-list');
  list.innerHTML = '<p style="opacity:0.5;font-family:var(--font-mono);font-size:13px;">Loading…</p>';

  const { data, error } = await supabaseClient
    .from('categories').select('*').order('sort_order', { ascending: true });

  if (error || !data || !data.length) {
    list.innerHTML = '<p style="opacity:0.5;font-family:var(--font-mono);font-size:13px;">لسه مفيش تصنيفات.</p>';
    return;
  }

  list.innerHTML = data.map(c => `
    <div class="data-row" data-id="${c.id}">
      <div class="data-row-main">
        <div class="data-row-title">${c.name}</div>
        <div class="data-row-sub">/${c.slug} · order ${c.sort_order}</div>
      </div>
      <div class="data-row-actions">
        <button class="icon-btn edit-category-btn" data-id="${c.id}">✎</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.edit-category-btn').forEach(btn => {
    btn.addEventListener('click', () => openCategoryModal(data.find(c => c.id === btn.dataset.id)));
  });
}

function openCategoryModal(category) {
  document.getElementById('category-form').reset();
  if (category) {
    document.getElementById('category-modal-title').textContent = 'Edit Category';
    document.getElementById('category_id').value = category.id;
    document.getElementById('category_name').value = category.name;
    document.getElementById('category_name_en').value = category.name_en || '';
    document.getElementById('category_slug').value = category.slug;
    document.getElementById('category_sort_order').value = category.sort_order;
    document.getElementById('category-delete-btn').hidden = false;
    document.getElementById('category-delete-btn').dataset.id = category.id;
  } else {
    document.getElementById('category-modal-title').textContent = 'Add Category';
    document.getElementById('category_id').value = '';
    document.getElementById('category-delete-btn').hidden = true;
  }
  openModal('category-modal');
}

async function saveCategory(e) {
  e.preventDefault();
  const id = document.getElementById('category_id').value;
  const payload = {
    name: document.getElementById('category_name').value.trim(),
    name_en: document.getElementById('category_name_en').value.trim(),
    slug: document.getElementById('category_slug').value.trim(),
    sort_order: parseInt(document.getElementById('category_sort_order').value) || 0,
  };

  let error;
  if (id) {
    ({ error } = await supabaseClient.from('categories').update(payload).eq('id', id));
  } else {
    ({ error } = await supabaseClient.from('categories').insert(payload));
  }

  if (error) { showToast('حصل خطأ: ' + error.message); return; }
  closeModal('category-modal');
  showToast('اتحفظ ✅');
  loadCategoriesAdmin();
  loadCategoriesIntoSelect();
}

async function deleteCategory() {
  const id = document.getElementById('category-delete-btn').dataset.id;
  if (!confirm('متأكد عايز تمسح التصنيف ده؟')) return;
  const { error } = await supabaseClient.from('categories').delete().eq('id', id);
  if (error) { showToast('حصل خطأ: ' + error.message); return; }
  closeModal('category-modal');
  showToast('اتمسح 🗑️');
  loadCategoriesAdmin();
  loadCategoriesIntoSelect();
}

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('add-category-btn');
  if (addBtn) addBtn.addEventListener('click', () => openCategoryModal(null));

  const cancelBtn = document.getElementById('category-cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal('category-modal'));

  const form = document.getElementById('category-form');
  if (form) form.addEventListener('submit', saveCategory);

  const deleteBtn = document.getElementById('category-delete-btn');
  if (deleteBtn) deleteBtn.addEventListener('click', deleteCategory);
});
