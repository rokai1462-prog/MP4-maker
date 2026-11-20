#!/usr/bin/env node
/*
  ElevenLabs voiceover + automatic timing for one video.

  Usage (from the space-videos folder):
    node tools/voiceover.mjs videos/<name>          # dry run: shows how many characters (credits) it would use
    node tools/voiceover.mjs videos/<name> --go     # makes the audio (spends ElevenLabs credits), then times everything
    node tools/voiceover.mjs videos/<name> --layout # no API calls: re-time from audio already made

  Reads   videos/<name>/script/narration.json
          {
            "voice_id": "SAz9YHcvj6GT2YYXdXww",          // ElevenLabs voice (River: relaxed, informative)
            "model_id": "eleven_multilingual_v2",
            "scenes": [ { "id": "scene-01", "text": "Saturn is losing its *rings.*" }, ... ]
          }
          Wrap key words in *asterisks*: they stay gold in the captions (the asterisks are not spoken).

  Writes  assets/voice/<scene>.mp3            the narration for each scene
          script/voice-cache.json             what text each file was made from (unchanged text is never re-made)
          script/timing.json                  each scene's start and length on the timeline
          script/words.json                   every spoken word with its start and end (for captions)
          index.html                          scene hosts, total length, cut times and <audio> tags updated
          compositions/captions.html          rebuilt from words.json

  Key: the ElevenLabs key is stored in the cloud environment's secrets (or ELEVENLABS_API_KEY);
  it is never written to any file in this project.
*/
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const tools = path.dirname(fileURLToPath(import.meta.url));
const dir = process.argv[2];
const GO = process.argv.includes("--go");
const LAYOUT_ONLY = process.argv.includes("--layout");
if (!dir) {
  console.error("Usage: node tools/voiceover.mjs videos/<name> [--go | --layout]");
  process.exit(1);
}

const LEAD = 0.35; // silence before the voice starts in each scene
const TAIL = 0.55; // breathing room after the last word
const OVERLAP = 0.5; // scenes overlap by this much for the cosmic zoom
const FIRST_LEAD = 0.2;

const narr = JSON.parse(fs.readFileSync(path.join(dir, "script", "narration.json"), "utf8"));
const voiceId = narr.voice_id || "SAz9YHcvj6GT2YYXdXww";
const modelId = narr.model_id || "eleven_multilingual_v2";
const cachePath = path.join(dir, "script", "voice-cache.json");
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};
fs.mkdirSync(path.join(dir, "assets", "voice"), { recursive: true });

const spoken = (t) => t.replace(/\*/g, "").replace(/\s+/g, " ").trim();
const keyOf = (s) =>
  crypto.createHash("sha256").update(JSON.stringify([voiceId, modelId, spoken(s.text), narr.voice_settings || null])).digest("hex");

// ---- 1. Make audio (only for scenes whose text changed) ----
const todo = narr.scenes.filter((s) => cache[s.id]?.key !== keyOf(s) || !fs.existsSync(path.join(dir, "assets", "voice", `${s.id}.mp3`)));
const chars = todo.reduce((n, s) => n + spoken(s.text).length, 0);
if (!LAYOUT_ONLY) {
  console.log(`Voice ${voiceId}, model ${modelId}.`);
  console.log(`${todo.length} of ${narr.scenes.length} scenes need new audio: ${chars} characters (about ${chars} ElevenLabs credits).`);
  if (!GO) {
    console.log("Dry run only. Add --go to make the audio.");
    process.exit(0);
  }
  for (const s of todo) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          // The cloud proxy swaps in the real key; locally, set ELEVENLABS_API_KEY.
          "xi-api-key": process.env.ELEVENLABS_API_KEY || "placeholder",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: spoken(s.text),
          model_id: modelId,
          voice_settings: narr.voice_settings || { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },
        }),
      },
    );
    if (!res.ok) {
      console.error(`ElevenLabs refused ${s.id}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
      process.exit(1);
    }
    const data = await res.json();
    fs.writeFileSync(path.join(dir, "assets", "voice", `${s.id}.mp3`), Buffer.from(data.audio_base64, "base64"));
    cache[s.id] = { key: keyOf(s), text: s.text, alignment: data.alignment };
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));
    console.log(`  made ${s.id}.mp3`);
  }
}

// ---- 2. Words per scene from the character timings ----
function sceneWords(s) {
  const al = cache[s.id]?.alignment;
  if (!al) throw new Error(`No audio for ${s.id} yet: run with --go first.`);
  const out = [];
  let cur = null;
  al.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) out.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { text: "", start: al.character_start_times_seconds[i], end: 0 };
    cur.text += ch;
    cur.end = al.character_end_times_seconds[i];
  });
  if (cur) out.push(cur);
  // Put the *key word* markers back by position.
  const tokens = s.text.replace(/\s+/g, " ").trim().split(" ");
  if (tokens.length === out.length) out.forEach((w, i) => (w.text = tokens[i]));
  return out;
}
const duration = (f) =>
  parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

// ---- 3. Lay the scenes out back to back ----
let t = 0;
const timing = [];
const allWords = [];
narr.scenes.forEach((s, i) => {
  const lead = i === 0 ? FIRST_LEAD : LEAD;
  const audio = duration(path.join(dir, "assets", "voice", `${s.id}.mp3`));
  const len = +(lead + audio + TAIL).toFixed(3);
  const start = +t.toFixed(3);
  timing.push({ id: s.id, start, duration: len, voiceStart: +(start + lead).toFixed(3), audio: +audio.toFixed(3) });
  for (const w of sceneWords(s)) allWords.push({ text: w.text, start: +(start + lead + w.start).toFixed(3), end: +(start + lead + w.end).toFixed(3) });
  t = start + len - OVERLAP;
});
const total = +(t + OVERLAP).toFixed(3);
const cuts = timing.slice(1).map((s) => +(s.start + OVERLAP / 2).toFixed(3));
fs.writeFileSync(path.join(dir, "script", "timing.json"), JSON.stringify({ total, cuts, scenes: timing }, null, 1));
fs.writeFileSync(path.join(dir, "script", "words.json"), JSON.stringify(allWords, null, 1));

// ---- 4. Update index.html ----
const idxPath = path.join(dir, "index.html");
let html = fs.readFileSync(idxPath, "utf8");
const setAttr = (block, name, value) =>
  block.match(new RegExp(`${name}="[^"]*"`)) ? block.replace(new RegExp(`${name}="[^"]*"`), `${name}="${value}"`) : block;
function editTag(id, fn) {
  const re = new RegExp(`<(div|canvas)\\s[^>]*?id="${id}"[^>]*>`, "s");
  const m = html.match(re);
  if (!m) return false;
  html = html.replace(m[0], fn(m[0]));
  return true;
}
editTag("root", (b) => setAttr(setAttr(b, "data-duration", total), "data-warp", JSON.stringify(cuts).replace(/,/g, ", ")));
for (const id of ["space-bg", "starfield", "warp", "captions"]) editTag(id, (b) => setAttr(b, "data-duration", total));
for (const s of timing) {
  if (!editTag(s.id, (b) => setAttr(setAttr(b, "data-start", s.start), "data-duration", s.duration)))
    console.warn(`  index.html has no host for ${s.id}: add one (copy an existing scene host).`);
}
const audioTags = timing
  .map((s) => `      <audio id="vo-${s.id}" class="clip" src="assets/voice/${s.id}.mp3" data-start="${s.voiceStart}" data-duration="${s.audio}" data-track-index="8" data-volume="1"></audio>`)
  .join("\n");
html = html.replace(/<!-- VOICE:BEGIN -->[\s\S]*?<!-- VOICE:END -->/, `<!-- VOICE:BEGIN -->\n${audioTags}\n      <!-- VOICE:END -->`);
fs.writeFileSync(idxPath, html);

execFileSync("node", [path.join(tools, "build-captions.mjs"), dir], { stdio: "inherit" });
console.log(`Timed ${timing.length} scenes: ${total.toFixed(1)} s total. Cuts at ${cuts.join(", ")} s.`);
