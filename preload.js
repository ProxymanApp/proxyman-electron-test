// Preload script: exposes IPC bridge to renderer via contextBridge.
// The renderer can call window.api.fetchGet() / fetchPost() which
// invoke the main process handlers over IPC.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    fetchGet: () => ipcRenderer.invoke('fetch-get'),
    fetchPost: () => ipcRenderer.invoke('fetch-post'),
    notifyDone: () => ipcRenderer.send('all-done')
});
