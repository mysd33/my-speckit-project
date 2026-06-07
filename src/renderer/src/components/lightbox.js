export function createLightbox(photos, startIndex = 0, onClose) {
  let currentIndex = startIndex;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';

  const image = document.createElement('img');
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'lightbox-close';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', 'Close lightbox');

  const nav = document.createElement('div');
  nav.className = 'lightbox-nav';

  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.className = 'lightbox-button';
  prevButton.textContent = '←';
  prevButton.setAttribute('aria-label', 'Previous photo');

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'lightbox-button';
  nextButton.textContent = '→';
  nextButton.setAttribute('aria-label', 'Next photo');

  nav.appendChild(prevButton);
  nav.appendChild(nextButton);

  function renderPhoto() {
    const current = photos[currentIndex];
    if (!current) {
      return;
    }
    image.src = `app://${current.file_path}`;
    image.alt = current.filename ?? 'Photo';
  }

  function close() {
    document.removeEventListener('keydown', onKeyDown);
    overlay.remove();
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      close();
    }
    if (event.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + photos.length) % photos.length;
      renderPhoto();
    }
    if (event.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % photos.length;
      renderPhoto();
    }
  }

  prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    renderPhoto();
  });

  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % photos.length;
    renderPhoto();
  });

  closeButton.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  overlay.appendChild(image);
  overlay.appendChild(closeButton);
  overlay.appendChild(nav);

  renderPhoto();
  document.addEventListener('keydown', onKeyDown);

  return overlay;
}

export default createLightbox;
