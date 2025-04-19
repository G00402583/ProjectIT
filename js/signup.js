/* js/signup.js – instant sign‑up, profile row, smart redirect  */

import { sb } from "./supaClient.js";     // 👈 only import, no new client

/* where should we go afterwards?  /signup.html?next=cart.html  */
const nextURL = new URLSearchParams(location.search).get("next") || "shop.html";

/* already have a session? -> straight to nextURL */
sb.auth.getSession().then(({ data:{ session } })=>{
  if (session) window.location.replace(nextURL);
});

document.getElementById("signupForm").addEventListener("submit", async (e)=>{
  e.preventDefault();

  /* gather + validate */
  const email     = document.getElementById("email").value.trim();
  const password  = document.getElementById("password").value.trim();
  const password2 = document.getElementById("password2").value.trim();

  if (!email || !password || !password2)  return alert("Fill out every field.");
  if (password !== password2)             return alert("Passwords do not match.");

  /* 1️⃣ create Auth user (session issued instantly) */
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) return alert(error.message);

  /* 2️⃣ optional profile row */
  await sb.from("profiles").insert({ id:data.user.id, email });

  /* 3️⃣ go to the intended page (cart or shop) */
  window.location.replace(nextURL);
});
