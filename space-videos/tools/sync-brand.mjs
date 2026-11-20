#!/usr/bin/env node
/*
  Push the house look (brand/brand.css + brand/motion.js) into the template and every video,
  so a change to colors or fonts applies everywhere. Re-render a video afterwards to see it.

  Usage (from the space-videos folder):
    node tools/sync-brand.mjs
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = ["brand.css", "motion.js"];
const targets = [path.join(base, "template")];
const vids = path.join(base, "videos");
for (const d of fs.readdirSync(vids)) {
  const p = path.join(vids, d);
  if (fs.existsSync(path.join(p, "assets", "brand"))) targets.push(p);
}
for (const t of targets) {
  fs.mkdirSync(path.join(t, "assets", "brand"), { recursive: true });
  for (const f of files) fs.copyFileSync(path.join(base, "brand", f), path.join(t, "assets", "brand", f));
  console.log("updated", path.relative(base, t));
}
