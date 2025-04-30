
//Full dashboard logic with Dashboard/Orders/Settings view switching, Purchased Items fetching, Avatar upload, Profile editing,
//  Settings updates, Soft Delete account, and Deleted Users Auto-Logout with Warning.

import { sb } from './supaClient.js';

/* ---------- DOM Elements ---------- */
const purchasedDiv = document.getElementById('purchasedItems');
const ordersList = document.getElementById('ordersList');
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
const ordersLink = document.getElementById('orders-link');

// Content areas
const dashboardContent = document.getElementById('dashboard-content');
const settingsContent = document.getElementById('settings-content');
const ordersContent = document.getElementById('orders-content');

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

  //  Check if the user is soft-deleted
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

/* ---------- Load Purchased Items (Dashboard View) ---------- */
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
  ordersContent.style.display = 'none';
  dashboardLink.classList.add('active');
  settingsLink.classList.remove('active');
  ordersLink.classList.remove('active');
});

settingsLink.addEventListener('click', e => {
  e.preventDefault();
  dashboardContent.style.display = 'none';
  settingsContent.style.display = 'block';
  ordersContent.style.display = 'none';
  settingsLink.classList.add('active');
  dashboardLink.classList.remove('active');
  ordersLink.classList.remove('active');
});

ordersLink.addEventListener('click', e => {
  e.preventDefault();
  dashboardContent.style.display = 'none';
  settingsContent.style.display = 'none';
  ordersContent.style.display = 'block';
  ordersLink.classList.add('active');
  dashboardLink.classList.remove('active');
  settingsLink.classList.remove('active');
  loadOrders();
});

/* ---------- Load Orders ---------- */
async function loadOrders() {
  const { data: orders, error } = await sb
    .from('orders')
    .select('id, order_items (product_id, qty), user_id')
    .eq('user_id', userId);

  if (error) {
    ordersList.innerHTML = '<p>Failed to load orders.</p>';
    console.error(error);
    return;
  }

  if (!orders.length) {
    ordersList.innerHTML = '<p>No orders found.</p>';
    return;
  }

  const productIds = orders.flatMap(order => order.order_items.map(item => item.product_id));
  const { data: products } = await sb
    .from('products')
    .select('id, name');

  const productMap = {};
  products.forEach(p => productMap[p.id] = p);


  // no actual links connected but can connect links where users will receieve a pdf which is stored in supabase
  const productDownloads = {
    "Energy-Exertion eBook": "https://website.com/downloads/energy-exertion-ebook.pdf",
    "Beginner Fitness Course": "https://website.com/downloads/beginner-fitness-course.zip",
    "Train Efficiently eBook": "https://website.com/downloads/beginner-fitness-course.zip",
    "FAST Fat‑Loss eBook": "https://website.com/downloads/FAST Fat‑Loss eBook.zip",
    "Muscle-Gain eBook": "https://website.com/downloads/beginner-fitness-course.zip",
    "Advanced Course": "https://website.com/downloads/beginner-fitness-course.zip",
    "Intermediate Course": "https://website.com/downloads/beginner-fitness-course.zip"
  };

  ordersList.innerHTML = '';

  orders.forEach(order => {
    order.order_items.forEach(item => {
      const product = productMap[item.product_id];
      if (product) {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <h3>${product.name}</h3>
          <p>Quantity: ${item.qty}</p>
          ${productDownloads[product.name] ? `<a href="${productDownloads[product.name]}" class="btn" download>Download</a>` : ''}
        `;
        ordersList.appendChild(div);
      }
    });
  });
}

/* ---------- Settings - Change Email ---------- */
changeEmailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newEmail = document.getElementById('new-email').value.trim();

  const { error: authError } = await sb.auth.updateUser({ email: newEmail });
  if (authError) {
    console.error(authError);
    alert('Failed to update email.');
    return;
  }

  alert('Email updated successfully! Please check your inbox.');
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
    alert('Password updated successfully!');
  }
});

/* ---------- Settings - Soft Delete Account ---------- */
deleteAccountBtn.addEventListener('click', async () => {
  const confirmed = confirm('Are you absolutely sure you want to delete your account?');
  if (!confirmed) return;

  const { error } = await sb
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error(error);
    alert('Failed to delete account.');
    return;
  }

  await sb.auth.signOut();
  window.location.href = 'login.html';
});

/* ---------- Logout ---------- */
logoutBtn.onclick = async e => {
  e.preventDefault();
  await sb.auth.signOut();
  window.location.href = 'login.html';
};
