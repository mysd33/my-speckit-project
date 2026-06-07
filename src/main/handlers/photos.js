import { ipcMain, dialog } from 'electron';
import { listPhotos, importPhotos, deletePhoto } from '../services/photo-service.js';

export function registerPhotoHandlers() {
  ipcMain.handle('photos:list', async (event, { album_id }) => {
    try {
      const photos = await listPhotos(album_id);
      return { data: photos };
    } catch (error) {
      console.error('Error listing photos:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('photos:openDialog', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      return { data: { file_paths: result.filePaths } };
    } catch (error) {
      console.error('Error opening file dialog:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('photos:import', async (event, { album_id, file_paths }) => {
    try {
      const result = await importPhotos(album_id, file_paths);
      return { data: result };
    } catch (error) {
      console.error('Error importing photos:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('photos:delete', async (event, { id }) => {
    try {
      await deletePhoto(id);
      return { data: { deleted: true } };
    } catch (error) {
      console.error('Error deleting photo:', error);
      return { error: error.message };
    }
  });
}
