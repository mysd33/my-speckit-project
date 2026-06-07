import { renderHomePage } from './pages/home.js';
import { renderAlbumPage } from './pages/album.js';

let currentRoute = null;
let pages = {};

// Register pages
pages['#home'] = renderHomePage;
pages['#album'] = renderAlbumPage;

// Navigate to a route
export function navigate(hash) {
  window.location.hash = hash;
}

// Render the current page based on the hash
async function renderCurrentRoute() {
  const hash = window.location.hash || '#home';
  const [route, ...params] = hash.replace('#', '').split('/');
  const pageKey = '#' + route;

  if (pages[pageKey] && pageKey !== currentRoute) {
    currentRoute = pageKey;
    const app = document.getElementById('app');
    app.innerHTML = '';
    
    if (route === 'album' && params[0]) {
      await pages[pageKey](params[0], app);
    } else {
      await pages[pageKey](app);
    }
  }
}

// Initialize router and listen for hash changes
export function initializeRouter() {
  window.addEventListener('hashchange', renderCurrentRoute);
  renderCurrentRoute();
}

export default { navigate, initializeRouter };
