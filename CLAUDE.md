# MP4-maker: Space Videos

Educational space videos (planets, black holes, stars, the solar system) made with HyperFrames
(HTML rendered to MP4). The owner is not a developer: do the work, explain in plain English,
and show the script and a preview before any final render.

## When the person gives a topic sentence

Follow `space-videos/WORKFLOW.md` step by step. Stop for notes after the script (step 2) and
after the preview (step 6). Use `space-videos/template/script/SCRIPT.md` as the script format.

## Running HyperFrames

- Skills are in `.agents/skills/` (read `/hyperframes` and `/hyperframes-cli` first).
- Run the CLI from inside the video's folder as
  `HYPERFRAMES_NO_TELEMETRY=1 node /home/user/MP4-maker/.agents/skills/hyperframes/scripts/plugin-cli.mjs <command>`
  (adjust the absolute path to wherever the repo is checked out). Telemetry stays off.
- Loop: `lint` → `check --json` (fix every error) → `snapshot` and look → `preview --background`
  → `render --quality draft` for previews, `--quality delivery` for the final.

## House look (never drift from it)

- `space-videos/brand/brand.css` and `motion.js` define the look. Videos get a copy in `assets/brand/`.
  Restyle via brand/, then `node space-videos/tools/sync-brand.mjs`.
- Vertical 1080×1920, 30 fps. Scenes overlap by 0.5 s. `SV.zoomIn` / `SV.zoomOut` give the
  cosmic-zoom transition, and `#root[data-warp]` lists the cut times for the star-streak burst.
- Readable text inside x 120–888, y 288–1248 (x 120–780 below y 840). Captions come from
  `tools/build-captions.mjs`.
- Draw visuals in code (canvas/SVG/CSS). Deterministic only: no Math.random, use `SV.rnd(n)`.

## Voiceover: ElevenLabs

- The key is a **network secret** on this cloud environment (host `api.elevenlabs.io`, header
  `xi-api-key`). Never ask for the key in chat, never accept a pasted one, and never write it to a file.
- `node space-videos/tools/voiceover.mjs videos/<name>` is a dry run that prints the credit cost.
  Spend credits (`--go`) only on an approved script, after telling the person the character count.
- Edited narration only re-voices the scenes whose text changed (`script/voice-cache.json`).

## Rules from the owner

- Keep it free. No paid APIs or services beyond the approved ElevenLabs without asking first.
- Only public-domain or properly licensed media. NASA media is generally public domain, but say
  so each time it is used and record it in the script's "Media used" table with its credit.
  No AI image or video generators.
- Cite a source for every science fact (in SCRIPT.md's fact-check table and in the final
  description) so the owner can verify it.

## Environment notes

- jsDelivr/unpkg are blocked by the network: get JS libraries with `npm pack <pkg>@<ver>` into
  the scratchpad and copy the file into the video's `assets/vendor/`. Never load from a CDN at render time.
- Commit and push work to the session's branch when a step is done.
