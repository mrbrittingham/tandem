#!/usr/bin/env node
/* Simple seed uploader for Windmill demo using Supabase REST API.
   Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
   Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed/generate.js
*/
import fs from "fs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !KEY) {
  console.error(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in env",
  );
  process.exit(1);
}

const DEMO = JSON.parse(
  fs.readFileSync("apps/client/data/windmill.json", "utf8"),
);

async function supabaseFetch(pathSuffix, opts = {}) {
  const url = `${SUPABASE_URL.replace(/\/$/, "")}${pathSuffix}`;
  const headers = {
    "Content-Type": "application/json",
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
  };
  const res = await fetch(url, { headers, ...opts });
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}

async function run() {
  try {
    // Upsert restaurant (insert if not exists)
    const r = await supabaseFetch(`/rest/v1/restaurants`, {
      method: "POST",
      body: JSON.stringify(DEMO.restaurant),
    });
    console.log("Restaurant insert response:", r);

    // Insert menus and items
    for (const menu of DEMO.menus || []) {
      const menuBody = { restaurant_id: DEMO.restaurant.id, title: menu.title };
      const mRes = await supabaseFetch(`/rest/v1/menus`, {
        method: "POST",
        body: JSON.stringify(menuBody),
      });
      console.log("Inserted menu:", mRes);
      // menu items
      for (const item of menu.items || []) {
        const itemBody = {
          menu_id: mRes?.id || null,
          name: item.name,
          price: item.price || null,
          description: item.description || null,
        };
        const it = await supabaseFetch(`/rest/v1/menu_items`, {
          method: "POST",
          body: JSON.stringify(itemBody),
        });
        console.log("Inserted item:", it);
      }
    }

    // Insert faqs
    for (const f of DEMO.faqs || []) {
      const fb = {
        restaurant_id: DEMO.restaurant.id,
        question: f.question,
        answer: f.answer,
      };
      const fres = await supabaseFetch(`/rest/v1/faqs`, {
        method: "POST",
        body: JSON.stringify(fb),
      });
      console.log("Inserted faq:", fres);
    }

    console.log("Seeding complete");
  } catch (err) {
    console.error("Seed failed", err);
  }
}

run();
