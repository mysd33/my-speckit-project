import { navigate } from '../router.js';

export async function renderAlbumPage(albumId, container) {
  const page = document.createElement('div');
  page.className = 'page';

  const header = document.createElement('div');
  header.className = 'page-header';
  header.innerHTML = `
    <button class="back-button">← Back</button>
    <h1 class="page-title">Album View</h1>
    <div class="page-actions">
      <button class="button" id="add-photos-btn">+ Add Photos</button>
    </div>
  `;

  page.appendChild(header);

  const content = document.createElement('div');
  content.className = 'container';
  content.innerHTML = '<p>Album page stub for ID: ' + albumId + '</p>';
  page.appendChild(content);

  container.appendChild(page);

  // Back button handler
  document.querySelector('.back-button').addEventListener('click', () => {
    navigate('#home');
  });

  // Add photos button handler
  document.getElementById('add-photos-btn').addEventListener('click', () => {
    console.log('Add photos clicked');
  });
}

export default renderAlbumPage;
