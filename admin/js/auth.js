// ============================================================
// Auth: login form handling + session guard for protected pages
// ============================================================

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('login-btn');
  const errorEl = document.getElementById('login-error');

  btn.disabled = true;
  btn.textContent = 'Logging in…';
  errorEl.textContent = '';

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    errorEl.textContent = 'إيميل أو باسورد غلط.';
    btn.disabled = false;
    btn.textContent = 'Login';
    return;
  }

  window.location.href = 'dashboard.html';
}

// Guard: run on protected pages to ensure a session exists
async function requireAuth() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = 'index.html';
    return null;
  }
  return data.session;
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (form) form.addEventListener('submit', handleLogin);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
});
