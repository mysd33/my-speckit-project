import { ipcMain } from 'electron';
import { listAlbums, createAlbum, updateAlbum, deleteAlbum, reorderAlbums } from '../services/album-service.js';

export function registerAlbumHandlers() {
  ipcMain.handle('albums:list', async () => {
    try {
      const albums = await listAlbums();
      return { data: albums };
    } catch (error) {
      console.error('Error listing albums:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('albums:create', async (event, { name, date }) => {
    try {
      const album = await createAlbum(name, date);
      return { data: album };
    } catch (error) {
      console.error('Error creating album:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('albums:update', async (event, { id, name, date }) => {
    try {
      const album = await updateAlbum(id, name, date);
      return { data: album };
    } catch (error) {
      console.error('Error updating album:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('albums:delete', async (event, { id }) => {
    try {
      await deleteAlbum(id);
      return { data: { deleted: true } };
    } catch (error) {
      console.error('Error deleting album:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('albums:reorder', async (event, { updates }) => {
    try {
      const count = await reorderAlbums(updates);
      return { data: { updated: count } };
    } catch (error) {
      console.error('Error reordering albums:', error);
      return { error: error.message };
    }
  });
}
