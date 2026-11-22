#!/bin/bash
# Installs The Code Maker on macOS from the latest GitHub release.
#
# Why this exists: browsers tag downloaded files with a "quarantine" flag,
# and macOS then reports apps without a paid Apple signature as "damaged".
# Files downloaded by curl are not tagged, so installing this way avoids the
# warning. Nothing else on the Mac is changed and no security setting is
# turned off. Read this script before running it, as with any script.
#
# Usage:  curl -fsSL https://raw.githubusercontent.com/Death7310/The-Code-Maker/main/scripts/install-mac.sh | bash
set -euo pipefail

APP_NAME="The Code Maker"
REPO="Death7310/The-Code-Maker"

case "$(uname -m)" in
  arm64)  FILE="TheCodeMaker-mac-arm64.dmg" ;;   # Apple Silicon (M1/M2/M3/M4)
  x86_64) FILE="TheCodeMaker-mac-x64.dmg" ;;     # Intel
  *) echo "Unsupported CPU: $(uname -m)" >&2; exit 1 ;;
esac
URL="https://github.com/$REPO/releases/download/mac-latest/$FILE"

# Install into /Applications if we can write there, otherwise ~/Applications.
DEST="/Applications"
if [ ! -w "$DEST" ]; then DEST="$HOME/Applications"; mkdir -p "$DEST"; fi

TMP="$(mktemp -d)"
MNT=""
cleanup() {
  if [ -n "$MNT" ] && [ -d "$MNT" ]; then hdiutil detach "$MNT" -quiet || true; fi
  rm -rf "$TMP"
}
trap cleanup EXIT

echo "Downloading $FILE ..."
curl -fL --progress-bar -o "$TMP/$FILE" "$URL"

echo "Opening the disk image ..."
MNT="$(hdiutil attach -nobrowse -readonly "$TMP/$FILE" | awk -F'\t' '/\/Volumes\// {print $NF}' | tail -n 1)"
if [ -z "$MNT" ] || [ ! -d "$MNT/$APP_NAME.app" ]; then
  echo "Could not find $APP_NAME.app in the disk image." >&2; exit 1
fi

echo "Installing to $DEST ..."
if pgrep -x "$APP_NAME" >/dev/null 2>&1; then osascript -e "quit app \"$APP_NAME\"" || true; sleep 1; fi
rm -rf "$DEST/$APP_NAME.app"
cp -R "$MNT/$APP_NAME.app" "$DEST/"
# Belt and braces: clear any quarantine flag on the installed copy only.
xattr -cr "$DEST/$APP_NAME.app" 2>/dev/null || true

echo "Done. Launching $APP_NAME ..."
open "$DEST/$APP_NAME.app"
