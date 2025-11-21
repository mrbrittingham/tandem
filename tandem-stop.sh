#!/bin/sh
# tandem-stop.sh — graceful shutdown for dev services
# Usage: ./tandem-stop.sh [--force|-f]

set -e

echo "Stopping Tandem dev services (graceful)..."

FORCE=0
if [ "$1" = "--force" ] || [ "$1" = "-f" ]; then
  FORCE=1
  echo "Force mode enabled: will force-kill lingering processes after graceful stop."
fi

PATTERNS="next dev|node index.js|vite|webpack-dev-server|parcel"

for pat in "next dev" "node index.js" "vite" "webpack-dev-server" "parcel"; do
  echo "Attempting to terminate processes matching: $pat"
  pkill -f "$pat" || true
done

sleep 2

REMAINING=$(pgrep -af "next dev|node index.js|vite|webpack-dev-server|parcel" || true)
if [ -z "$(echo "$REMAINING" | sed -n '1p')" ]; then
  echo "No matching processes remain."
  exit 0
fi

echo "Remaining processes:" 
echo "$REMAINING"

if [ "$FORCE" -eq 1 ]; then
  echo "Force-killing processes and freeing ports 3000,3001,4000..."
  fuser -k 3000/tcp 2>/dev/null || true
  fuser -k 3001/tcp 2>/dev/null || true
  fuser -k 4000/tcp 2>/dev/null || true

  # Kill PIDs listed by pgrep (first column)
  for pid in $(echo "$REMAINING" | awk '{print $1}'); do
    if [ -n "$pid" ]; then
      echo "kill -9 $pid"
      kill -9 "$pid" 2>/dev/null || true
    fi
  done

  echo "Force kill attempted."
else
  echo "Processes remain. Rerun with --force to force-kill them."
fi

# Confirm no matching processes remain
sleep 1
LEFTOVER=$(pgrep -af "next dev|node index.js|vite|webpack-dev-server|parcel" || true)
if [ -z "$(echo "$LEFTOVER" | sed -n '1p')" ]; then
  echo "All dev processes stopped."
  exit 0
fi

echo "Warning: Some dev processes still running:" 
echo "$LEFTOVER"
if [ "$FORCE" -eq 0 ]; then
  echo "Run './tandem-stop.sh --force' to force-kill remaining processes."
  exit 1
else
  echo "Force mode was used but some processes remain; manual inspection recommended."
  exit 1
fi

