#!/bin/bash
# Build the Proxyman Electron Test app for integration testing.
# Produces: ProxymanElectronTest-darwin-arm64/ProxymanElectronTest.app

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Installing dependencies..."
npm install

echo "==> Packaging Electron app (arm64)..."
npx @electron/packager . ProxymanElectronTest \
  --platform=darwin \
  --arch=arm64 \
  --overwrite \
  --ignore="node_modules" \
  --ignore="package-lock.json" \
  --ignore=".DS_Store" \
  --ignore="build.sh" \
  --ignore="README.md"

APP_PATH="$SCRIPT_DIR/ProxymanElectronTest-darwin-arm64/ProxymanElectronTest.app"
SIZE=$(du -sh "$APP_PATH" | cut -f1)

echo ""
echo "==> Build complete: $APP_PATH ($SIZE)"
