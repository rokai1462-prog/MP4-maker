#!/usr/bin/env node
/*
  Start a new video from the house template.

  Usage (from the space-videos folder):
    node tools/new-video.mjs <short-name> "<topic sentence>"
  e.g.
    node tools/new-video.mjs 01-saturn-rings "Why Saturn's rings are disappearing"

  Creates videos/<short-name>/ with the vertical template, the current brand files,
  and a script/BRIEF.md holding the topic.
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const base = path.resolve(here, "..");
const [name, ...topicParts] = process.argv.slice(2);
const topic = topicParts.join(" ").trim();
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.error('Usage: node tools/new-video.mjs <short-name-with-dashes> "<topic sentence>"');
  process.exit(1);
}
const dest = path.join(base, "videos", name);
if (fs.existsSync(dest)) {
  console.error(`videos/${name} already exists — pick another name.`);
  process.exit(1);
}
fs.cpSync(path.join(base, "template"), dest, { recursive: true });
fs.cpSync(path.join(base, "brand"), path.join(dest, "assets", "brand"), {
  recursive: true,
  filter: (src) => !src.endsWith(".md"),
});
const meta = { id: name, name, topic, createdAt: new Date().toISOString() };
fs.writeFileSync(path.join(dest, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
fs.writeFileSync(
  path.join(dest, "script", "BRIEF.md"),
  `# ${topic || name}\n\nTopic sentence: ${topic}\n\nStatus: script not written yet. See ../../../WORKFLOW.md.\n`,
);
console.log(`Created videos/${name}`);
