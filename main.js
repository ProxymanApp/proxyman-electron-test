// Minimal Electron app for testing Proxyman HTTPS interception.
// Makes HTTPS GET and POST requests using Electron's net module (Chromium network stack)
// which does NOT respect the macOS system proxy by default.
// The app quits after both requests complete (or after a 30s safety timeout).

const { app, net } = require('electron');

// Safety timeout: quit after 30s even if requests hang
const TIMEOUT_MS = 30000;
let safetyTimer = setTimeout(() => {
    console.error('[proxyman-test] Safety timeout reached, quitting');
    app.exit(1);
}, TIMEOUT_MS);

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

app.on('ready', async () => {
    console.log('[proxyman-test] App ready, making requests...');
    try {
        await makeGetRequest();
        await makePostRequest();
        console.log('[proxyman-test] All requests completed successfully');
    } catch (err) {
        console.error('[proxyman-test] Request error:', err.message);
    }
    clearTimeout(safetyTimer);
    app.quit();
});

// Prevent the app from staying open when all windows are closed
app.on('window-all-closed', () => {
    // no-op, we quit explicitly after requests
});
