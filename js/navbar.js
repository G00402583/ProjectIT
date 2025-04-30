// – Dynamically injects navigation bar (except on login/signup pages)
import { sb } from './supaClient.js';

const path = window.location.pathname;
const currentPage = path.substring(path.lastIndexOf('/') + 1);

// Only inject navbar if NOT on login or signup page
if (!['login.html', 'signup.html'].includes(currentPage)) {
  const navbarHTML = `
    <header class="cool-header">
      <div class="header-left">
        <a href="index.html" class="brand-link">
          <img src="logo71.gif" alt="FitFusion Logo" />
        </a>
      </div>
      <nav class="header-nav">
        <a href="shop.html" class="nav-item">Shop</a>
        <a href="courses.html" class="nav-item">Courses</a>
        <a href="#" class="nav-item" id="dashboardLink">Dashboard</a>
        <a href="cart.html" class="nav-item">Cart</a>
        <a href="contact.html" class="nav-item highlight">Contact</a>
        <a href="#" id="logoutLink" class="nav-item" style="display:none;">Logout</a>
      </nav>
    </header>
  `;

  document.body.insertAdjacentHTML('afterbegin', navbarHTML);

  document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await sb.auth.getSession();
    const logoutLink = document.getElementById('logoutLink');
    const dashboardLink = document.getElementById('dashboardLink');

    if (session) {
      logoutLink.style.display = 'inline-block';
      dashboardLink.href = 'dashboard.html';
    } else {
      dashboardLink.href = 'login.html?next=dashboard.html';
    }

    logoutLink.addEventListener('click', async e => {
      e.preventDefault();
      await sb.auth.signOut();
      window.location.href = 'login.html';
    });
  });
}


// --- service-worker registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch(err => console.error('SW registration failed:', err));
  });
}


