# Space Videos: cheat sheet

## 1. Start a new video

Open a Claude Code session on the **MP4-maker** repo (in the cloud, on the **MP4-maker**
environment, which holds your ElevenLabs key) and type one sentence:

> **New video: Why Saturn's rings are disappearing**

What happens next (details in `WORKFLOW.md`):
1. I write the script, with a fact-check table that has a source link for every claim, and **show it to you**.
2. You give notes, or say **"approved"**.
3. I tell you how many ElevenLabs credits the voice will use, then make it.
4. I build the animation and **show you a preview and a draft video**.
5. You give notes, or say **"final"**. I render the MP4 and give you a description with all sources to paste under the video.

## 2. Give revision notes

Plain English is fine. Say which scene (or roughly when) and what to change:

| You say | What happens | Costs credits? |
|---|---|---|
| "Scene 3: make the black hole bigger and redder" | visual change | No |
| "The captions are too fast at 0:20" | timing tweak | No |
| "Change the hook to: *What if Saturn lost its rings tomorrow?*" | new narration for that one scene only | Yes, only that line's characters |
| "Use a deeper voice" | I list a few ElevenLabs voices, and you pick one | Yes, the whole script is re-voiced |
| "Is the 300-million-year number right?" | I re-check it and show you the source | No |
| "Make every video's gold more orange" | change in `brand/`, applied to all videos | No |

## 3. Add NASA (or other) images and footage you're allowed to use

**Safe sources:**
- **NASA**: images.nasa.gov (the NASA Image and Video Library), science.nasa.gov, svs.gsfc.nasa.gov (Scientific Visualization Studio animations).
  - NASA media is generally **not copyrighted in the US** and is allowed for educational use.
  - **Not allowed:** the NASA logo ("meatball"), the "worm" logotype or the seal, or anything that implies NASA endorses you.
  - **Always read the credit line.** If it names someone other than NASA (a university, a photographer, "ESA", "© …"), it may be copyrighted. Tell me and I'll check before using it.
- **ESA / Hubble / Webb** (esahubble.org, esawebb.org): mostly **CC BY 4.0**, meaning free to use, including on monetised channels, **with a credit**, e.g. "Credit: ESA/Webb, NASA & CSA".
- **Not OK:** random Google Images results, other YouTubers' videos, or AI-generated "space photos".

**How to add one:**
1. Paste me the image page's link (for example an images.nasa.gov page). I download it into the video's `assets/images/` folder, note its license and credit in the script's "Media used" table, and **tell you it's NASA media**.
2. Or upload the file here and give me the page you got it from.
3. Say where it goes: "use this Cassini photo behind scene 2".

The credit lines go into the description I give you at the end. Paste them under your video.

## 4. Re-render

You just say **"re-render"** (or "re-render the Saturn video"). What I run, for reference:

```bash
cd space-videos/videos/01-saturn-rings
node <repo>/.agents/skills/hyperframes/scripts/plugin-cli.mjs check
node <repo>/.agents/skills/hyperframes/scripts/plugin-cli.mjs render --quality draft    -o renders/draft.mp4   # quick preview
node <repo>/.agents/skills/hyperframes/scripts/plugin-cli.mjs render --quality delivery -o renders/final.mp4   # final
```

If the narration changed: `node tools/voiceover.mjs videos/<name> --go` first, which only re-voices the changed scenes.

**Where the files are:** `space-videos/videos/<name>/renders/`. Everything is saved to GitHub on the session's
branch, so you can download the MP4 from github.com: open the file, then click "Download raw file".

## 5. Handy one-liners

| Want | Say |
|---|---|
| See all my videos | "list my videos" |
| Change the look everywhere | "make the accent color teal across all videos" |
| A horizontal YouTube version | "make a 16:9 version of the Saturn video" |
| Check my ElevenLabs credits | "how many ElevenLabs credits do I have left?" (free to check) |
| Background music | "add quiet music". I'll find something free and properly licensed and tell you the license first |

## 6. Doing this on your own computer instead (optional)

1. Install **Node.js 22+** (nodejs.org, LTS installer) and **FFmpeg**:
   - Mac: `brew install ffmpeg`
   - Windows: `winget install Gyan.FFmpeg`
2. Install **Claude Code**, then clone your repo: `git clone https://github.com/rokai1462-prog/MP4-maker`
3. Open the folder in Claude Code. Everything else (skills, template, tools) is already in the repo.
4. For the voice on your own computer, create a file `space-videos/.env.local` containing
   `ELEVENLABS_API_KEY=<your key>`. That file is git-ignored, so it never goes to GitHub.
   Before running `tools/voiceover.mjs`, set the key in your terminal with `export ELEVENLABS_API_KEY=…` (Mac)
   or `$env:ELEVENLABS_API_KEY="…"` (Windows PowerShell).
5. Live preview on your own computer: `npm run dev` inside a video folder opens it in your browser.

## Rules I follow

- Free by default. ElevenLabs credits are spent only on scripts you approved, after I show you the count. No other paid service without asking.
- Every science fact has a source you can click. Uncertain science is called uncertain.
- Visuals are drawn in code. Real images only from public-domain or properly licensed sources, and I tell you every time I use NASA media.
