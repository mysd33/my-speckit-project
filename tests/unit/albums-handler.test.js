import { beforeEach, describe, expect, it, vi } from 'vitest';

const handleMock = vi.fn();

vi.mock('electron', () => ({
  ipcMain: {
    handle: handleMock
  }
}));

const listAlbumsMock = vi.fn();
const createAlbumMock = vi.fn();
const updateAlbumMock = vi.fn();
const deleteAlbumMock = vi.fn();
const reorderAlbumsMock = vi.fn();

vi.mock('../../src/main/services/album-service.js', () => ({
  listAlbums: listAlbumsMock,
  createAlbum: createAlbumMock,
  updateAlbum: updateAlbumMock,
  deleteAlbum: deleteAlbumMock,
  reorderAlbums: reorderAlbumsMock
}));

describe('albums handler', () => {
  beforeEach(() => {
    handleMock.mockClear();
    listAlbumsMock.mockReset();
    createAlbumMock.mockReset();
    updateAlbumMock.mockReset();
    deleteAlbumMock.mockReset();
    reorderAlbumsMock.mockReset();
  });

  it('returns { data } for albums:list', async () => {
    const expected = [{ id: 'album-1' }];
    listAlbumsMock.mockResolvedValue(expected);

    const { registerAlbumHandlers } = await import('../../src/main/handlers/albums.js');
    registerAlbumHandlers();

    const listCall = handleMock.mock.calls.find((call) => call[0] === 'albums:list');
    expect(listCall).toBeTruthy();

    const response = await listCall[1]();
    expect(response).toEqual({ data: expected });
    expect(listAlbumsMock).toHaveBeenCalledTimes(1);
  });

  it('returns { error } when albums:list fails', async () => {
    listAlbumsMock.mockRejectedValue(new Error('boom'));

    const { registerAlbumHandlers } = await import('../../src/main/handlers/albums.js');
    registerAlbumHandlers();

    const listCall = handleMock.mock.calls.find((call) => call[0] === 'albums:list');
    const response = await listCall[1]();

    expect(response).toEqual({ error: 'boom' });
  });
});
