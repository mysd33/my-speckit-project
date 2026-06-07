import { navigate } from '../router.js';

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23f0f0f0" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="Arial" font-size="16"%3ENo Photo%3C/text%3E%3C/svg%3E';

export function createAlbumCard(album) {
  const card = document.createElement('div');
  card.className = 'album-card';
  card.dataset.id = album.id;
  card.dataset.sectionDate = album.date;

  const imageSrc = album.cover_thumb_path ? `app://${album.cover_thumb_path}` : PLACEHOLDER_IMAGE;

  card.innerHTML = `
    <img class="album-card-image" src="${imageSrc}" alt="${album.name}">
    <div class="album-info">
      <div class="album-card-name">${album.name}</div>
      <div class="album-card-meta">
        <span>${album.photo_count} photos</span>
        <span>${new Date(album.date).toLocaleDateString()}</span>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    navigate(`#album/${album.id}`);
  });

  return card;
}

export default createAlbumCard;
