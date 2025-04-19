// js/cartHelpers.js – add or increment item in cart_items

import { sb } from './supaClient.js';

export async function addItem(userId, productId) {
  // 1) Ensure the user has a cart
  await sb.from("carts").upsert({ user_id: userId });

  // 2) Check if this product is already in the cart
  const { data: existing, error: errFind } = await sb
    .from("cart_items")
    .select("id, qty")
    .eq("cart_id", userId)
    .eq("product_id", productId)
    .single();

  if (errFind && errFind.code !== "PGRST116") {
    throw new Error("Error checking cart: " + errFind.message);
  }

  if (existing) {
    // 3a) Already there – update qty
    const { error: errUpdate } = await sb
      .from("cart_items")
      .update({ qty: existing.qty + 1 })
      .eq("id", existing.id);

    if (errUpdate) throw new Error("Could not update quantity");
  } else {
    // 3b) Not there – insert new item
    const { error: errInsert } = await sb
      .from("cart_items")
      .insert({ cart_id: userId, product_id: productId, qty: 1 });

    if (errInsert) throw new Error("Could not add item to cart");
  }

  // 4) Return total value for feedback (optional)
  const { data: items, error: errTotal } = await sb
    .from("cart_items")
    .select("qty, product_id")
    .eq("cart_id", userId);

  if (errTotal) return 0;

  const { data: products } = await sb
    .from("products")
    .select("id, price_cents")
    .in("id", items.map(i => i.product_id));

  return items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id);
    return sum + (product?.price_cents || 0) * item.qty;
  }, 0);
}
