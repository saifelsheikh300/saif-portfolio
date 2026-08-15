// ============================================================
// Shared admin UI helpers: toast, modal, tab switching
// ============================================================

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function initTabs() {
  const links = document.querySelectorAll('.sidebar-link[data-panel]');
  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + link.dataset.panel).classList.add('active');
    });
  });
}

document.addEventListener('DOMContentLoaded', initTabs);
