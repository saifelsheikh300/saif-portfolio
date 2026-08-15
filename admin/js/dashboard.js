// ============================================================
// Dashboard boot: auth guard, then load everything
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  const session = await requireAuth();
  if (!session) return; // requireAuth already redirects to login

  await loadCategoriesIntoSelect();
  loadProjectsAdmin();
  loadCategoriesAdmin();
  loadContentAdmin();
  loadThemeAdmin();
  loadAccountInfo();
});
