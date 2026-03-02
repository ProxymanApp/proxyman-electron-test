# Proxyman Electron Test App

Minimal Electron app for testing Proxyman's Electron HTTPS interception feature.

## Architecture

```
Renderer (index.html)          Main Process (main.js)
       |                              |
       |-- IPC: fetch-get ----------->|-- net.request GET /get -->
       |<-- { status, body } ---------|<-- response -------------|
       |                              |
       |-- IPC: fetch-post ---------->|-- net.request POST /post ->
       |<-- { status, body } ---------|<-- response --------------|
       |                              |
       |-- IPC: all-done ------------>|-- app.quit()
```

- **Renderer** (`index.html`) triggers requests via IPC through a secure `contextBridge` (`preload.js`).
- **Main process** (`main.js`) performs HTTPS calls using Electron's `net` module (Chromium network stack).
- This mirrors real Electron apps (VS Code, Slack, Discord) where network calls happen in the main process, not the renderer.

## Requests Made

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `https://httpbin.proxyman.app/get?source=proxyman-electron-test` | Verify GET interception |
| POST | `https://httpbin.proxyman.app/post` | Verify POST interception (JSON body) |

## Build

```bash
./build.sh
```

This installs dependencies, packages the app with `@electron/packager`, and outputs:

```
ProxymanElectronTest-darwin-arm64/ProxymanElectronTest.app
```

## Usage in Tests

The `ElectronInjectionIntegrationTests` reads the app path from the `PROXYMAN_ELECTRON_TEST_APP_PATH` environment variable, configured in `AppTestPlan.xctestplan`.

To update the path after rebuilding:

1. Edit `ProxymanCore/AppTestPlan.xctestplan`
2. Set `PROXYMAN_ELECTRON_TEST_APP_PATH` to the absolute path of `ProxymanElectronTest.app`

## Files

| File | Description |
|------|-------------|
| `main.js` | Main process — IPC handlers, HTTPS requests via `net` module |
| `preload.js` | Context bridge — exposes `fetchGet`, `fetchPost`, `notifyDone` to renderer |
| `index.html` | Renderer — triggers IPC calls, displays request status |
| `package.json` | Electron dependency |
| `build.sh` | Build script |
