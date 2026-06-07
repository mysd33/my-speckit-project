import { app, BrowserWindow, ipcMain, protocol, net } from 'electron';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeDatabase } from './db.js';
import { registerAlbumHandlers } from './handlers/albums.js';
import { registerPhotoHandlers } from './handlers/photos.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const isDev = process.env.VITE_DEV_SERVER_URL;

let mainWindow;

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, '../preload/index.js')
    }
  });

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist-electron/renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register custom app:// protocol
function registerProtocol() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true
      }
    }
  ]);

  app.whenReady().then(() => {
    protocol.handle('app', async (req) => {
      const { pathname } = new URL(req.url);
      const filePath = path.resolve(app.getPath('userData'), '.' + pathname);

      // Security: validate path doesn't escape userData
      const relPath = path.relative(app.getPath('userData'), filePath);
      if (relPath.startsWith('..')) {
        return new Response('Forbidden', { status: 403 });
      }

      try {
        return net.fetch(pathToFileURL(filePath).toString());
      } catch (e) {
        console.error('Failed to serve file:', e);
        return new Response('Not Found', { status: 404 });
      }
    });
  });
}

// Initialize app
app.on('ready', async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Register IPC handlers
    registerAlbumHandlers();
    registerPhotoHandlers();

    // Create window
    createWindow();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Register protocol before app.on('ready')
registerProtocol();

export default { createWindow };
