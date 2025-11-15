import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import http from 'http';
import fs from 'fs';
import { promisify } from 'util';
const fsReadFile = promisify(fs.readFile);

// Load environment variables from `packages/api/.env` when present.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const sendJson = (res, status, data) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,apikey',
  };
  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
};

const parseBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    if (!body) return resolve(null);
    try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
  });
  req.on('error', reject);
});

const supabaseFetch = async (pathSuffix, opts = {}, useServiceRole = false) => {
  if (!SUPABASE_URL) throw new Error('SUPABASE_URL is not configured');
  const url = `${SUPABASE_URL.replace(/\/$/, '')}${pathSuffix}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  const key = useServiceRole ? SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY : SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY;
  if (key) {
    headers['apikey'] = key;
    headers['Authorization'] = `Bearer ${key}`;
  }
  const res = await fetch(url, { headers, ...opts });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
};

const openaiChat = async ({ message, system = null }) => {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');
  const url = 'https://api.openai.com/v1/chat/completions';
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: message });
  const body = {
    model: 'gpt-3.5-turbo',
    messages,
    max_tokens: 512,
    temperature: 0.7
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${txt}`);
  }
  const json = await res.json();
  const reply = json?.choices?.[0]?.message?.content ?? null;
  return reply;
};

const requestHandler = async (req, res) => {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,apikey',
      });
      res.end();
      return;
    }

    if (req.url === '/health') {
      sendJson(res, 200, { status: 'ok' });
      return;
    }

    // GET /api/menus -> returns menus with menu_items
    if (req.url === '/api/menus' && req.method === 'GET') {
      const data = await supabaseFetch('/rest/v1/menus?select=*,menu_items(*)', { method: 'GET' });
      sendJson(res, 200, data);
      return;
    }

    // Demo endpoints (serve demo JSON when requested)
    if (req.url === '/api/demo/restaurant' && req.method === 'GET') {
      try {
        const demoPath = path.join(__dirname, 'demo', 'windmill.json');
        const txt = await fsReadFile(demoPath, 'utf8');
        const json = JSON.parse(txt);
        sendJson(res, 200, json.restaurant);
      } catch (e) {
        sendJson(res, 500, { error: String(e) });
      }
      return;
    }

    if (req.url === '/api/demo/faqs' && req.method === 'GET') {
      try {
        const demoPath = path.join(__dirname, 'demo', 'windmill.json');
        const txt = await fsReadFile(demoPath, 'utf8');
        const json = JSON.parse(txt);
        sendJson(res, 200, json.faqs);
      } catch (e) {
        sendJson(res, 500, { error: String(e) });
      }
      return;
    }

    if (req.url === '/api/demo/menus' && req.method === 'GET') {
      try {
        const demoPath = path.join(__dirname, 'demo', 'windmill.json');
        const txt = await fsReadFile(demoPath, 'utf8');
        const json = JSON.parse(txt);
        sendJson(res, 200, json.menus);
      } catch (e) {
        sendJson(res, 500, { error: String(e) });
      }
      return;
    }

    // GET /api/faqs -> returns faqs
    if (req.url === '/api/faqs' && req.method === 'GET') {
      const data = await supabaseFetch('/rest/v1/faqs?select=*', { method: 'GET' });
      sendJson(res, 200, data);
      return;
    }

    // POST /api/reservations -> create reservation (uses service role key)
    if (req.url === '/api/reservations' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body || !body.restaurant_id) {
        sendJson(res, 400, { error: 'restaurant_id is required' });
        return;
      }
      const payload = JSON.stringify(body);
      const data = await supabaseFetch('/rest/v1/reservations', { method: 'POST', body: payload }, true);
      sendJson(res, 201, data);
      return;
    }

    // POST /api/chat -> forwards to OpenAI
    if (req.url === '/api/chat' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body || !body.message) {
        sendJson(res, 400, { error: 'message is required' });
        return;
      }
      try {
        let system = null;
        if (body.restaurant_id) {
          // fetch demo restaurant context where available
          try {
            const demoPath = path.join(__dirname, 'demo', 'windmill.json');
            const txt = await fsReadFile(demoPath, 'utf8');
            const json = JSON.parse(txt);
            if (json.restaurant) {
              system = `You are an assistant for ${json.restaurant.name} (${json.restaurant.short_name}). `;
            }
            if (json.menus) {
              system += '\nMenu items:\n';
              for (const menu of json.menus) {
                system += `-- ${menu.title}: `;
                const names = menu.items.map(i => `${i.name}${i.price ? ` ($${i.price})` : ''}`);
                system += names.join(', ') + '\n';
              }
            }
            if (json.faqs) {
              system += '\nFAQs:\n';
              for (const f of json.faqs) {
                system += `Q: ${f.question} A: ${f.answer}\n`;
              }
            }
          } catch (e) {
            // ignore demo read errors
          }
        }

        const reply = await openaiChat({ message: body.message, system });
        sendJson(res, 200, { reply });
      } catch (e) {
        sendJson(res, 502, { error: e.message || 'OpenAI request failed' });
      }
      return;
    }

    sendJson(res, 404, { error: 'Not Found' });
  } catch (err) {
    sendJson(res, 500, { error: err.message || String(err) });
  }
};

const server = http.createServer(requestHandler);
server.listen(PORT, () => {
  console.log(`tandem-api listening on http://localhost:${PORT}`);
});

// Note: This file uses the Supabase REST API and OpenAI. Ensure `packages/api/.env` defines
// `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `OPENAI_API_KEY`.
