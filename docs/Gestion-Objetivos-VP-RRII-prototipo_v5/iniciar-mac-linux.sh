#!/bin/sh
cd "$(dirname "$0")"
URL=http://localhost:8765/index.html
( sleep 1; (open "$URL" || xdg-open "$URL") >/dev/null 2>&1 ) &
if command -v python3 >/dev/null; then python3 -m http.server 8765
else npx --yes serve -l 8765 .; fi
