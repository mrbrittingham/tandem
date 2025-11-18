import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import http from "http";
import fs from "fs";
import { promisify } from "util";
const fsReadFile = promisify(fs.readFile);

// Load environment variables from `packages/api/.env` when present.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const sendJson = (res, status, data) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,apikey",
  };
  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) return resolve(null);
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });

const supabaseFetch = async (pathSuffix, opts = {}, useServiceRole = false) => {
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL is not configured");
  const url = `${SUPABASE_URL.replace(/\/$/, "")}${pathSuffix}`;
  const headers = {
    "Content-Type": "application/json",
  };
  const key = useServiceRole
    ? SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
    : SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY;
  if (key) {
    headers["apikey"] = key;
    headers["Authorization"] = `Bearer ${key}`;
  }
  const res = await fetch(url, { headers, ...opts });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveRestaurantUuid(value) {
  if (!value) return null;
  const v = String(value).trim();
  if (UUID_RE.test(v)) return v;
  // treat as slug
  if (SUPABASE_URL && (SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY)) {
    // try slug column
    let res = await supabaseFetch(`/rest/v1/restaurants?slug=eq.${encodeURIComponent(v)}&select=id`);
    if (Array.isArray(res) && res.length) return res[0].id;
    // try domain
    res = await supabaseFetch(`/rest/v1/restaurants?domain=eq.${encodeURIComponent(v)}&select=id`);
    if (Array.isArray(res) && res.length) return res[0].id;
    // try name ilike (dashes -> spaces)
    const nameCandidate = v.replace(/-/g, " ");
    res = await supabaseFetch(`/rest/v1/restaurants?name=ilike.%25${encodeURIComponent(nameCandidate)}%25&select=id`);
    if (Array.isArray(res) && res.length) return res[0].id;
    return null;
  }
  return null;
}

// Fetch optional per-restaurant contact/fallback settings.
const fetchContactSettings = async (rid) => {
  if (!rid) return null;
  if (!SUPABASE_URL || !(SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY)) return null;
  try {
    const r = await supabaseFetch(`/rest/v1/restaurants?id=eq.${encodeURIComponent(rid)}&select=contact_fallback_enabled,contact_fallback_message`);
    const row = Array.isArray(r) && r.length ? r[0] : null;
    if (!row) return null;
    return {
      fallback_enabled: !!row.contact_fallback_enabled,
      fallback_message: row.contact_fallback_message || null,
    };
  } catch (e) {
    return null;
  }
};

const openaiChat = async ({ message, system = null }) => {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  const url = "https://api.openai.com/v1/chat/completions";
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: message });
  const body = {
    model: "gpt-3.5-turbo",
    messages,
    max_tokens: 512,
    temperature: 0.7,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
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
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,apikey",
      });
      res.end();
      return;
    }

    if (req.url === "/health") {
      sendJson(res, 200, { status: "ok" });
      return;
    }

    // Provide a canonical /api/health endpoint (clients may probe this path)
    if (req.url === "/api/health" && req.method === "GET") {
      sendJson(res, 200, { ok: true });
      return;
    }

    // GET /api/menus -> returns menus with menu_items
    if (req.url === "/api/menus" && req.method === "GET") {
      const data = await supabaseFetch(
        "/rest/v1/menus?select=*,menu_items(*)",
        { method: "GET" },
      );
      sendJson(res, 200, data);
      return;
    }

    // NOTE: Demo endpoints and demo JSON fallbacks were removed to
    // enforce using Supabase as the single source of truth. If Supabase
    // is not configured or fails, the server will return an error.

    // GET /api/faqs -> returns faqs
    if (req.url === "/api/faqs" && req.method === "GET") {
      const data = await supabaseFetch("/rest/v1/faqs?select=*", {
        method: "GET",
      });
      sendJson(res, 200, data);
      return;
    }

    // POST /api/reservations -> create reservation (uses service role key)
    if (req.url === "/api/reservations" && req.method === "POST") {
      const body = await parseBody(req);
      if (!body || !body.restaurant_id) {
        sendJson(res, 400, { error: "restaurant_id is required" });
        return;
      }
      const payload = JSON.stringify(body);
      const data = await supabaseFetch(
        "/rest/v1/reservations",
        { method: "POST", body: payload },
        true,
      );
      sendJson(res, 201, data);
      return;
    }

    // POST /chat -> forwards to OpenAI (also accept /api/chat for legacy)
    if (req.url === "/chat" && req.method === "POST") {
      const body = await parseBody(req);
      if (!body || !body.message) {
        sendJson(res, 400, { error: "message is required" });
        return;
      }
      try {
        let system = null;
        // Accept restaurant_slug or restaurant_id
        const inputRestaurant = body.restaurant_slug || body.restaurant_id || null;
        let resolvedRid = null;
        if (inputRestaurant) {
          try {
            resolvedRid = await resolveRestaurantUuid(inputRestaurant);
          } catch (err) {
            sendJson(res, 500, { error: "slug resolution failed" });
            return;
          }
          if (!resolvedRid) {
            // if input looked like a slug (not uuid), return 404 per requirements
            if (!UUID_RE.test(String(inputRestaurant).trim())) {
              sendJson(res, 404, { error: "restaurant slug not found" });
              return;
            }
            // else treat as provided uuid
            resolvedRid = String(inputRestaurant).trim();
          }
        }

        if (resolvedRid) {
          const rid = String(resolvedRid);
          if (SUPABASE_URL && (SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY)) {
            try {
              const r = await supabaseFetch(`/rest/v1/restaurants?id=eq.${encodeURIComponent(rid)}&select=*`);
              const restaurant = Array.isArray(r) && r.length ? r[0] : null;
              if (restaurant) {
                system = `You are an assistant for ${restaurant.name} (${restaurant.short_name || restaurant.id}). `;
              }

              const menus = await supabaseFetch(`/rest/v1/menus?restaurant_id=eq.${encodeURIComponent(rid)}&select=*,menu_items(*)`);
              if (menus && menus.length) {
                system = (system || "") + "\nMenu items:\n";
                for (const menu of menus) {
                  system += `-- ${menu.title}: `;
                  const items = (menu.items || menu.menu_items || []).map((i) => `${i.name}${i.price ? ` ($${i.price})` : ""}`);
                  system += items.join(", ") + "\n";
                }
              }

              const faqs = await supabaseFetch(`/rest/v1/faqs?restaurant_id=eq.${encodeURIComponent(rid)}&select=*`);
              if (faqs && faqs.length) {
                system = (system || "") + "\nFAQs:\n";
                for (const f of faqs) {
                  system += `Q: ${f.question} A: ${f.answer}\n`;
                }
              }

              // Optional per-restaurant contact fallback settings
              try {
                const contact = await fetchContactSettings(rid);
                if (contact && contact.fallback_enabled) {
                  const msg = contact.fallback_message || "Please contact the restaurant via their website or phone.";
                  system = (system || "") + `\nContact fallback: If contact info is requested but not available, reply: "${msg}"\n`;
                }
              } catch (e) {
                // ignore contact settings errors
              }
            } catch (e) {
              sendJson(res, 502, { error: "Supabase fetch failed" });
              return;
            }
          } else {
            sendJson(res, 500, { error: "Supabase is not configured" });
            return;
          }
        }

        const reply = await openaiChat({ message: body.message, system });
        sendJson(res, 200, { reply });
      } catch (e) {
        sendJson(res, 502, { error: e.message || "OpenAI request failed" });
      }
      return;
    }

    // POST /api/chat -> forwards to OpenAI
    if (req.url === "/api/chat" && req.method === "POST") {
      const body = await parseBody(req);
      if (!body || !body.message) {
        sendJson(res, 400, { error: "message is required" });
        return;
      }
      try {
        let system = null;
        const inputRestaurant = body.restaurant_slug || body.restaurant_id || null;
        let resolvedRid = null;
        if (inputRestaurant) {
          try {
            resolvedRid = await resolveRestaurantUuid(inputRestaurant);
          } catch (err) {
            sendJson(res, 500, { error: "slug resolution failed" });
            return;
          }
          if (!resolvedRid) {
            if (!UUID_RE.test(String(inputRestaurant).trim())) {
              sendJson(res, 404, { error: "restaurant slug not found" });
              return;
            }
            resolvedRid = String(inputRestaurant).trim();
          }
        }

        if (resolvedRid) {
          const rid = String(resolvedRid);
          if (SUPABASE_URL && (SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY)) {
            try {
              const r = await supabaseFetch(`/rest/v1/restaurants?id=eq.${encodeURIComponent(rid)}&select=*`);
              const restaurant = Array.isArray(r) && r.length ? r[0] : null;
              if (restaurant) {
                system = `You are an assistant for ${restaurant.name} (${restaurant.short_name || restaurant.id}). `;
              }
              const menus = await supabaseFetch(`/rest/v1/menus?restaurant_id=eq.${encodeURIComponent(rid)}&select=*,menu_items(*)`);
              if (menus && menus.length) {
                system = (system || "") + "\nMenu items:\n";
                for (const menu of menus) {
                  system += `-- ${menu.title}: `;
                  const items = (menu.items || menu.menu_items || []).map((i) => `${i.name}${i.price ? ` ($${i.price})` : ""}`);
                  system += items.join(", ") + "\n";
                }
              }
              const faqs = await supabaseFetch(`/rest/v1/faqs?restaurant_id=eq.${encodeURIComponent(rid)}&select=*`);
              if (faqs && faqs.length) {
                system = (system || "") + "\nFAQs:\n";
                for (const f of faqs) {
                  system += `Q: ${f.question} A: ${f.answer}\n`;
                }
              }

              // Optional per-restaurant contact fallback settings
              try {
                const contact = await fetchContactSettings(rid);
                if (contact && contact.fallback_enabled) {
                  const msg = contact.fallback_message || "Please contact the restaurant via their website or phone.";
                  system = (system || "") + `\nContact fallback: If contact info is requested but not available, reply: "${msg}"\n`;
                }
              } catch (e) {
                // ignore contact settings errors
              }
            } catch (e) {
              sendJson(res, 502, { error: "Supabase fetch failed" });
              return;
            }
          } else {
            sendJson(res, 500, { error: "Supabase is not configured" });
            return;
          }
        }

        const reply = await openaiChat({ message: body.message, system });
        sendJson(res, 200, { reply });
      } catch (e) {
        sendJson(res, 502, { error: e.message || "OpenAI request failed" });
      }
      return;
    }

    sendJson(res, 404, { error: "Not Found" });
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
