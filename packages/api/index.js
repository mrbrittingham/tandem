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
  // Ensure the path passed in is a clean path (no leading slash, no rest/v1)
  const raw = String(pathSuffix || "");
  const cleanPath = raw.replace(/^\/+/, "").replace(/^rest\/v1\/?/i, "");
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${cleanPath}`;
  console.log(
    `DEBUG supabaseFetch -> url=${url} method=${opts.method || "GET"} useServiceRole=${useServiceRole}`,
  );
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
  console.log(
    `DEBUG supabaseFetch response (first 1000 chars) for ${url}: ${String(text).slice(0, 1000)}`,
  );
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveRestaurantUuid(value) {
  if (!value) return null;
  const v = String(value).trim();
  if (UUID_RE.test(v)) return v;
  // treat as slug
  if (SUPABASE_URL && (SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY)) {
    // try slug column
    const slugPath = `restaurants?slug=eq.${encodeURIComponent(v)}&select=id`;
    let res = await supabaseFetch(slugPath);
    console.log("DEBUG resolveRestaurantUuid slug lookup", {
      input: v,
      path: slugPath,
      response: res,
    });
    if (Array.isArray(res) && res.length) {
      console.log("DEBUG resolveRestaurantUuid resolved id", res[0].id);
      return res[0].id;
    }
    // try domain
    const domainPath = `restaurants?domain=eq.${encodeURIComponent(v)}&select=id`;
    res = await supabaseFetch(domainPath);
    console.log("DEBUG resolveRestaurantUuid domain lookup", {
      input: v,
      path: domainPath,
      response: res,
    });
    if (Array.isArray(res) && res.length) {
      console.log("DEBUG resolveRestaurantUuid resolved id", res[0].id);
      return res[0].id;
    }
    // try name ilike (dashes -> spaces)
    const nameCandidate = v.replace(/-/g, " ");
    const namePath = `restaurants?name=ilike.%25${encodeURIComponent(nameCandidate)}%25&select=id`;
    res = await supabaseFetch(namePath);
    console.log("DEBUG resolveRestaurantUuid name lookup", {
      input: v,
      candidate: nameCandidate,
      path: namePath,
      response: res,
    });
    if (Array.isArray(res) && res.length) {
      console.log("DEBUG resolveRestaurantUuid resolved id", res[0].id);
      return res[0].id;
    }
    return null;
  }
  return null;
}

// Fetch optional per-restaurant contact/fallback settings.
const fetchContactSettings = async (rid) => {
  if (!rid) return null;
  if (!SUPABASE_URL || !(SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY))
    return null;
  try {
    const r = await supabaseFetch(
      `restaurants?id=eq.${encodeURIComponent(rid)}&select=contact_fallback_enabled,contact_fallback_message`,
    );
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

const openaiChat = async ({ message, system = null, functions = null }) => {
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
  if (functions) body.functions = functions;
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
  const choice = json?.choices?.[0]?.message ?? null;
  const reply = choice?.content ?? null;
  const function_call = choice?.function_call ?? null;
  return { reply, function_call, raw: json };
};

// OpenAI function definitions (extend as needed)
const OPENAI_FUNCTIONS = [
  {
    name: "lookup_wine_pairing",
    description: "Get the recommended wine pairing for a specific dish",
    parameters: {
      type: "object",
      properties: {
        dish: {
          type: "string",
          description: "The name of the dish the user is asking about",
        },
      },
      required: ["dish"],
    },
  },
];

// Instructions to append to the system role for wine-pairing behavior.
const WINE_PAIRING_INSTRUCTIONS = `
You are the restaurant assistant for the Tandem platform.

Some restaurants have wine pairings stored in the database. Others do not.  
Only use wine-pairing logic for restaurants that actually have wine pairings (for example, Windmill Creek Winery & Farm Kitchen).

You have access to a function called lookup_wine_pairing(dish), which returns:
• the dish name
• the recommended wine
• the wine tasting notes

USE lookup_wine_pairing ONLY IF ALL of the following are true:
1. The current restaurant has wine pairings enabled in its data.
2. The user is clearly asking for a wine that pairs with a specific dish.
3. The dish name can be identified or inferred from the user’s message.

EXAMPLES WHEN YOU SHOULD CALL THE FUNCTION:
• “What wine pairs with the Blackened Swordfish?”
• “What goes well with the Lamb Ragout?”
• “Which wine should I get with the Crab Dip?”
• “What wine goes with the Seafood Flatbread?”
• “Does the Beast Burger have a pairing?”

EXAMPLES WHEN YOU SHOULD NOT CALL THE FUNCTION:
• The restaurant is not Windmill Creek or another restaurant with pairings.
• When the user asks for general wine information (e.g., “Tell me about your wines”).
• When they ask about multiple dishes at once.
• When the dish name is unclear or missing (ask them to clarify).
• When the restaurant does not have pairings.

If you determine that a pairing function call is appropriate:
• Extract the single dish name as accurately as possible.
• Call lookup_wine_pairing({ dish: "<dish name>" }).

If the function returns no result:
Respond naturally, for example:
“I couldn’t find a pairing for that dish, but I can help with another one.”

Always answer in a conversational, helpful tone.
`;
// Wine pairing response style enforcement: must be appended to system role.
const WINE_PAIRING_RESPONSE_STYLE = `
WINE PAIRING RESPONSE STYLE RULE:

When returning a wine pairing for a dish, the assistant must ALWAYS say “our <Wine Name>” to ensure the recommendation reflects the restaurant’s own wine list.

Examples:
• “This dish pairs well with our Chambourcin.”
• “That goes great with our Rosé.”
• “We recommend our Viognier for that dish.”

Never say “a Chambourcin”, “a Merlot”, “a red wine”, or “their wine”.  
Never introduce generic wine styles or external wines.

Only recommend wines that exist in the Supabase "wines" table and ALWAYS prefix them with “our”.
`;

// Hostess / response style instructions: short, natural, phone-hostess tone.
// - Never dump the full menu unless the user explicitly asks for the full menu.
// - If referencing the menu, give short, high-level descriptions or mention categories.
// - When asked “What else do you have besides wine?”, ask whether they mean food or drinks.
//   * If they say food, reply exactly: "Our menu leans into comfort-driven, seasonal cooking that feels warm and familiar but elevated. It brings together farm-style plates, handmade pastas, flatbreads, and coastal classics." 
//   * If they say drinks, give a short description of the craft beers and cocktails (brief, 1-2 sentences).
//   * If they say both, blend the two responses smoothly into one short reply.
// - When recommending making a reservation, include this reservation button HTML snippet exactly:
//   <a href="https://windmillcreekvineyard.com/mariner-house-dining-reservations-2/" target="_blank"><button>Make a reservation</button></a>
// - Keep replies short, friendly, and sounding like a hostess on the phone.
const HOSTESS_INSTRUCTIONS = `
HOSTESS RESPONSE RULES:
- Adopt a short, friendly, natural hostess-on-the-phone tone for all replies.
- Do NOT list the full menu unless the user explicitly asks for the full menu or to "see the menu".
- When referencing food or drinks, prefer short summaries or highlights rather than item-by-item lists.
- Special question handling: If the user asks exactly or similarly "What else do you have besides wine?", first ask whether they mean "food" or "drinks". If the user clarifies:
  - food: reply: "Our menu leans into comfort-driven, seasonal cooking that feels warm and familiar but elevated. It brings together farm-style plates, handmade pastas, flatbreads, and coastal classics."
  - drinks: reply with a short 1-2 sentence description of the craft beers and cocktails offered.
  - both: combine the two responses into one short, smooth sentence or two.
- Whenever you recommend making a reservation, include the exact reservation button HTML:
  <a href=\"https://windmillcreekvineyard.com/mariner-house-dining-reservations-2/\" target=\"_blank\"><button>Make a reservation</button></a>
`;

async function handleFunctionCall(name, args) {
  if (name === "lookup_wine_pairing") {
    const response = await fetch("http://localhost:4000/api/wine-pairing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dish: args.dish }),
    });

    const data = await response.json();

    const pairing = data.result || data;
    if (!pairing || !pairing.dish) {
      return `I couldn’t find a pairing for "${args.dish}".`;
    }

    // Normalize and shorten notes: split by commas, trim, take first 2, join with "and".
    const rawNotes = pairing.notes || "";
    const noteParts = rawNotes
      .split(",")
      .map((s) => String(s || "").trim())
      .filter(Boolean)
      .slice(0, 2);
    const notesText = noteParts.join(" and ");

    // Build a natural, restaurant-sounding descriptor. Hardcode "a smooth red" for now.
    let description = `${pairing.dish} pairs well with our ${pairing.wine} — a smooth red`;
    if (notesText) {
      description += ` with ${notesText} notes.`;
    } else {
      description += `.`;
    }

    return description;
  }
  return null;
}

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
      const data = await supabaseFetch("menus?select=*,menu_items(*)", {
        method: "GET",
      });
      sendJson(res, 200, data);
      return;
    }

    // NOTE: Demo endpoints and demo JSON fallbacks were removed to
    // enforce using Supabase as the single source of truth. If Supabase
    // is not configured or fails, the server will return an error.

    // GET /api/faqs -> returns faqs
    if (req.url === "/api/faqs" && req.method === "GET") {
      const data = await supabaseFetch("faqs?select=*", { method: "GET" });
      sendJson(res, 200, data);
      return;
    }

    // POST /api/wine-pairing -> returns wine pairing via RPC
    if (req.method === "POST" && req.url === "/api/wine-pairing") {
      try {
        const body = await parseBody(req);
        const dishName = body?.dish;

        if (!dishName) {
          sendJson(res, 400, { error: "Missing dish name" });
          return;
        }

        const payload = JSON.stringify({ dish_name: dishName });
        const result = await supabaseFetch("rpc/get_wine_pairing", {
          method: "POST",
          body: payload,
        });

        if (!result || (Array.isArray(result) && result.length === 0)) {
          sendJson(res, 404, { error: "No pairing found" });
          return;
        }

        const row = Array.isArray(result) && result.length ? result[0] : result;
        const pairing = row;

        sendJson(res, 200, {
          dish: pairing.dish ?? pairing.dish_name ?? null,
          wine: pairing.wine ?? pairing.wine_name ?? null,
          notes: pairing.notes ?? pairing.tasting_notes ?? null,
        });
      } catch (err) {
        console.error("SERVER ERROR:", err);
        sendJson(res, 500, { error: "Internal server error" });
      }

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
      const data = await supabaseFetch("reservations", {
        method: "POST",
        body: payload,
      }, true);
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
        const inputRestaurant =
          body.restaurant_slug || body.restaurant_id || null;
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
          if (
            SUPABASE_URL &&
            (SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY)
          ) {
            try {
              const r = await supabaseFetch(
                `restaurants?id=eq.${encodeURIComponent(rid)}&select=*`,
              );
              const restaurant = Array.isArray(r) && r.length ? r[0] : null;
              if (restaurant) {
                system = `You are an assistant for ${restaurant.name} (${restaurant.short_name || restaurant.id}). `;
              }

              const menus = await supabaseFetch(
                `menus?restaurant_id=eq.${encodeURIComponent(rid)}&select=*,menu_items(*)`,
              );
              if (menus && menus.length) {
                system = (system || "") + "\nMenus available:\n";
                for (const menu of menus) {
                  const items = menu.items || menu.menu_items || [];
                  system += `-- ${menu.title}: ${items.length} items\n`;
                }
              }

              const faqs = await supabaseFetch(
                `faqs?restaurant_id=eq.${encodeURIComponent(rid)}&select=*`,
              );
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
                  const msg =
                    contact.fallback_message ||
                    "Please contact the restaurant via their website or phone.";
                  system =
                    (system || "") +
                    `\nContact fallback: If contact info is requested but not available, reply: "${msg}"\n`;
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

        system = (system || "") + HOSTESS_INSTRUCTIONS + WINE_PAIRING_INSTRUCTIONS + WINE_PAIRING_RESPONSE_STYLE;
        const result = await openaiChat({
          message: body.message,
          system,
          functions: OPENAI_FUNCTIONS,
        });
        if (result.function_call) {
          try {
            const args = JSON.parse(result.function_call.arguments || "{}");
            const funcResp = await handleFunctionCall(
              result.function_call.name,
              args,
            );
            sendJson(res, 200, { reply: funcResp });
          } catch (e) {
            sendJson(res, 502, { error: "Function call handling failed" });
          }
        } else {
          sendJson(res, 200, { reply: result.reply });
        }
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
        const inputRestaurant =
          body.restaurant_slug || body.restaurant_id || null;
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
          if (
            SUPABASE_URL &&
            (SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY)
          ) {
            try {
              const r = await supabaseFetch(
                `restaurants?id=eq.${encodeURIComponent(rid)}&select=*`,
              );
              const restaurant = Array.isArray(r) && r.length ? r[0] : null;
              if (restaurant) {
                system = `You are an assistant for ${restaurant.name} (${restaurant.short_name || restaurant.id}). `;
              }
              const menus = await supabaseFetch(
                `menus?restaurant_id=eq.${encodeURIComponent(rid)}&select=*,menu_items(*)`,
              );
              if (menus && menus.length) {
                system = (system || "") + "\nMenus available:\n";
                for (const menu of menus) {
                  const items = menu.items || menu.menu_items || [];
                  system += `-- ${menu.title}: ${items.length} items\n`;
                }
              }
              const faqs = await supabaseFetch(
                `faqs?restaurant_id=eq.${encodeURIComponent(rid)}&select=*`,
              );
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
                  const msg =
                    contact.fallback_message ||
                    "Please contact the restaurant via their website or phone.";
                  system =
                    (system || "") +
                    `\nContact fallback: If contact info is requested but not available, reply: "${msg}"\n`;
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

        system = (system || "") + HOSTESS_INSTRUCTIONS + WINE_PAIRING_INSTRUCTIONS + WINE_PAIRING_RESPONSE_STYLE;
        const result = await openaiChat({
          message: body.message,
          system,
          functions: OPENAI_FUNCTIONS,
        });
        if (result.function_call) {
          try {
            const args = JSON.parse(result.function_call.arguments || "{}");
            const funcResp = await handleFunctionCall(
              result.function_call.name,
              args,
            );
            sendJson(res, 200, { reply: funcResp });
          } catch (e) {
            sendJson(res, 502, { error: "Function call handling failed" });
          }
        } else {
          sendJson(res, 200, { reply: result.reply });
        }
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
