import fs from "fs";
import path from "path";

const DEMO_PATH = path.join(
  process.cwd(),
  "apps",
  "client",
  "data",
  "windmill.json",
);

export default async function handler(req, res) {
  try {
    const txt = await fs.promises.readFile(DEMO_PATH, "utf8");
    const json = JSON.parse(txt);
    return res.status(200).json(json.restaurant || null);
  } catch (err) {
    console.error("/api/demo/restaurant error", err);
    return res.status(500).json({ error: "demo not found" });
  }
}
