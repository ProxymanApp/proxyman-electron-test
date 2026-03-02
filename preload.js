const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendGet: () => ipcRenderer.send('make-get-request'),
    sendPost: () => ipcRenderer.send('make-post-request'),
    onLog: (callback) => ipcRenderer.on('log-message', (_event, message) => callback(message))
});
