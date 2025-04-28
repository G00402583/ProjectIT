// ✅ This is the new code written
// Description: Full dashboard logic with Dashboard/Settings view switching, Purchased Items fetching, Avatar upload, Profile editing, Settings updates, Soft Delete account, and Deleted Users Auto-Logout with Warning.

import { sb } from './supaClient.js';

/* ---------- DOM Elements ---------- */
const purchasedDiv = document.getElementById('purchasedItems');
const logoutBtn = document.getElementById('logoutBtn');

// Avatar
const avatarImg = document.getElementById('avatar-img');
const avatarInput = document.getElementById('avatar-input');
const changeAvatarBtn = document.getElementById('change-avatar-btn');

// Profile view
const profileDisplay = document.getElementById('profile-display');
const bioDisplay = document.getElementById('bio-display');
const goalsDisplay = document.getElementById('goals-display');
const levelDisplay = document.getElementById('level-display');

// Profile form
const profileForm = document.getElementById('profileForm');
const bioInput = document.getElementById('bio-input');
const goalsInput = document.getElementById('goals-input');
const levelInput = document.getElementById('level-input');

// Edit buttons
const editBioBtn = document.getElementById('edit-bio-btn');
const editGoalsBtn = document.getElementById('edit-goals-btn');
const editLevelBtn = document.getElementById('edit-level-btn');

// Sidebar links
const dashboardLink = document.getElementById('dashboard-link');
const settingsLink = document.getElementById('settings-link');

// Content areas
const dashboardContent = document.getElementById('dashboard-content');
const settingsContent = document.getElementById('settings-content');

// Settings forms
const changeEmailForm = document.getElementById('change-email-form');
const changePasswordForm = document.getElementById('change-password-form');
const deleteAccountBtn = document.getElementById('delete-account-btn');

let userId = null;

/* ---------- Init ---------- */
(async function initDashboard() {
  const { data: { session }, error } = await sb.auth.getSession();
  if (error || !session) {
    window.location.href = 'login.html?next=dashboard.html';
    return;
  }

  userId = session.user.id;

  // ⚡ Check if the user is soft-deleted
  const { data: profile, error: profileError } = await sb
    .from('profiles')
    .select('deleted_at')
    .eq('id', userId)
    .single();

  if (profileError || profile?.deleted_at) {
    alert('Your account has been deleted. Please contact support.');
    await sb.auth.signOut();
    window.location.href = 'login.html';
    return;
  }

  await Promise.all([loadPurchasedItems(), loadProfile()]);
})();

/* ---------- Load Purchased Items ---------- */
async function loadPurchasedItems() {
  const { data: orders, error: ordersError } = await sb
    .from('orders')
    .select('id')
    .eq('user_id', userId);

  if (ordersError) {
    console.error(ordersError);
    purchasedDiv.innerHTML = '<p>Failed to load purchases.</p>';
    return;
  }

  if (!orders || orders.length === 0) {
    purchasedDiv.innerHTML = '<p>No purchases yet.</p>';
    return;
  }

  const orderIds = orders.map(order => order.id);

  const { data: items, error: itemsError } = await sb
    .from('order_items')
    .select('qty, products(name, kind)')
    .in('order_id', orderIds);

  if (itemsError) {
    console.error(itemsError);
    purchasedDiv.innerHTML = '<p>Failed to load purchases.</p>';
    return;
  }

  if (!items || items.length === 0) {
    purchasedDiv.innerHTML = '<p>No purchases yet.</p>';
    return;
  }

  purchasedDiv.innerHTML = items.map(item => `
    <div class="purchased-item">
      <strong>${item.products.name}</strong> (${item.products.kind}) ×${item.qty}
    </div>
  `).join('');
}

/* ---------- Load Profile ---------- */
async function loadProfile() {
  const { data, error } = await sb
    .from('profiles')
    .select('bio, goals, level, avatar_url')
    .eq('id', userId)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    console.error('Profile not found or deleted:', error);
    await sb.auth.signOut();
    window.location.href = 'login.html';
    return;
  }

  bioDisplay.textContent = data.bio || '—';
  goalsDisplay.textContent = data.goals || '—';
  levelDisplay.textContent = data.level || '—';

  bioInput.value = data.bio || '';
  goalsInput.value = data.goals || '';
  levelInput.value = data.level || '';

  avatarImg.src = data.avatar_url || './images/default-avatar.png';

  toggleToView();
}

/* ---------- View/Edit Toggle for Profile ---------- */
function toggleToEdit(field) {
  profileDisplay.style.display = 'none';
  profileForm.style.display = 'flex';

  if (field === 'bio') bioInput.focus();
  else if (field === 'goals') goalsInput.focus();
  else if (field === 'level') levelInput.focus();
}

function toggleToView() {
  profileForm.style.display = 'none';
  profileDisplay.style.display = 'flex';
}

editBioBtn.onclick = () => toggleToEdit('bio');
editGoalsBtn.onclick = () => toggleToEdit('goals');
editLevelBtn.onclick = () => toggleToEdit('level');

/* ---------- Save Profile ---------- */
profileForm.addEventListener('submit', async e => {
  e.preventDefault();

  const payload = {
    id: userId,
    bio: bioInput.value.trim(),
    goals: goalsInput.value.trim(),
    level: levelInput.value.trim()
  };

  const { error } = await sb.from('profiles').upsert(payload);

  if (error) {
    console.error(error);
    alert('Failed to save profile.');
    return;
  }

  bioDisplay.textContent = payload.bio || '—';
  goalsDisplay.textContent = payload.goals || '—';
  levelDisplay.textContent = payload.level || '—';

  toggleToView();
  alert('Profile updated!');
});

/* ---------- Upload Avatar ---------- */
changeAvatarBtn.onclick = () => avatarInput.click();

avatarInput.addEventListener('change', async () => {
  const file = avatarInput.files[0];
  if (!file) return;

  avatarImg.src = URL.createObjectURL(file);

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await sb
    .storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    console.error(uploadError);
    alert('Could not upload image.');
    return;
  }

  const { data: { publicUrl }, error: urlError } = await sb
    .storage
    .from('avatars')
    .getPublicUrl(fileName);

  if (urlError) {
    console.error(urlError);
    alert('Could not fetch uploaded image URL.');
    return;
  }

  const { error: updateError } = await sb
    .from('profiles')
    .upsert({ id: userId, avatar_url: publicUrl });

  if (updateError) {
    console.error(updateError);
    alert('Failed to update avatar.');
  }
});

/* ---------- Sidebar View Switching ---------- */
dashboardLink.addEventListener('click', e => {
  e.preventDefault();
  dashboardContent.style.display = 'block';
  settingsContent.style.display = 'none';
  dashboardLink.classList.add('active');
  settingsLink.classList.remove('active');
});

settingsLink.addEventListener('click', e => {
  e.preventDefault();
  dashboardContent.style.display = 'none';
  settingsContent.style.display = 'block';
  settingsLink.classList.add('active');
  dashboardLink.classList.remove('active');
});

/* ---------- Settings - Change Email ---------- */
changeEmailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newEmail = document.getElementById('new-email').value.trim();

  const { error: authError } = await sb.auth.updateUser({ email: newEmail });
  if (authError) {
    console.error(authError);
    alert('Failed to update email in Auth.');
    return;
  }

  const { error: profileError } = await sb
    .from('profiles')
    .update({ email: newEmail })
    .eq('id', userId);

  if (profileError) {
    console.error(profileError);
    alert('Failed to update email in Profiles table.');
    return;
  }

  alert('Email updated! Please check your inbox for confirmation.');
});

/* ---------- Settings - Change Password ---------- */
changePasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('new-password').value.trim();

  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) {
    console.error(error);
    alert('Failed to update password.');
  } else {
    alert('Password updated successfully! Please check your inbox if email confirmation is required.');
  }
});

/* ---------- Settings - Soft Delete Account ---------- */
deleteAccountBtn.addEventListener('click', async () => {
  const confirmed = confirm('Are you absolutely sure you want to delete your account? This cannot be undone.');
  if (!confirmed) return;

  try {
    const { error: profileError } = await sb
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userId);

    if (profileError) {
      console.error(profileError);
      alert('Failed to mark account as deleted.');
      return;
    }

    await sb.auth.signOut();

    alert('Your account has been marked for deletion.');
    window.location.href = 'login.html';

  } catch (error) {
    console.error(error);
    alert('Something went wrong.');
  }
});

/* ---------- Logout ---------- */
logoutBtn.onclick = async e => {
  e.preventDefault();
  await sb.auth.signOut();
  window.location.href = 'login.html';
};
