#!/bin/sh

# Load env vars only if a .env file actually exists
set -a
if [ -f /workspace/.env ]; then
	echo "Loading /workspace/.env..."
	. /workspace/.env
else
	echo "No /workspace/.env found — skipping env load (expected for this project)."
fi
set +a

echo "Waiting for container to finish initializing..."
sleep 2

echo "Force-killing anything using ports 3000, 3001, 4000..."

fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 4000/tcp 2>/dev/null || true

kill -9 $(lsof -t -i:3000) 2>/dev/null || true
kill -9 $(lsof -t -i:3001) 2>/dev/null || true
kill -9 $(lsof -t -i:4000) 2>/dev/null || true

pkill -f "next dev" 2>/dev/null || true
pkill -f "node index.js" 2>/dev/null || true

echo "Starting Tandem dev services..."
npm run dev
