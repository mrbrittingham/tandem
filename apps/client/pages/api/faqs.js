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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveRestaurantUuid(value) {
  if (!value) return null;
  const v = String(value).trim();
  if (UUID_RE.test(v)) return v;
  if (process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    let res = await supabaseFetch(`/rest/v1/restaurants?slug=eq.${encodeURIComponent(v)}&select=id`);
    if (Array.isArray(res) && res.length) return res[0].id;
    res = await supabaseFetch(`/rest/v1/restaurants?domain=eq.${encodeURIComponent(v)}&select=id`);
    if (Array.isArray(res) && res.length) return res[0].id;
    const nameCandidate = v.replace(/-/g, " ");
    res = await supabaseFetch(`/rest/v1/restaurants?name=ilike.%25${encodeURIComponent(nameCandidate)}%25&select=id`);
    if (Array.isArray(res) && res.length) return res[0].id;
    return null;
  }
  return null;
}

export default async function handler(req, res) {
  const input = req.query.restaurant || req.query.id || req.body?.restaurant_id || req.body?.restaurant_slug;
  if (!input) return res.status(400).json({ error: "restaurant id or slug required" });

  let rid = null;
  try {
    rid = await resolveRestaurantUuid(input);
  } catch (err) {
    console.error("/api/faqs slug resolution error", err);
    return res.status(500).json({ error: "slug resolution failed" });
  }

  if (!rid) {
    if (!UUID_RE.test(String(input).trim())) return res.status(404).json({ error: "restaurant slug not found" });
    rid = String(input).trim();
  }

  if (process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    try {
      const enc = encodeURIComponent(rid);
      const f = await supabaseFetch(`/rest/v1/faqs?restaurant_id=eq.${enc}&select=*`);
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
