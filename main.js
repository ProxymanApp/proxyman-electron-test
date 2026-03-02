// Electron test app for Proxyman HTTPS interception testing.
// Architecture: Renderer (frontend) triggers requests via IPC → Main process (backend)
// performs HTTPS calls using Electron's net module → returns results via IPC.
// This mirrors real-world Electron apps where network calls happen in the main process.

const { app, net, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Safety timeout: quit after 30s even if requests hang
const TIMEOUT_MS = 30000;
let safetyTimer = setTimeout(() => {
    console.error('[proxyman-test] Safety timeout reached, quitting');
    app.exit(1);
}, TIMEOUT_MS);

let mainWindow = null;

// -- IPC Handlers (main process performs all HTTPS requests) --

ipcMain.handle('fetch-get', async () => {
    console.log('[proxyman-test] Main process: handling GET request via IPC');
    return makeGetRequest();
});

ipcMain.handle('fetch-post', async () => {
    console.log('[proxyman-test] Main process: handling POST request via IPC');
    return makePostRequest();
});

// Renderer signals all requests are done — quit after a short delay for UI update
ipcMain.on('all-done', () => {
    console.log('[proxyman-test] All requests completed, quitting...');
    setTimeout(() => {
        clearTimeout(safetyTimer);
        app.quit();
    }, 500);
});

// HTTPS GET via Electron net module (Chromium network stack, runs in main process)
function makeGetRequest() {
    return new Promise((resolve, reject) => {
        const request = net.request('https://httpbin.proxyman.app/get?source=proxyman-electron-test');
        let body = '';
        request.on('response', (response) => {
            response.on('data', (chunk) => { body += chunk.toString(); });
            response.on('end', () => {
                console.log('[proxyman-test] GET /get completed, status=' + response.statusCode);
                resolve({ status: response.statusCode, body: body });
            });
        });
        request.on('error', (err) => {
            console.error('[proxyman-test] GET /get failed:', err.message);
            reject(err);
        });
        request.end();
    });
}

// HTTPS POST via Electron net module (Chromium network stack, runs in main process)
function makePostRequest() {
    return new Promise((resolve, reject) => {
        const request = net.request({
            method: 'POST',
            url: 'https://httpbin.proxyman.app/post'
        });
        request.setHeader('Content-Type', 'application/json');
        let body = '';
        request.on('response', (response) => {
            response.on('data', (chunk) => { body += chunk.toString(); });
            response.on('end', () => {
                console.log('[proxyman-test] POST /post completed, status=' + response.statusCode);
                resolve({ status: response.statusCode, body: body });
            });
        });
        request.on('error', (err) => {
            console.error('[proxyman-test] POST /post failed:', err.message);
            reject(err);
        });
        request.write(JSON.stringify({ name: 'Proxyman', test: true }));
        request.end();
    });
}

// -- Window creation --

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 480,
        height: 360,
        title: 'Proxyman Electron Test',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
}

app.on('ready', () => {
    console.log('[proxyman-test] App ready, creating window...');
    createWindow();
});

app.on('window-all-closed', () => {
    // no-op, we quit explicitly after requests
});
