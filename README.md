# Tapau 财经 · autopost

Automated pipeline for the faceless finance shorts **美股早报** (US) and **马股晚报** (Malaysia) on the Tapau 财经 Facebook Page.

- `remotion/` — Remotion project (scene components in `src/Root.tsx`, shared brand assets in `public/`). Fonts (Alibaba PuHuiTi) are installed from npm at build time.
- `episodes/<episode>/` — per-episode `scenes.json`, `mix.m4a` and images.
- `.github/workflows/render.yml` — renders an episode on GitHub Actions (manual trigger for now).

Secrets (Azure key, Meta Page token) live only in GitHub Actions secrets, never in this repo.

内容仅为新闻整理，不构成投资建议。
