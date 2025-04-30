import { sb }       from "./supaClient.js";
import { addItem }  from "./cartHelpers.js";

// 1) Logout link visibility + handler
const logoutLink = document.getElementById("logoutLink");
sb.auth.getSession().then(({ data:{ session } }) => {
  if (session) logoutLink.style.display = "inline-block";
});
logoutLink?.addEventListener("click", async e => {
  e.preventDefault();
  await sb.auth.signOut();
  window.location.replace("login.html");
});

// 2) Gate every “Add to Cart” button
document.querySelectorAll(".btn-add-cart").forEach(btn => {
  btn.addEventListener("click", async e => {
    e.preventDefault();

    // check session
    const { data:{ session } } = await sb.auth.getSession();
    if (!session) {
      // remember where to go after login
      return window.location.replace("login.html?next=cart.html");
    }

    // logged‑in: actually add
    const userId     = session.user.id;
    const productId  = btn.dataset.product;       // `data-product="…"`
    try {
      const totalCents = await addItem(userId, productId);
      console.log("🛒 new total:", (totalCents/100).toFixed(2));
    } catch(err) {
      console.error("Failed to add to cart:", err.message);
    }

    // go see cart
    window.location.replace("cart.html");
  });
});
