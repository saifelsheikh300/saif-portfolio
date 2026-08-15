// ============================================================
// Account admin: show email, change password
// ============================================================

async function loadAccountInfo() {
  const { data } = await supabaseClient.auth.getUser();
  const el = document.getElementById('account-email');
  if (el && data.user) el.textContent = 'Logged in as: ' + data.user.email;
}

async function changePassword(e) {
  e.preventDefault();
  const newPassword = document.getElementById('new_password').value;
  const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
  if (error) { showToast('حصل خطأ: ' + error.message); return; }
  showToast('الباسورد اتغيّر ✅');
  document.getElementById('password-form').reset();
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('password-form');
  if (form) form.addEventListener('submit', changePassword);
});
