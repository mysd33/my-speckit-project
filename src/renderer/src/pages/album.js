import { navigate } from '../router.js';
import api from '../api.js';
import { createEmptyState } from '../components/empty-state.js';
import { createPhotoTile } from '../components/photo-tile.js';
import { createLightbox } from '../components/lightbox.js';

export async function renderAlbumPage(albumId, container) {
  const page = document.createElement('div');
  page.className = 'page';

  const selectedAlbum = await loadAlbum(albumId);

  const header = document.createElement('div');
  header.className = 'album-header';
  header.innerHTML = `
    <button class="back-button">← Back</button>
    <h1 class="page-title">${selectedAlbum?.name ?? 'Album'}</h1>
    <p class="album-subtitle">${selectedAlbum?.date ?? ''}</p>
    <div class="page-actions">
      <button class="button" id="add-photos-btn">+ Add Photos</button>
    </div>
  `;

  page.appendChild(header);

  const content = document.createElement('div');
  content.className = 'container';
  page.appendChild(content);

  container.appendChild(page);

  await loadPhotos(albumId, content);

  // Back button handler
  page.querySelector('.back-button').addEventListener('click', () => {
    navigate('#home');
  });

  // Add photos button handler
  page.querySelector('#add-photos-btn').addEventListener('click', () => {
    console.log('Add photos clicked');
  });
}

async function loadAlbum(albumId) {
  const response = await api.albums.list();
  if (response.error || !response.data) {
    return null;
  }

  return response.data.find((album) => album.id === albumId) ?? null;
}

async function loadPhotos(albumId, container) {
  container.innerHTML = '';

  const response = await api.photos.list({ album_id: albumId });

  if (response.error) {
    container.appendChild(createEmptyState(response.error));
    return;
  }

  const photos = response.data ?? [];
  if (photos.length === 0) {
    container.appendChild(createEmptyState('No photos yet'));
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'photo-grid';

  photos.forEach((photo, index) => {
    const tile = createPhotoTile(photo, () => {
      const lightbox = createLightbox(photos, index);
      document.body.appendChild(lightbox);
    });
    grid.appendChild(tile);
  });

  container.appendChild(grid);
}

export default renderAlbumPage;
