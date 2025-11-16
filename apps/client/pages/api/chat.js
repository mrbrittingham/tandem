import fs from "fs";
import path from "path";

const DEMO_PATH = path.join(process.cwd(), "apps", "client", "data", "windmill.json");

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

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body;
  if (!body || !body.message) return res.status(400).json({ error: "message is required" });

  try {
    let system = null;
    if (body.restaurant_id) {
      // Prefer Supabase when configured; else fallback to demo JSON
      if (process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
        try {
          const rid = encodeURIComponent(body.restaurant_id);
          const rest = await supabaseFetch(`/rest/v1/restaurants?id=eq.${rid}&select=*`);
          const restaurant = Array.isArray(rest) && rest.length ? rest[0] : null;
          const menus = await supabaseFetch(`/rest/v1/menus?restaurant_id=eq.${rid}&select=*,menu_items(*)`);
          const faqs = await supabaseFetch(`/rest/v1/faqs?restaurant_id=eq.${rid}&select=*`);
          if (restaurant) {
            system = `You are an assistant for ${restaurant.name} (${restaurant.short_name || restaurant.name}). `;
            if (Array.isArray(menus) && menus.length) {
              system += "\nMenu items:\n";
              for (const menu of menus) {
                system += `-- ${menu.title}: `;
                const names = (menu.menu_items || []).map((i) => `${i.name}${i.price ? ` ($${i.price})` : ""}`);
                system += names.join(", ") + "\n";
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
              system += "\nMenu items:\n";
              for (const menu of demo.menus) {
                system += `-- ${menu.title}: `;
                const names = (menu.items || []).map((i) => `${i.name}${i.price ? ` ($${i.price})` : ""}`);
                system += names.join(", ") + "\n";
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
            system += "\nMenu items:\n";
            for (const menu of demo.menus) {
              system += `-- ${menu.title}: `;
              const names = (menu.items || []).map((i) => `${i.name}${i.price ? ` ($${i.price})` : ""}`);
              system += names.join(", ") + "\n";
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
    if (!process.env.OPENAI_API_KEY) {
      const placeholder =
        "Hi! I’m your demo chatbot. Add API keys to enable real responses.";
      return res.status(200).json({ reply: placeholder });
    }

    // Ask OpenAI
    const reply = await openaiChat({ message: body.message, system });
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("/api/chat error", err);
    return res.status(502).json({ error: err.message || String(err) });
  }
}
