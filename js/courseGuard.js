// js/courseGuard.js – gate “Enroll Now” buttons & handle Log‑out
// must be loaded via: <script type="module" src="js/courseGuard.js"></script>

import { sb } from "./supaClient.js";   // shared client

// ─── Log‑out link (only visible when you’re signed in) ───
const logoutLink = document.getElementById("logoutLink");

sb.auth.getSession().then(({ data:{ session } }) => {
  if (session) logoutLink.style.display = "inline-block";
});

logoutLink?.addEventListener("click", async (e) => {
  e.preventDefault();
  await sb.auth.signOut();
  window.location.replace("login.html");
});

// ─── Helper: add (or +1) the course in your cart ─────────
async function addCourseToCart(courseId) {
  const { data:{ session } } = await sb.auth.getSession();
  const uid = session.user.id;

  // ensure a cart row exists
  await sb.from("carts").upsert({ user_id: uid });

  // call your Postgres helper to insert or increment
  await sb.rpc("increment_item_qty", {
    p_cart:    uid,
    p_product: courseId
  });
}

// ─── Gate every “Enroll Now” button ─────────────────────
document.querySelectorAll(".btn-enroll").forEach(btn => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    const { data:{ session } } = await sb.auth.getSession();

    if (!session) {
      // not signed‑in → go to login, then back to cart
      window.location.replace("login.html?next=cart.html");
      return;
    }

    // signed‑in: grab ID, add to cart, then view the cart
    const courseId = btn.dataset.course;
    await addCourseToCart(courseId);
    window.location.replace("cart.html");
  });
});
