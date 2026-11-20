# Space Videos — how each video gets made

You give one topic sentence, for example *"Why Saturn's rings are disappearing"*. From there:

| Step | Who | What happens | You see |
|---|---|---|---|
| 1. Start | Claude | `node tools/new-video.mjs 01-saturn-rings "Why Saturn's rings are disappearing"` makes `videos/01-saturn-rings/` from the template | — |
| 2. Research + script | Claude | Writes `script/SCRIPT.md`: the one idea, 6–9 scenes, the narration (about 150 words for 60 s), what's on screen, and a fact-check table with a source link for every claim | **The script, for your notes** ✋ |
| 3. Your notes | You | "Make the hook punchier", "cut scene 4", "is that number right?" Claude revises until you say it's approved | — |
| 4. Voice | Claude | Puts the approved narration in `script/narration.json`, shows the character count (= ElevenLabs credits), then `node tools/voiceover.mjs videos/<name> --go` | The credit count before anything is spent |
| 5. Build | Claude | One scene file per scene in `compositions/`, all drawn in code in the house look; scene lengths, captions and cuts come from the voice timings automatically | — |
| 6. Check + preview | Claude | `check` (errors, safe areas, contrast), snapshots, then the live preview plus a quick draft MP4 | **Preview + draft video, for your notes** ✋ |
| 7. Revisions | You + Claude | Notes on visuals are free. Changing narration only re-voices the scenes whose words changed | — |
| 8. Final render | Claude | `render --quality delivery` → `videos/<name>/renders/<name>.mp4`, plus a description with all sources for you to paste | **The final MP4 + description** |

## House rules

- **Look:** vertical 1080×1920. Deep space + warm gold. Space Mono titles, Inter text, word-by-word gold captions, the cosmic-zoom transition. All of it lives in `brand/`. Change it there, then run `node tools/sync-brand.mjs`.
- **Safe area:** readable text stays inside x 120–888, y 288–1248 (x 120–780 below y 840), clear of the TikTok, Reels and Shorts buttons.
- **Frame 0 is the thumbnail:** the hook's headline and visual are on screen from the first frame.
- **Science:** every claim has a source in the fact-check table, preferring NASA, ESA, JPL, peer-reviewed papers and university pages. Numbers are rounded honestly ("about 300 million years"). Uncertain science is said to be uncertain. A claim that can't be sourced is cut.
- **Media:** drawn in code by default. NASA/ESA images and video only when they show something real better than a drawing would, always listed in "Media used" with the credit line. No AI-generated images or video.
- **Money:** ElevenLabs credits are only spent on approved scripts, after showing the character count. No other paid service without asking.

## Folder map

```
space-videos/
  brand/            the house look (colors, fonts, motion)       ← edit to restyle everything
  template/         the starting point for every new video
  tools/            new-video, voiceover, build-captions, sync-brand
  videos/
    00-test/        the first 15 s test (horizontal)
    01-…/           one folder per video
      script/       BRIEF.md, SCRIPT.md, narration.json, words.json, timing.json
      compositions/ one HTML file per scene + captions
      assets/       voice/, images/, brand/, vendor/
      renders/      the finished MP4s
```
