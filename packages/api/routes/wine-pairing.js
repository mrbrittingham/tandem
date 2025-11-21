/* eslint-disable import/no-unresolved */
import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

router.post("/", async (req, res) => {
  try {
    const { dish } = req.body;

    if (!dish) {
      return res.status(400).json({ error: "Missing dish name" });
    }

    const { data, error } = await supabase.rpc("get_wine_pairing", {
      dish_name: dish,
    });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.json({ result: null });
    }

    console.log("PAIRING RESULT:", data);

    return res.json({ result: data[0] });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
