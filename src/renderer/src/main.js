import { initializeRouter, navigate } from './router.js';
import './assets/style.css';

// Initialize router and mount initial page
document.addEventListener('DOMContentLoaded', async () => {
  initializeRouter();
  // Load initial route
  if (!window.location.hash) {
    navigate('#home');
  }
});
