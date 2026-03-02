# Proxyman Electron Test

Minimal Electron app that makes HTTPS GET and POST requests using Electron's `net` module (Chromium network stack). Built for testing Proxyman HTTPS interception.

## Prerequisites

- Node.js (v18+)
- npm

## Setup

```bash
npm install
```

## Run in Development

```bash
npx electron .
```

## Build for macOS (Production)

```bash
./build.sh
```

This produces an optimized `.app` bundle at:

```
dist/ProxymanElectronTest-darwin-arm64/ProxymanElectronTest.app
```

## Run the Built App

```bash
# Launch normally
open dist/ProxymanElectronTest-darwin-arm64/ProxymanElectronTest.app

# Launch with console output visible
dist/ProxymanElectronTest-darwin-arm64/ProxymanElectronTest.app/Contents/MacOS/ProxymanElectronTest
```

## What It Does

1. On launch, sends an HTTPS GET to `https://httpbin.proxyman.app/get`
2. Sends an HTTPS POST to `https://httpbin.proxyman.app/post`
3. Logs results to stdout, then quits
4. Auto-quits after 30s if requests hang
