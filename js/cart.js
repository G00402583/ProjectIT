//  fetch & render cart, support inline quantity updates and redirect to custom checkout
import { sb } from './supaClient.js';

const cartBody    = document.getElementById('cartBody');
const cartTotal   = document.getElementById('cartTotal');
const logoutLink  = document.getElementById('logoutLink');
const checkoutBtn = document.getElementById('checkoutBtn');

async function renderCart() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return window.location.replace('login.html?next=cart.html');

  logoutLink.style.display = 'inline-block';
  const uid = session.user.id;

  const { data: cartItems, error: cartErr } = await sb
    .from('cart_items')
    .select('id, cart_id, product_id, qty')
    .eq('cart_id', uid);

  if (cartErr || !cartItems.length) {
    cartBody.innerHTML = '<tr><td colspan="6">Your cart is empty.</td></tr>';
    cartTotal.textContent = '€ 0.00';
    return;
  }

  const productIds = cartItems.map(item => item.product_id);
  const { data: products, error: prodErr } = await sb
    .from('products')
    .select('id, name, image_url, price_cents')
    .in('id', productIds);

  if (prodErr) {
    console.error('Error fetching products:', prodErr);
    return;
  }

  let total = 0;
  cartBody.innerHTML = cartItems.map(item => {
    const product = products.find(p => p.id === item.product_id);
    const price = product.price_cents / 100;
    const subtotal = price * item.qty;
    total += subtotal;

    return `
      <tr data-id="${item.id}" data-pid="${product.id}">
        <td><img src="${product.image_url}" alt="${product.name}" style="height: 40px"></td>
        <td>${product.name}</td>
        <td>€ ${price.toFixed(2)}</td>
        <td><input type="number" class="qty-input" min="0" value="${item.qty}" style="width: 60px; text-align: center;"></td>
        <td>€ ${subtotal.toFixed(2)}</td>
        <td><button class="remove-btn">Remove</button></td>
      </tr>
    `;
  }).join('');

  cartTotal.textContent = '€ ' + total.toFixed(2);
  attachHandlers();
}

function attachHandlers() {
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', async e => {
      const tr = e.target.closest('tr');
      const id = tr.dataset.id;
      const qty = parseInt(e.target.value);

      if (qty <= 0) {
        await sb.from('cart_items').delete().eq('id', id);
      } else {
        await sb.from('cart_items').update({ qty }).eq('id', id);
      }
      renderCart();
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tr = btn.closest('tr');
      const id = tr.dataset.id;
      await sb.from('cart_items').delete().eq('id', id);
      renderCart();
    });
  });
}

logoutLink.addEventListener('click', async e => {
  e.preventDefault();
  await sb.auth.signOut();
  window.location.replace('login.html');
});

// ✅ Redirect to internal checkout page
checkoutBtn.addEventListener('click', async e => {
  e.preventDefault();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return window.location.replace('login.html');

  window.location.href = 'checkout.html';
});

renderCart();
