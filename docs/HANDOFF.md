# Tapau 财经 automation — handoff (state on 23/11/2026, 18:40 MYT)

Read this first in a new chat, together with the skills `tapau-autopost` and `us-market-recap-video`
and `docs/EPISODE_SPEC.md`.

## Status right now
- **Everything is PAUSED** at Juns's request (he wants to revise something before going live):
  - Scheduled task "Tapau 财经 美股早报 (auto)" (trig_011WQq43s48nh43rcUVGiLjT) — disabled. Cron `CRON_TZ=Asia/Kuala_Lumpur 47 5 * * 2-6`, go-live 08:00 MYT.
  - Scheduled task "Tapau 财经 马股晚报 (auto)" (trig_01Y1MN4sViadPQvWjp6L9Rmd) — disabled. Cron `CRON_TZ=Asia/Kuala_Lumpur 43 17 * * 1-5`, go-live 19:30 MYT. Its prompt still contains a "first-run test on 2026-11-23 → unpublished" line; remove/update it before re-enabling.
  - The 2026-11-23_my test run was cancelled; nothing was posted.
- Ask Juns what he wants to revise before changing anything (he likes to be asked in detail first).

## What works (tested 23/11)
- `daily.yml`: episode.json → build (Azure TTS + alignment + images + encrypted music mix, ~2.5 min) → cover still → stills check → render (~45–50 min) → GitHub Release → Facebook post via Composio MCP (consumer `ck_` key) → cover set as thumbnail (FACEBOOK_SET_VIDEO_THUMBNAIL, verified is_preferred=true).
- Full cloud rebuild of 11/20 (`episodes/2026-11-20_us_auto`) succeeded (run 45135801895, post=none).
- Hidden test post of 11/20 on the Page: video id 1442451321407939, https://www.facebook.com/reel/1442451321407939 (unpublished; Juns couldn't find it in Business Suite — it's filed as a reel). Mp4: release `ep-2026-11-20_us_v9`.

## Open issues to look at
1. The MY scheduled session (first run 23/11) wrote `episodes/2026-11-23_my/episode.json`, dispatched, then changed it to 5 stories and re-dispatched; both runs were cancelled mid-render, apparently by the session itself, and it never re-dispatched. (Story count is now 4–5+, see below.) Fixed 23/11 evening: run rules added to the skill and both task prompts (one dispatch per episode, never cancel a run, no edits after dispatch except one fix after a build failure); `daily.yml` refuses to post if release `ep-<episode>` already exists; new `post: stills` mode renders only the cover + scene stills (~5 min) for visual checks.
2. The 2026-11-23_my episode has not been reviewed visually (MY layout, logos, KL background are untested in the cloud).

## Juns's decisions (interview 23/11)
Cover: date title (11月20日 / 美股早报) on top → big question from the hook (biggest text) → yellow fact line → small glass card with the story's key figure (label 64, number 130, no bars); background = title-frame background; no logo; catchy but factual.
Workflow: auto-publish, no script check; trading days only; US 08:00, MY 19:30; Facebook only; failure → retry once, then skip + alert in the app (push); moomoo ad in both shows until 31/12/2026 (auto-dropped after); 4–5+ stories ~5–6 min (story-selection rules revised 23/11 evening — see `docs/EPISODE_SPEC.md` "Story selection"); prices from Yahoo/Alpha Vantage; caption short + sources + disclaimer + ~5 hashtags; new visual variations allowed; images captured in the cloud.

## Secrets (GitHub repo secrets, never paste values)
AZURE_API_KEY (eastus), COMPOSIO_API_KEY (consumer ck_ key, used at https://connect.composio.dev/mcp), MUSIC_KEY (set by Claude via sealed box; decrypts assets/music/news1.mp3.enc).
Facebook Page Tapau财经 id 1541675575685159; Composio FB account facebook_ketty-ingest; GitHub account github_insist-gascon (Juns1214).
