/* shopAuth.js – show Log‑out link, sign out when clicked */

const SUPABASE_URL      = "https://kqzevnsdurpptiaxszqq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxemV2bnNkdXJwcHRpYXhzenFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjA4NDYsImV4cCI6MjA1OTU5Njg0Nn0.eM-M08VulR5HiwKs-t7y2xehqUwBJPW0dnKENxMvArg";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const logoutLink = document.getElementById("logoutLink");

/* 1️⃣  show / hide the link on page load */
sb.auth.getSession().then(({ data:{ session } })=>{
  if (session) {
    logoutLink.style.display = "inline-block";
  } else {
    /* no token?  kick back to sign‑in */
    window.location.replace("login.html");
  }
});

/* 2️⃣  sign–out handler  */
logoutLink.addEventListener("click", async ()=>{
  await sb.auth.signOut();             // removes the token
  window.location.replace("login.html");
});
