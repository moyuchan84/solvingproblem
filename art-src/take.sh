#!/bin/sh
# moves ~/Downloads/VN_<name>.png -> art-src/<name>.png
cd "$(dirname "$0")"; sleep 2
for f in ~/Downloads/VN_*.png; do [ -f "$f" ] || continue; b=$(basename "$f" .png); n="${b#VN_}"; case "$n" in *"("*) rm "$f"; continue;; esac; mv "$f" "$n.png"; echo "took ${b#VN_}"; done
