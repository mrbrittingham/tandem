import fs from "fs";
import path from "path";

const DEMO_PATH = path.join(
  process.cwd(),
  "apps",
  "client",
  "data",
  "windmill.json",
);

// Hostess and wine-pairing instructions (client-side mirror of server behavior)
const HOSTESS_INSTRUCTIONS = `
HOSTESS RESPONSE RULES:
- Short, friendly, hostess-on-the-phone tone for replies.
- Do NOT list the full menu unless the user explicitly asks to "see the menu" or requests the full menu.
- Prefer short summaries or highlights rather than item-by-item lists.
- If asked "What else do you have besides wine?", ask whether they mean "food" or "drinks". If the user clarifies:
  - food: reply: "Our menu leans into comfort-driven, seasonal cooking that feels warm and familiar but elevated. It brings together farm-style plates, handmade pastas, flatbreads, and coastal classics."
  - drinks: reply with a short 1-2 sentence description of the craft beers and cocktails offered.
  - both: combine the two responses into one short, smooth reply.
- When recommending a reservation, include the exact reservation button HTML:
  <a href=\"https://windmillcreekvineyard.com/mariner-house-dining-reservations-2/\" target=\"_blank\"><button>Make a reservation</button></a>
`;

const WINE_PAIRING_INSTRUCTIONS = `
Only use wine-pairing logic when the restaurant's data includes pairings. Use pairing lookups ONLY when the user asks for a pairing for a specific dish. When returning a pairing, say "our <Wine Name>".
`;

const WINE_PAIRING_RESPONSE_STYLE = `
When returning a wine pairing, always prefix with "our" (example: "our Chambourcin").
`;

async function readDemo() {
  try {
    const txt = await fs.promises.readFile(DEMO_PATH, "utf8");
    return JSON.parse(txt);
  } catch (e) {
    return null;
  }
}

async function supabaseFetch(pathSuffix, opts = {}, useServiceRole = false) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL is not configured");
  const url = `${SUPABASE_URL.replace(/\/$/, "")}${pathSuffix}`;
  const headers = { "Content-Type": "application/json" };
  const key = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    : process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
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
}

async function openaiChat({ message, system = null }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not configured");
  const url = "https://api.openai.com/v1/chat/completions";
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: message });
  const body = {
    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    messages,
    max_tokens: 512,
    temperature: 0.7,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${txt}`);
  }
  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? null;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const body = req.body;
  if (!body || !body.message)
    return res.status(400).json({ error: "message is required" });

  try {
    let system = null;
    if (body.restaurant_id) {
      // Prefer Supabase when configured; else fallback to demo JSON
      if (
        process.env.SUPABASE_URL &&
        (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
      ) {
        try {
          const rid = encodeURIComponent(body.restaurant_id);
          const rest = await supabaseFetch(
            `/rest/v1/restaurants?id=eq.${rid}&select=*`,
          );
          const restaurant =
            Array.isArray(rest) && rest.length ? rest[0] : null;
          const menus = await supabaseFetch(
            `/rest/v1/menus?restaurant_id=eq.${rid}&select=*,menu_items(*)`,
          );
          const faqs = await supabaseFetch(
            `/rest/v1/faqs?restaurant_id=eq.${rid}&select=*`,
          );
          if (restaurant) {
            system = `You are an assistant for ${restaurant.name} (${restaurant.short_name || restaurant.name}). `;
            if (Array.isArray(menus) && menus.length) {
              system += "\nMenus available:\n";
              for (const menu of menus) {
                const items = menu.menu_items || [];
                system += `-- ${menu.title}: ${items.length} items\n`;
              }
            }
            if (Array.isArray(faqs) && faqs.length) {
              system += "\nFAQs:\n";
              for (const f of faqs) {
                system += `Q: ${f.question} A: ${f.answer}\n`;
              }
            }
          }
        } catch (e) {
          // fall back to demo JSON if Supabase fails
          console.error("Supabase fetch failed, falling back to demo", e);
          const demo = await readDemo();
          if (demo && demo.restaurant) {
            system = `You are an assistant for ${demo.restaurant.name} (${demo.restaurant.short_name}). `;
            if (demo.menus) {
              system += "\nMenus available:\n";
              for (const menu of demo.menus) {
                const items = menu.items || [];
                system += `-- ${menu.title}: ${items.length} items\n`;
              }
            }
            if (demo.faqs) {
              system += "\nFAQs:\n";
              for (const f of demo.faqs) {
                system += `Q: ${f.question} A: ${f.answer}\n`;
              }
            }
          }
        }
      } else {
        const demo = await readDemo();
        if (demo && demo.restaurant) {
          system = `You are an assistant for ${demo.restaurant.name} (${demo.restaurant.short_name}). `;
          if (demo.menus) {
            system += "\nMenus available:\n";
            for (const menu of demo.menus) {
              const items = menu.items || [];
              system += `-- ${menu.title}: ${items.length} items\n`;
            }
          }
          if (demo.faqs) {
            system += "\nFAQs:\n";
            for (const f of demo.faqs) {
              system += `Q: ${f.question} A: ${f.answer}\n`;
            }
          }
        }
      }
    }

    // If OpenAI API key is missing, return a helpful demo placeholder
    // We'll still format the placeholder through formatBotReply for consistency
    function replaceEmDashes(s) {
      return s ? s.replace(/—|--/g, ":") : s;
    }

    function collapseBlankLines(s) {
      return s.replace(/\n{3,}/g, "\n\n");
    }

    function trimLines(s) {
      return s
        .split(/\r?\n/)
        .map((l) => l.trimRight())
        .join("\n")
        .trim();
    }

    function formatMenuItem(item) {
      const lines = [];
      lines.push(`**${item.name}**`);
      if (item.description) lines.push(`• ${item.description}`);
      if (item.price !== undefined && item.price !== null)
        lines.push(`• Price: $${item.price}`);
      if (item.notes) {
        // try to extract pairing from notes
        const m = /Pairing:\s*(.*)/i.exec(item.notes);
        if (m) lines.push(`• Pairing: ${m[1]}`);
      }
      return lines.join("\n");
    }

    async function formatBotReply(modelReply) {
      let r = modelReply || "";
      r = String(r);
      r = r.trim();
      r = replaceEmDashes(r);
      r = collapseBlankLines(r);

      // If empty after trimming, return fallback
      if (!r)
        return "I am here to help. Try asking about the menu, hours, or reservations.";

      // Attempt to load demo data for menu/faq lookups
      const demo = await readDemo();

      // Menu item exact match (case-insensitive)
      if (demo && Array.isArray(demo.menus)) {
        for (const menu of demo.menus) {
          if (!menu.items) continue;
          for (const item of menu.items) {
            if (
              item &&
              item.name &&
              item.name.toLowerCase() === r.toLowerCase()
            ) {
              return replaceEmDashes(formatMenuItem(item));
            }
          }
        }
      }

      // FAQ pattern: begins with Q: or matches a demo FAQ question
      const qMatch = /^Q:\s*(.+?)\s*(?:A:|$)/i.exec(r);
      if (qMatch) {
        const question = qMatch[1].trim();
        const answer = r.replace(/^Q:\s*.+?\s*(?:A:)?\s*/i, "").trim();
        const out = `**${question}**\n${answer || ""}`.replace(/—|--/g, ":");
        return collapseBlankLines(out);
      }

      if (demo && Array.isArray(demo.faqs)) {
        for (const f of demo.faqs) {
          if (
            f.question &&
            r.toLowerCase().startsWith(f.question.toLowerCase())
          ) {
            const out = `**${f.question}**\n${f.answer || ""}`.replace(
              /—|--/g,
              ":",
            );
            return collapseBlankLines(out);
          }
        }
      }

      // Default: return trimmed, em-dash-replaced reply
      return trimLines(r).replace(/—|--/g, ":");
    }

    if (!process.env.OPENAI_API_KEY) {
      const placeholder =
        "Hi! I\u2019m your demo chatbot. Add API keys to enable real responses.";
      const formatted = await formatBotReply(placeholder);
      return res.status(200).json({ reply: formatted });
    }

    // Ask OpenAI (append hostess + wine pairing guidance)
    system = (system || "") + HOSTESS_INSTRUCTIONS + WINE_PAIRING_INSTRUCTIONS + WINE_PAIRING_RESPONSE_STYLE;
    const modelReply = await openaiChat({ message: body.message, system });
    const reply = await formatBotReply(modelReply);
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("/api/chat error", err);
    return res.status(502).json({ error: err.message || String(err) });
  }
}
