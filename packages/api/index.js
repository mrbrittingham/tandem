// Minimal HTTP server for `packages/api` (starter)
// Run: `node index.js` (the package.json dev script already points here)
// This file is a placeholder. Replace with an Express/Fastify/Next API implementation
// and add Supabase / OpenAI logic as needed.

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import http from 'http';

// Load environment variables from `packages/api/.env` when present.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 4000;

const requestHandler = async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.url === '/api/chat' && req.method === 'POST') {
    // Placeholder: accept chat requests and forward to OpenAI / Supabase
    res.writeHead(501, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not implemented' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
};

const server = http.createServer(requestHandler);
server.listen(PORT, () => {
  console.log(`tandem-api listening on http://localhost:${PORT}`);
});

// TODO: Add Supabase client initialization and OpenAI integration here.
