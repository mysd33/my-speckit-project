import api from '../api.js';
import { navigate } from '../router.js';

export async function renderHomePage(container) {
  const page = document.createElement('div');
  page.className = 'page';

  const header = document.createElement('div');
  header.className = 'page-header';
  header.innerHTML = `
    <h1 class="page-title">Photo Albums</h1>
    <div class="page-actions">
      <button class="button" id="new-album-btn">+ New Album</button>
    </div>
  `;

  page.appendChild(header);

  const content = document.createElement('div');
  content.className = 'container';
  page.appendChild(content);

  container.appendChild(page);

  // Load albums
  loadAlbums(content);

  // New album button handler
  document.getElementById('new-album-btn').addEventListener('click', () => {
    // TODO: Implement album creation modal
    console.log('New album clicked');
  });
}

async function loadAlbums(container) {
  try {
    const result = await api.albums.list();

    if (result.error) {
      container.innerHTML = `<div class="empty-state"><p>${result.error}</p></div>`;
      return;
    }

    if (!result.data || result.data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📷</div>
          <div class="empty-state-message">No albums yet</div>
          <div class="empty-state-cta">
            <button class="button" id="create-first-album">Create Your First Album</button>
          </div>
        </div>
      `;
      document.getElementById('create-first-album').addEventListener('click', () => {
        console.log('Create first album clicked');
      });
      return;
    }

    // Group albums by date
    const grouped = {};
    result.data.forEach((album) => {
      if (!grouped[album.date]) {
        grouped[album.date] = [];
      }
      grouped[album.date].push(album);
    });

    // Render groups
    Object.keys(grouped)
      .sort()
      .reverse()
      .forEach((date) => {
        const section = document.createElement('div');
        section.className = 'date-section';
        section.dataset.date = date;

        const header = document.createElement('div');
        header.className = 'date-section-header';
        header.textContent = new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });

        const grid = document.createElement('div');
        grid.className = 'album-grid';

        grouped[date].forEach((album) => {
          const card = document.createElement('div');
          card.className = 'album-card';
          card.draggable = true;
          card.dataset.id = album.id;
          card.dataset.sectionDate = date;

          const img = document.createElement('img');
          img.className = 'album-card-image';
          img.alt = album.name;
          if (album.cover_thumb_path) {
            img.src = `app://${album.cover_thumb_path}`;
          } else {
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-family="Arial" font-size="16"%3ENo Photo%3C/text%3E%3C/svg%3E';
          }

          const info = document.createElement('div');
          info.className = 'album-card-info';
          info.innerHTML = `
            <div class="album-card-name">${album.name}</div>
            <div class="album-card-meta">
              <span>${album.photo_count} photos</span>
              <span>${new Date(album.created_at).toLocaleDateString()}</span>
            </div>
          `;

          card.appendChild(img);
          card.appendChild(info);
          card.addEventListener('click', () => {
            navigate(`#album/${album.id}`);
          });

          // Drag handlers
          card.addEventListener('dragstart', (e) => {
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
          });

          card.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
          });

          grid.appendChild(card);
        });

        section.appendChild(header);
        section.appendChild(grid);
        container.appendChild(section);
      });
  } catch (error) {
    console.error('Error loading albums:', error);
    container.innerHTML = `<div class="empty-state"><p>Error loading albums</p></div>`;
  }
}

export default renderHomePage;
