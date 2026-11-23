# Tapau 财经 — episode.json spec

One file per episode: `episodes/<YYYY-MM-DD>_<us|my>/episode.json`. The daily workflow
(`.github/workflows/daily.yml`) turns it into the video, the 封面 and the Facebook post.
Full worked example: `episodes/2026-11-20_us_auto/episode.json`.

## Story selection (Juns, 23/11/2026 — applies to both shows)
- **Count/length:** 4–5 stories, about 5–6 min, as a guide not a cap — more stories or a longer episode is fine when the news is good.
  Quiet day: still reach at least 4 (smaller companies or sector stories), all today's verified news.
- **"Today":** the trading session plus anything released after the close up to the run (MY ≈17:30, US ≈06:00 MYT) — e.g. results after the bell.
- **Choosing:** most interesting / most useful to ordinary viewers wins. Famous names are preferred when their news is interesting,
  but never forced in, and there is no minimum number of famous-name stories. No minimum price move — a story needs real news.
  - Famous, MY: FBM KLCI 30, household brands (Mr DIY, 99 Speedmart, Capital A …), popular retail-traded stocks, GLC / big-group companies.
  - Famous, US: Magnificent 7 + hot AI/chip names. Consumer brands (McDonald's, Nike, Netflix …) and Asia-linked listings (Grab, Sea, Alibaba ADR) are fine when interesting, but not "famous".
  - News that counts: results & dividends; contracts, deals, M&A, privatisation; disputes & trouble (lawsuits, regulators, Bursa queries, management exits); products & business (launches, expansion, analyst rating changes).
  - Results stories: about 2–3 per episode at most; mix in other news types.
  - IPOs: MY Main, ACE and LEAP — listing-day debuts and upcoming IPOs (prospectus / price / listing date announced today). US: big, well-known IPOs only.
  - A story can cover a sector (several stocks moving on the same news) or a linked pair (both sides of one deal or dispute). Pure macro is not a story (it goes in the market section).
  - Light or quirky stories (IPO debuts, odd moves, unusual announcements) are optional — only when the day has one. The last slot is whatever fits.
- **Exclusions:** small / low-priced / illiquid stocks only when the news is very big (reported by mainstream press, not just a filing or a price jump).
  No repeat of a story from the previous episode of the same show unless there is new official news or another ±5 % or more move with a known reason.
- **Order:** biggest / most interesting story first (it feeds the hook and the cover); `{"ad": true}` always right after story 1.
- **Story structure:**
  - MY results: what the company does → revenue → net profit and YoY → why → dividend (amount, ex-date, payment date, or "none") → price move → caveat / analyst view. Use the full version especially for companies viewers may not know.
  - US results: what the company does → revenue and EPS vs analyst estimates → guidance → why → after-hours / session move → caveat.
  - IPO: what the business does and why it lists → IPO price, amount raised, market cap at IPO price, use of proceeds, oversubscription → debut open, high/low and close vs IPO price (listing day) → key dates (application close, balloting, listing) and a caveat from the prospectus risks.
  - Other news: dated timeline of what happened and how the stock moved.
  - 「我们的观察」 in every story, 2–3 lines: one witty line + 1–2 deeper points (what to watch next, comparison with peers or history). Labelled analysis; never advice or a target price.

## Top level
```json
{
  "show": "us",                      // "us" = 美股早报, "my" = 马股晚报
  "date": "2026-11-24",              // the trading day being reported (US: US date; MY: Bursa date)
  "music": "news1",                  // assets/music/<name>.mp3.enc
  "pill": "24 Nov 2026 · 周一收盘",   // optional; auto-built if missing (US 收盘 / MY 收市)
  "no_ad": false,                    // ad slot drops automatically after assets/ad/*/ad.json "until"
  "scenes": [ ... ],
  "assets": [ ... ],
  "cover": { ... },
  "caption": "..."
}
```

## Scenes (in order)
1. `{"intro": true, "bg": "bg_wallstreet_13801277.jpg"}` (MY: `"my_kl.jpg"`)
2. Title + hook scene: `{"bg": <same>, "brand": false, "pause": {"0": 0.4}, "sents": [[tts, zh, en], ...], "beats": [{"s": 0, "t": "titleu"}, {"s": 1, "t": "hooku", "bg": "<hook image>", ...}]}`
3. Market scenes, stories, (last trading day of the week: week recap + 下周留意), outro.
4. `{"ad": true}` goes right after story 1 (the builder fills it from `assets/ad/`).
5. Outro: `{"outro": true, "bg": "bg_city_36206025.jpg"}` — the builder adds the standard lines.

Normal scene keys: `bg` (image in `remotion/public/img/`), `bar` (top title bar text), `num` ("1", "2", … story number in the bar),
`c` (brand colour hex), `brand` (false hides the corner pill), `pause` ({"sentence index": seconds of silence before it}; 1.0 s between ideas inside a story),
`sents` (one entry per sentence: `[TTS text with numbers in Chinese words, zh subtitle with Arabic numerals, short English subtitle]`),
`beats` (visual changes; `s` = sentence index where the beat starts).

Each TTS sentence must end with 。？！ and must not contain ；. Aim for ~1,600–1,900 Chinese characters (≈5–6 min at 1.2× voice); longer is fine when there are more stories.

## Times inside beats
Any field that wants a time can use `{"$s": k, "f": 0.5, "o": 0.2}` = start of sentence k + 50 % of its length + 0.2 s,
relative to the beat. Plain numbers are seconds after the beat starts.

## Data helpers (resolved in the cloud from Yahoo Finance, up to `date`)
`{"$yahoo": "^GSPC", "kind": "closes", "n": 8}` → list of closes; `"kind": "candles", "labels": "md"|"wd"` → `[[label, o, h, l, c], ...]`;
`"last"`, `"prev"`, `"pct"` → numbers. Symbols: ^GSPC ^IXIC ^DJI ^VIX ^TNX CL=F GC=F BTC-USD, US tickers, Bursa as `5263.KL`, KLCI `^KLSE`.
Always state the same numbers in the narration that the chart shows (verify them first).

## Beat types (all fields optional unless marked *)
| t | use | fields |
|---|---|---|
| titleu | date + show title (auto) | — |
| hooku | 1–2 hook cards | rows*[{label, value, sub, c, img, vc, chipInk}], punch, punchAt, src |
| dashboard | 1–3 index cards | idx*[{name, pct, lvl, prev, vals, note}], at [times for idx 2,3], hi, hiAt, hiText, chips[{text, at}], dec, src |
| vix | VIX gauge | prev*, close*, note, src |
| correction | distance from a record | title, rows*[[label, value], [label, value]], base, pct*, chip, chipAt, dec, src |
| assets | gold / oil / BTC rows | rows*[{en, zh, price, unit, day, wk, img, c, vals}], rv [times], src |
| fed | probability card | chip, label, p*, gt, otherLabel, extra{title, value, note, vals}, caveat, cAt, img, src |
| chipsu | ranked bars | title, rows*[[logo or null, name, text, value]], max, chip, chipAt, img, c, src |
| siteu | company intro | name*, line, logo (AV symbol like "nvda" or file in public/logo), abbr, img (site screenshot), pos, src |
| doc | evidence screenshot, 3 steps | img*, size*[w,h], boxes[[x,y,w,h,t]], zoom[scale,[x,y,w,h]], take[2 lines], takeAt, takeTitle, src — or `"auto": true` + `boxAt` + `zoomTo` to use a screenshot asset with `highlight` |
| priceu | daily candles | title*, sub, d*[[label,o,h,l,c]], rv, ref[value,label], pct[strings], chip, chipAt, chipBg, allClose, open, lowMark, logo, c, dec, small, src |
| bignumv | one big number | v "A"/"B", img, label, text, unit, size, chip, src |
| listv | 2–3 short lines ("我们的观察" / "要注意") | v, img, c, title, lines*, src |
| comparev | two bars | v, img, title, v2*[a,b], lab*, txt*, hi, chip, chipBg, src |
| timeline | dated events | img, title, ev*[[date, text, colour?]], at [times], src |
| quip | one line on screen | text*, sub |
| weeku | week recap bars | rows*[{name, pct, txt, note, img}], max, src |
| calendaru | next-week calendar | month ("NOV"), rows*[{wd, dd, lines[2], img, c, src, icon: bag/dinner/clock/chart/bank/report/flag}], rv, src |
| outrou | outro (auto) | — |

Rules: every data/evidence beat has a `src` chip. Analysis beats use `listv` with title 「我们的观察」 and src 「分析与解读，非新闻事实」.
Red = down, green = up. New visual variations are allowed, but stay inside these types unless a new component has been added to `remotion/src/Root.tsx`.

## Assets (downloaded/captured in the cloud before the voice-over)
```json
{"type": "logo_av", "sym": "NVDA"}                                   // → public/logo/logo_nvda_av.png
{"type": "logo", "url": "https://.../logo.png", "file": "suncon.png"} // → public/logo/
{"type": "url", "url": "https://.../photo.jpg", "file": "x.jpg"}      // → public/img/
{"type": "screenshot", "url": "https://...", "file": "nvda_site.png", "w": 1000, "h": 600}   // site card (2x)
{"type": "screenshot", "url": "https://...", "file": "nv_8k.png", "w": 620, "h": 900, "selector": "article", "highlight": ["exact text 1", "exact text 2"]}  // evidence; boxes found automatically
```
Add `"optional": true` when the image is nice-to-have. Library images already in `remotion/public/img/`: bg_wallstreet_*, bg_market_*, bg_ai_*, bg_chips_*, bg_city_*, bg_cyber_*, gold/oil/crypto/fed/chip/nyse/shopping/thanksgiving pexels, my_* (kl, city, build, cocoa, court, dc, deal, fibre, land, power, savings, solar, store, tower, water).

## Cover (封面)
```json
"cover": {"lines": [{"t": "美股怎么了？", "s": 170}, {"t": "GTA 6 卖爆都救不了", "s": 92, "c": "#FFD23F"}],
          "badge": {"label": "标普 500 本周", "num": "−8.6%", "c": "#FF5A5F"}}
```
Question line = from the day's hook, ~5–7 characters, size 150–170 (fits 1 line at ≤ 900 px). Yellow line = the hook's key fact, size ~90.
Badge = key figure of the story (red #FF5A5F if down, green #3DD68C if up). Background and date title are automatic (same as the title frame).
Catchy but factual; no price predictions.

## Caption
First line = the hook line (becomes the video title). Then the stories as numbered one-liners, sources, the disclaimer
「内容仅为新闻整理，不构成投资建议」 and ~5 hashtags (#美股 #美股早报 #TapauFinance …; MY: #马股 #马股晚报 #Bursa …).
