#!/bin/bash
set -e

APP_NAME="ProxymanElectronTest"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="$PROJECT_DIR/dist"

echo "==> Cleaning previous builds..."
rm -rf "$OUTPUT_DIR"
rm -rf "$PROJECT_DIR/ProxymanElectronTest-darwin-arm64"

echo "==> Installing dependencies (production only)..."
cd "$PROJECT_DIR"
npm install

echo "==> Installing electron-packager..."
npx --yes electron-packager@latest \
  "$PROJECT_DIR" \
  "$APP_NAME" \
  --platform=darwin \
  --arch=arm64 \
  --out="$OUTPUT_DIR" \
  --overwrite \
  --asar \
  --prune=true \
  --ignore="^/(dist|\.git|\.DS_Store|build\.sh)" \
  --app-bundle-id="com.proxyman.electron-test" \
  --app-version="1.0.0"

APP_PATH="$OUTPUT_DIR/$APP_NAME-darwin-arm64/$APP_NAME.app"

echo ""
echo "==> Build complete!"
echo "    App: $APP_PATH"
du -sh "$APP_PATH"
echo ""
echo "==> To run:"
echo "    open \"$APP_PATH\""
echo "    # or with console output:"
echo "    \"$APP_PATH/Contents/MacOS/$APP_NAME\""
