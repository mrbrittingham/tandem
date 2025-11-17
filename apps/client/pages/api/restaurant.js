import fs from "fs";
import path from "path";

const DEMO_PATH = path.join(process.cwd(), "apps", "client", "data", "windmill.json");

// Enable verbose restaurant debug logs when DEBUG_RESTAURANT=true
const DEBUG = process.env.DEBUG_RESTAURANT === "true";

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
  // treat as slug: query supabase for slug
  if (DEBUG) console.log("[restaurant debug] resolveRestaurantUuid - input:", v);
  if (process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    // try slug column
    let res = await supabaseFetch(`/rest/v1/restaurants?slug=eq.${encodeURIComponent(v)}&select=id`);
    if (DEBUG) console.log("[restaurant debug] supabaseFetch slug=", v, "result=", res);
    if (Array.isArray(res) && res.length) return res[0].id;
    // try domain
    res = await supabaseFetch(`/rest/v1/restaurants?domain=eq.${encodeURIComponent(v)}&select=id`);
    if (DEBUG) console.log("[restaurant debug] supabaseFetch domain=", v, "result=", res);
    if (Array.isArray(res) && res.length) return res[0].id;
    // try name ilike (replace dashes with spaces)
    const nameCandidate = v.replace(/-/g, " ");
    res = await supabaseFetch(`/rest/v1/restaurants?name=ilike.%25${encodeURIComponent(nameCandidate)}%25&select=id`);
    if (DEBUG) console.log("[restaurant debug] supabaseFetch nameCandidate=", nameCandidate, "result=", res);
    if (Array.isArray(res) && res.length) return res[0].id;
    if (DEBUG) console.log("[restaurant debug] resolveRestaurantUuid - not found for:", v);
    return null; // not found
  }
  if (DEBUG) console.log("[restaurant debug] resolveRestaurantUuid - no supabase config, returning null for:", v);
  return null;
}

export default async function handler(req, res) {
  try {
    // Accept id/restaurant or body.restaurant_id / body.restaurant_slug
    const queryVal = req.query.id || req.query.restaurant || null;
    const bodyVal = req.body?.restaurant_id || req.body?.restaurant_slug || null;
    const input = queryVal || bodyVal;

    console.log("[restaurant debug] incoming id:", input);
    if (DEBUG) console.log("[restaurant debug] isUUID:", input ? UUID_RE.test(String(input).trim()) : false);

    if (!input) return res.status(400).json({ error: "restaurant id or slug required" });

    // Resolve slug -> uuid if necessary. If slug cannot be resolved, return 404 (no demo fallback)
    let resolvedUuid = null;
    try {
      resolvedUuid = await resolveRestaurantUuid(input);
      if (DEBUG) console.log("[restaurant debug] resolveRestaurantUuid returned:", resolvedUuid);
    } catch (err) {
      if (DEBUG) console.error("[restaurant debug] /api/restaurant slug resolution error", err);
      return res.status(500).json({ error: "slug resolution failed" });
    }

    if (!resolvedUuid) {
      // If the input was a slug (non-UUID) we must return 404 per instructions
      // Determine if input looks like a uuid; if not, it's a slug not found
      if (!UUID_RE.test(String(input).trim())) {
        if (DEBUG) console.log("[restaurant debug] input appears to be slug and was not resolved, returning 404", input);
        return res.status(404).json({ error: "restaurant slug not found" });
      }
      // It looked like a UUID but wasn't resolvable via supabase; continue to try DB (may return nothing)
      resolvedUuid = String(input).trim();
    }

    // Try Supabase first if configured
    if (process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      try {
        const rid = encodeURIComponent(resolvedUuid);
        if (DEBUG) console.log("[restaurant debug] querying supabase for id=", resolvedUuid);
        const r = await supabaseFetch(`/rest/v1/restaurants?id=eq.${rid}&select=*`);
        if (DEBUG) console.log("[restaurant debug] supabase restaurants by id result:", r);
        if (Array.isArray(r) && r.length) return res.status(200).json(r[0]);
        // No row found -> 404
        if (DEBUG) console.log("[restaurant debug] supabase returned no rows for id:", resolvedUuid);
        return res.status(404).json({ error: "restaurant not found" });
      } catch (err) {
        if (DEBUG) console.error("[restaurant debug] /api/restaurant supabase error", err);
        // Fall through to demo fallback only on real Supabase failures
      }
    }

    // Fallback to demo JSON when Supabase isn't available or errors
    try {
      if (DEBUG) console.log("[restaurant debug] attempting demo fallback, reading:", DEMO_PATH);
      const txt = await fs.promises.readFile(DEMO_PATH, "utf8");
      const json = JSON.parse(txt);
      if (DEBUG) console.log("[restaurant debug] demo json read successfully");
      return res.status(200).json(json.restaurant || null);
    } catch (err) {
      if (DEBUG) console.error("[restaurant debug] /api/restaurant demo error", err);
      return res.status(500).json({ error: "not found" });
    }
  } catch (err) {
    try {
      if (DEBUG) console.error("[restaurant debug] top-level error object:", err);
      if (DEBUG) console.error("[restaurant debug] top-level stack:", err && err.stack ? err.stack : "(no stack available)");
    } catch (logErr) {
      // ignore logging errors
    }
    throw err;
  }
}
