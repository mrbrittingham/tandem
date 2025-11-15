
#!/bin/sh

echo "Waiting for container to finish initializing..."
sleep 3

echo "Cleaning old processes..."

kill -9 $(lsof -t -i:3000) 2>/dev/null || true
kill -9 $(lsof -t -i:3001) 2>/dev/null || true
kill -9 $(lsof -t -i:4000) 2>/dev/null || true

pkill -f "next dev" 2>/dev/null || true
pkill -f "node index.js" 2>/dev/null || true

echo "Starting Tandem dev services..."
npm run dev
