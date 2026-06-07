import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'electron-vite';
import vue from '@vitejs/plugin-vue';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  main: {
    entry: 'src/main/index.js',
    vite: {
      build: {
        rollupOptions: {
          external: ['better-sqlite3']
        }
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, './src/main')
        }
      }
    }
  },
  preload: {
    input: resolve(__dirname, 'src/preload/index.js')
  },
  renderer: {
    root: 'src/renderer',
    input: resolve(__dirname, 'src/renderer/index.html'),
    vite: {
      resolve: {
        alias: {
          '@': resolve(__dirname, './src/renderer/src')
        }
      }
    }
  }
});
