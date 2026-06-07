export function createPhotoTile(photo, onClick) {
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'photo-tile-button';
  tile.dataset.id = photo.id;

  const image = document.createElement('img');
  image.className = 'photo-tile';
  image.src = `app://${photo.thumb_path}`;
  image.alt = photo.filename ?? 'Photo';

  tile.appendChild(image);
  tile.addEventListener('click', () => {
    if (typeof onClick === 'function') {
      onClick(photo);
    }
  });

  return tile;
}

export default createPhotoTile;
