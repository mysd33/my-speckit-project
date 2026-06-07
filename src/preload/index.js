import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  albums: {
    list: () => ipcRenderer.invoke('albums:list'),
    create: (args) => ipcRenderer.invoke('albums:create', args),
    update: (args) => ipcRenderer.invoke('albums:update', args),
    delete: (args) => ipcRenderer.invoke('albums:delete', args),
    reorder: (args) => ipcRenderer.invoke('albums:reorder', args)
  },
  photos: {
    list: (args) => ipcRenderer.invoke('photos:list', args),
    openDialog: () => ipcRenderer.invoke('photos:openDialog'),
    import: (args) => ipcRenderer.invoke('photos:import', args),
    delete: (args) => ipcRenderer.invoke('photos:delete', args)
  }
});
