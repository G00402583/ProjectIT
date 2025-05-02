
// Collects user and card details, hashes them, stores order + items in Supabase, and redirects to thankyou.html

import { sb } from './supaClient.js';

const form = document.getElementById('checkoutForm');
const orderSummary = document.getElementById('orderSummary');
const logoutLink = document.getElementById('logoutLink');

let cartItems = [];
let products = [];

// 🔒 Hashing function (SHA-256)
async function hashSHA256(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
}

async function loadCart() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return window.location.replace('login.html?next=checkout.html');

  logoutLink.style.display = 'inline-block';
  const uid = session.user.id;

  const { data: cartData } = await sb
    .from('cart_items')
    .select('id, product_id, qty')
    .eq('cart_id', uid);

  if (!cartData.length) {
    orderSummary.innerHTML = '<tr><td colspan="3">Your cart is empty.</td></tr>';
    return;
  }

  const productIds = cartData.map(item => item.product_id);
  const { data: productData } = await sb
    .from('products')
    .select('id, name, price_cents')
    .in('id', productIds);

  cartItems = cartData;
  products = productData;

  let total = 0;
  const rows = cartItems.map(item => {
    const product = products.find(p => p.id === item.product_id);
    const subtotal = (product.price_cents / 100) * item.qty;
    total += subtotal;

    return `<tr>
      <td>${product.name}</td>
      <td>x${item.qty}</td>
      <td>€${subtotal.toFixed(2)}</td>
    </tr>`;
  }).join('');

  orderSummary.innerHTML = `
    ${rows}
    <tr><td colspan="3"><strong>Total: €${total.toFixed(2)}</strong></td></tr>
  `;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const address = formData.get('address');
  const cardNumber = formData.get('card_number');
  const expiry = formData.get('expiry');
  const cvc = formData.get('cvc');

  const { data: { session } } = await sb.auth.getSession();
  if (!session) return window.location.replace('login.html');

  const userId = session.user.id;

  const totalCents = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id);
    return sum + product.price_cents * item.qty;
  }, 0);

  // 🔐 Hash the card details
  const hashedCard = await hashSHA256(cardNumber);
  const hashedExp  = await hashSHA256(expiry);
  const hashedCVC  = await hashSHA256(cvc);

  // Insert order
  const { data: order, error: orderErr } = await sb
    .from('orders')
    .insert({
      user_id: userId,
      status: 'pending',
      total_cents: totalCents,
      name,
      email,
      phone,
      address,
      card_number: hashedCard,
      expiry: hashedExp,
      cvc: hashedCVC
    })
    .select()
    .single();

  if (orderErr) {
    alert('Failed to place order.');
    console.error(orderErr);
    return;
  }

  const orderItems = cartItems.map(item => {
    const product = products.find(p => p.id === item.product_id);
    return {
      order_id: order.id,
      product_id: product.id,
      qty: item.qty,
      price_cents: product.price_cents
    };
  });

  const { error: itemsErr } = await sb.from('order_items').insert(orderItems);
  if (itemsErr) {
    alert('Failed to save order items.');
    console.error(itemsErr);
    return;
  }

  // Clear cart
  await sb.from('cart_items').delete().eq('cart_id', userId);

  // Save purchased items
const purchasedItems = cartItems.map(item => {
  const product = products.find(p => p.id === item.product_id);
  return { name: product.name };
});
sessionStorage.setItem('purchasedItems', JSON.stringify(purchasedItems));

  // Redirect to thank you page
  window.location.href = 'thank-you.html';
});

logoutLink.addEventListener('click', async e => {
  e.preventDefault();
  await sb.auth.signOut();
  window.location.href = 'login.html';
});

loadCart();
