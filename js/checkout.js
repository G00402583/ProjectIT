// js/checkout.js – Custom checkout to collect user and card details, save to Supabase, and redirect

import { sb } from './supaClient.js';

const form = document.getElementById('checkoutForm');
const orderSummary = document.getElementById('orderSummary').querySelector('tbody');
let cartItems = [];
let products = [];

async function loadCart() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return window.location.replace('login.html?next=checkout.html');

  const uid = session.user.id;

  const { data: cartData, error: cartErr } = await sb
    .from('cart_items')
    .select('id, product_id, qty')
    .eq('cart_id', uid);

  if (cartErr || !cartData.length) {
    orderSummary.innerHTML = '<tr><td colspan="3">Your cart is empty.</td></tr>';
    return;
  }

  const productIds = cartData.map(ci => ci.product_id);
  const { data: productData } = await sb
    .from('products')
    .select('id, name, price_cents')
    .in('id', productIds);

  cartItems = cartData;
  products = productData;

  let total = 0;
  orderSummary.innerHTML = cartItems.map(item => {
    const product = products.find(p => p.id === item.product_id);
    const subtotal = (product.price_cents / 100) * item.qty;
    total += subtotal;
    return `
      <tr>
        <td>${product.name}</td>
        <td>${item.qty}</td>
        <td>€${subtotal.toFixed(2)}</td>
      </tr>
    `;
  }).join('');
  orderSummary.innerHTML += `<tr><td colspan="2"><strong>Total:</strong></td><td><strong>€${total.toFixed(2)}</strong></td></tr>`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const { data: { session } } = await sb.auth.getSession();
  if (!session) return window.location.replace('login.html');

  const userId = session.user.id;
  const formData = new FormData(form);
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const address = formData.get('address');

  const cardNumber = formData.get('card_number');
  const expiry = formData.get('card_expiry');
  const cvc = formData.get('card_cvc');

  if (!cardNumber || !expiry || !cvc) {
    return alert("Please enter valid card details.");
  }

  const totalCents = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id);
    return sum + product.price_cents * item.qty;
  }, 0);

  const { data: order, error: orderErr } = await sb
    .from('orders')
    .insert({
      user_id: userId,
      status: 'paid',
      total_cents: totalCents,
      name,
      email,
      phone,
      address,
      card_number: cardNumber,
      card_expiry: expiry,
      card_cvc: cvc
    })
    .select()
    .single();

  if (orderErr) {
    console.error(orderErr);
    return alert('Failed to place order.');
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
    console.error(itemsErr);
    return alert('Failed to save order items.');
  }

  await sb.from('cart_items').delete().eq('cart_id', userId);

  window.location.href = 'thank-you.html';
});

loadCart();
