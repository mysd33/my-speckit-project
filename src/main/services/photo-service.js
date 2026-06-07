import { randomUUID } from 'node:crypto';
import { getDb } from '../db.js';
import { stat, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { app } from 'electron';
import { nativeImage } from 'electron';

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// Get photos directory
function getPhotosDir() {
  return join(app.getPath('userData'), 'photos');
}

// Get album directory
function getAlbumDir(albumId) {
  return join(getPhotosDir(), albumId);
}

// List photos for album
export async function listPhotos(albumId) {
  const db = getDb();
  const photos = db
    .prepare(`
      SELECT 
        id,
        album_id,
        filename,
        file_path,
        thumb_path,
        mime_type,
        file_size,
        sort_order,
        created_at
      FROM photos
      WHERE album_id = ?
      ORDER BY sort_order ASC
    `)
    .all(albumId);
  return photos;
}

// Validate file
export async function validateFile(filePath) {
  try {
    const stats = await stat(filePath);

    if (stats.size <= 0) {
      return { valid: false, reason: 'File is empty' };
    }

    if (stats.size > MAX_FILE_SIZE) {
      return { valid: false, reason: `File too large (max 20 MB)` };
    }

    // Check MIME type by extension
    const ext = filePath.toLowerCase().split('.').pop();
    const mimeMap = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp'
    };

    const mimeType = mimeMap[ext];
    if (!mimeType || !SUPPORTED_MIME_TYPES.includes(mimeType)) {
      return { valid: false, reason: 'Unsupported format' };
    }

    return { valid: true, mimeType };
  } catch (error) {
    return { valid: false, reason: `File not found: ${error.message}` };
  }
}

// Generate thumbnail
export async function generateThumbnail(srcPath, destPath, maxWidth = 300) {
  try {
    const img = nativeImage.createFromPath(srcPath);
    if (img.isEmpty()) {
      throw new Error('Cannot decode image');
    }

    const { width: w, height: h } = img.getSize();
    const thumb = img.resize({
      width: maxWidth,
      height: Math.round((maxWidth * h) / w),
      quality: 'better'
    });

    const jpegBuffer = thumb.toJPEG(85);
    await writeFile(destPath, jpegBuffer);
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    throw error;
  }
}

// Import photos
export async function importPhotos(albumId, filePaths) {
  const db = getDb();
  const imported = [];
  const rejected = [];
  const albumDir = getAlbumDir(albumId);

  try {
    // Create album directory if it doesn't exist
    await mkdir(albumDir, { recursive: true });

    for (const filePath of filePaths) {
      try {
        // Validate file
        const validation = await validateFile(filePath);
        if (!validation.valid) {
          rejected.push({
            original_path: filePath,
            reason: validation.reason
          });
          continue;
        }

        // Generate file paths
        const fileId = randomUUID();
        const ext = filePath.toLowerCase().split('.').pop();
        const storageFileName = `${fileId}.${ext}`;
        const storageFilePath = join(albumDir, storageFileName);
        const thumbFileName = `${fileId}.thumb.jpg`;
        const thumbFilePath = join(albumDir, thumbFileName);

        // Copy original file
        const fileData = await readFile(filePath);
        await writeFile(storageFilePath, fileData);

        // Generate thumbnail
        await generateThumbnail(storageFilePath, thumbFilePath, 300);

        // Get file size
        const stats = await stat(storageFilePath);
        const fileSize = stats.size;

        // Insert into database
        const now = new Date().toISOString();
        const originalFileName = filePath.split(/[\\\/]/).pop();

        db.prepare(`
          INSERT INTO photos (id, album_id, filename, file_path, thumb_path, mime_type, file_size, sort_order, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          fileId,
          albumId,
          originalFileName,
          join('photos', albumId, storageFileName),
          join('photos', albumId, thumbFileName),
          validation.mimeType,
          fileSize,
          0,
          now
        );

        imported.push({
          id: fileId,
          filename: originalFileName,
          file_path: join('photos', albumId, storageFileName),
          thumb_path: join('photos', albumId, thumbFileName),
          mime_type: validation.mimeType,
          file_size: fileSize,
          sort_order: 0,
          created_at: now
        });
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
        rejected.push({
          original_path: filePath,
          reason: error.message
        });
      }
    }

    return { imported, rejected };
  } catch (error) {
    throw new Error(`Failed to import photos: ${error.message}`);
  }
}

// Delete photo
export async function deletePhoto(photoId) {
  const db = getDb();

  try {
    // Get photo details before delete
    const photo = db.prepare('SELECT file_path, thumb_path FROM photos WHERE id = ?').get(photoId);

    if (!photo) {
      throw new Error('Photo not found');
    }

    // Delete from database
    db.prepare('DELETE FROM photos WHERE id = ?').run(photoId);

    // Delete files
    try {
      const userDataPath = app.getPath('userData');
      const filePath = join(userDataPath, photo.file_path);
      const thumbPath = join(userDataPath, photo.thumb_path);

      await rm(filePath, { force: true });
      await rm(thumbPath, { force: true });
    } catch (error) {
      console.error('Error deleting files:', error);
      // Continue anyway, DB entry is already deleted
    }
  } catch (error) {
    throw new Error(`Failed to delete photo: ${error.message}`);
  }
}

export default {
  listPhotos,
  validateFile,
  generateThumbnail,
  importPhotos,
  deletePhoto
};
