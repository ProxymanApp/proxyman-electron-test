// Minimal Electron app for testing Proxyman HTTPS interception.
// Makes HTTPS GET and POST requests using Electron's net module (Chromium network stack)
// which does NOT respect the macOS system proxy by default.

const { app, net, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function sendLog(message) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('log-message', message);
    }
}

function makeGetRequest() {
    return new Promise((resolve, reject) => {
        sendLog('[GET] Requesting https://httpbin.proxyman.app/get ...');
        const request = net.request('https://httpbin.proxyman.app/get?source=proxyman-electron-test');
        let body = '';
        request.on('response', (response) => {
            sendLog('[GET] Status: ' + response.statusCode);
            response.on('data', (chunk) => { body += chunk.toString(); });
            response.on('end', () => {
                sendLog('[GET] Response body:');
                sendLog(body);
                sendLog('[GET] Done.');
                resolve({ status: response.statusCode, body: body });
            });
        });
        request.on('error', (err) => {
            sendLog('[GET] Error: ' + err.message);
            reject(err);
        });
        request.end();
    });
}

function makePostRequest() {
    return new Promise((resolve, reject) => {
        sendLog('[POST] Requesting https://httpbin.proxyman.app/post ...');
        const request = net.request({
            method: 'POST',
            url: 'https://httpbin.proxyman.app/post'
        });
        request.setHeader('Content-Type', 'application/json');
        let body = '';
        request.on('response', (response) => {
            sendLog('[POST] Status: ' + response.statusCode);
            response.on('data', (chunk) => { body += chunk.toString(); });
            response.on('end', () => {
                sendLog('[POST] Response body:');
                sendLog(body);
                sendLog('[POST] Done.');
                resolve({ status: response.statusCode, body: body });
            });
        });
        request.on('error', (err) => {
            sendLog('[POST] Error: ' + err.message);
            reject(err);
        });
        request.write(JSON.stringify({ name: 'Proxyman', test: true }));
        request.end();
    });
}

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');

    ipcMain.on('make-get-request', async () => {
        try {
            await makeGetRequest();
        } catch (err) {
            sendLog('[GET] Request failed: ' + err.message);
        }
    });

    ipcMain.on('make-post-request', async () => {
        try {
            await makePostRequest();
        } catch (err) {
            sendLog('[POST] Request failed: ' + err.message);
        }
    });
});

app.on('window-all-closed', () => {
    app.quit();
});
