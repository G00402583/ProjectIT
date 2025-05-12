

const SUPABASE_URL      = "#";
const SUPABASE_ANON_KEY = "#";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const logoutLink = document.getElementById("logoutLink");

/* 1️  show / hide the link on page load */
sb.auth.getSession().then(({ data:{ session } })=>{
  if (session) {
    logoutLink.style.display = "inline-block";
  } else {
    /* no token?  kick back to sign‑in */
    window.location.replace("login.html");
  }
});

/* 2️  sign–out handler  */
logoutLink.addEventListener("click", async ()=>{
  await sb.auth.signOut();             // removes the token
  window.location.replace("login.html");
});
