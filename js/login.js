/* js/login.js – sign‑in + redirect ****************************/

/* ───── Supabase initialise ───── */

import { sb } from "./supaClient.js";
/* ───── helper:  where should we go afterwards? ───── */
const params   = new URLSearchParams(window.location.search);
const NEXT_URL = params.get("next") || "shop.html";

/* ───── already logged‑in?  ➜ NEXT_URL ───── */
sb.auth.getSession().then(({ data:{ session } })=>{
  if (session) window.location.replace(NEXT_URL);
});

/* ───── handle the form ───── */
document.getElementById("loginForm").addEventListener("submit", async (e)=>{
  e.preventDefault();

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if(!email || !password) return alert("Fill out both fields");

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);

  /* success – session token stored in localStorage -> NEXT_URL */
  window.location.replace(NEXT_URL);
});
