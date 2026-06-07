import api from '../api.js';
import { createAlbumCard } from '../components/album-card.js';
import { createEmptyState } from '../components/empty-state.js';

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
  await loadAlbums(content);

  // New album button handler
  document.getElementById('new-album-btn').addEventListener('click', () => {
    // TODO: Implement album creation modal
    console.log('New album clicked');
  });
}

async function loadAlbums(container) {
  container.innerHTML = '';

  try {
    const result = await api.albums.list();

    if (result.error) {
      const errorState = createEmptyState(result.error);
      container.appendChild(errorState);
      return;
    }

    if (!result.data || result.data.length === 0) {
      const emptyState = createEmptyState('No albums yet', 'Create your first album', () => {
        console.log('Create first album clicked');
      });
      container.appendChild(emptyState);
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
      .sort((a, b) => b.localeCompare(a))
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
          const card = createAlbumCard(album);
          grid.appendChild(card);
        });

        section.appendChild(header);
        section.appendChild(grid);
        container.appendChild(section);
      });
  } catch (error) {
    console.error('Error loading albums:', error);
    const errorState = createEmptyState('Error loading albums');
    container.appendChild(errorState);
  }
}

export default renderHomePage;
