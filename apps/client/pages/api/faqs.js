import fs from "fs";
import path from "path";

const DEMO_PATH = path.join(process.cwd(), "apps", "client", "data", "windmill.json");

async function supabaseFetch(pathSuffix, opts = {}) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL not configured");
  const url = `${SUPABASE_URL.replace(/\/$/, "")}${pathSuffix}`;
  const headers = { "Content-Type": "application/json" };
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
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

export default async function handler(req, res) {
  const id = req.query.restaurant || req.query.id || req.body?.restaurant_id;
  if (!id) return res.status(400).json({ error: "restaurant id required" });

  if (process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    try {
      const rid = encodeURIComponent(id);
      const f = await supabaseFetch(`/rest/v1/faqs?restaurant_id=eq.${rid}&select=*`);
      return res.status(200).json(f || []);
    } catch (err) {
      console.error("/api/faqs supabase error", err);
    }
  }

  try {
    const txt = await fs.promises.readFile(DEMO_PATH, "utf8");
    const json = JSON.parse(txt);
    return res.status(200).json(json.faqs || []);
  } catch (err) {
    console.error("/api/faqs demo error", err);
    return res.status(500).json({ error: "not found" });
  }
}
