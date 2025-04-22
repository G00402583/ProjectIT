// This is the new code written for FitFusion user dashboard
// Description: Handles authentication, loads user info, bio, and purchased items

import { sb } from './supaClient.js';

const logoutLink = document.getElementById('logoutLink');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const bioForm = document.getElementById('bioForm');
const bioInput = document.getElementById('bioInput');
const bioStatus = document.getElementById('bioStatus');
const purchasedItems = document.getElementById('purchasedItems');

let currentUser = null;

// Main loader
(async function loadDashboard() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return window.location.replace('login.html?next=dashboard.html');

  logoutLink.style.display = 'inline-block';
  currentUser = session.user;

  userName.textContent = currentUser.user_metadata?.name || 'No name';
  userEmail.textContent = currentUser.email;

  loadBio();
  loadPurchases();
})();

// Load saved bio from `profiles`
async function loadBio() {
  const { data, error } = await sb
    .from('profiles')
    .select('bio')
    .eq('id', currentUser.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Bio fetch error:', error);
    return;
  }

  if (data?.bio) bioInput.value = data.bio;
}

// Save bio on form submit
bioForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const bio = bioInput.value.trim();

  const { error } = await sb.from('profiles').upsert({
    id: currentUser.id,
    email: currentUser.email,
    bio
  });

  if (error) {
    console.error('Bio save error:', error);
    bioStatus.textContent = 'Error saving bio.';
  } else {
    bioStatus.textContent = 'Bio saved!';
  }
});

// Load user's purchased products
async function loadPurchases() {
  const { data: orders, error } = await sb
    .from('orders')
    .select(`
      id,
      order_items (
        qty,
        product_id,
        products (
          name,
          image_url
        )
      )
    `)
    .eq('user_id', currentUser.id);

  if (error || !orders.length) {
    purchasedItems.innerHTML = '<p>No purchases found.</p>';
    return;
  }

  const rows = orders.flatMap(order =>
    order.order_items.map(item => {
      const product = item.products;
      return `
        <div class="purchase-card">
          <img src="${product.image_url}" alt="${product.name}" style="height: 50px;" />
          <p><strong>${product.name}</strong> x${item.qty}</p>
        </div>
      `;
    })
  ).join('');

  purchasedItems.innerHTML = rows;
}

// Logout link
logoutLink.addEventListener('click', async e => {
  e.preventDefault();
  await sb.auth.signOut();
  window.location.replace('login.html');
});
