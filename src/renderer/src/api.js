// Thin wrapper around window.api calls
export const api = {
  albums: {
    list: async () => {
      try {
        return await window.api.albums.list();
      } catch (error) {
        return { error: error.message };
      }
    },
    create: async (args) => {
      try {
        return await window.api.albums.create(args);
      } catch (error) {
        return { error: error.message };
      }
    },
    update: async (args) => {
      try {
        return await window.api.albums.update(args);
      } catch (error) {
        return { error: error.message };
      }
    },
    delete: async (args) => {
      try {
        return await window.api.albums.delete(args);
      } catch (error) {
        return { error: error.message };
      }
    },
    reorder: async (args) => {
      try {
        return await window.api.albums.reorder(args);
      } catch (error) {
        return { error: error.message };
      }
    }
  },
  photos: {
    list: async (args) => {
      try {
        return await window.api.photos.list(args);
      } catch (error) {
        return { error: error.message };
      }
    },
    openDialog: async () => {
      try {
        return await window.api.photos.openDialog();
      } catch (error) {
        return { error: error.message };
      }
    },
    import: async (args) => {
      try {
        return await window.api.photos.import(args);
      } catch (error) {
        return { error: error.message };
      }
    },
    delete: async (args) => {
      try {
        return await window.api.photos.delete(args);
      } catch (error) {
        return { error: error.message };
      }
    }
  }
};

export default api;
