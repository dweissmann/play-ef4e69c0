#!/usr/bin/env bash
# Rebuild the playlist from ./audio and push live to GitHub Pages (same URL).
# Usage: ./deploy.sh   (run after adding/removing files in ./audio)
set -e
cd "$(dirname "$0")"
node build-playlist.js
git add -A
git commit -m "Update playlist" || { echo "Nothing to deploy."; exit 0; }
git push
echo "Pushed. Live in ~1 min at: https://dweissmann.github.io/play-ef4e69c0/"
