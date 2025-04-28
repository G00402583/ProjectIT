/* contact-demo.js – front-end-only “fake send” */

const form    = document.getElementById('contactForm');
const sendBtn = document.getElementById('sendBtn');
const status  = document.getElementById('formStatus');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  // simple UX feedback
  sendBtn.disabled = true;
  status.textContent = 'Sending…';
  status.style.color = '#fff';

  /* pretend to send */
  setTimeout(() => {
    status.textContent = '✅ Message sent! We’ll get back to you shortly.';
    status.style.color = 'limegreen';

    form.reset();
    sendBtn.disabled = false;
  }, 1000);
});
