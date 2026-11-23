# Tapau 财经 — episode.json spec

One file per episode: `episodes/<YYYY-MM-DD>_<us|my>/episode.json`. The daily workflow
(`.github/workflows/daily.yml`) turns it into the video, the 封面 and the Facebook post.
Full worked example: `episodes/2026-11-20_us_auto/episode.json`.

## Story selection (Juns, 23/11/2026 — applies to both shows)
- **Count/length:** 4–5 stories, about 5–6 min, as a guide not a cap — more stories or a longer episode is fine when the news is good.
  Quiet day: still reach at least 4 (smaller companies or sector stories), all today's verified news.
- **"Today":** the trading session plus anything released after the close up to the run (MY ≈17:30, US ≈06:00 MYT) — e.g. results after the bell.
  Announcements released after the previous run (e.g. results out on Thursday evening after the 17:30 MY run) belong to the next episode,
  told as "announced → how the stock reacted today".
- **Choosing:** most interesting / most useful to ordinary viewers wins. Famous names are preferred when their news is interesting,
  but never forced in, and there is no minimum number of famous-name stories. No minimum price move — a story needs real news.
  - Famous, MY: FBM KLCI 30, household brands (Mr DIY, 99 Speedmart, Capital A …), popular retail-traded stocks, GLC / big-group companies.
  - Famous, US: Magnificent 7 + hot AI/chip names. Consumer brands (McDonald's, Nike, Netflix …) and Asia-linked listings (Grab, Sea, Alibaba ADR) are fine when interesting, but not "famous".
  - News that counts: results & dividends; contracts, deals, M&A, privatisation; disputes & trouble (lawsuits, regulators, Bursa queries, management exits); products & business (launches, expansion, analyst rating changes).
  - **Diversity first:** mix news types (results, saga/dispute, deal/contract, IPO, consumer). Results stories: about 2–3 per episode;
    on peak results days (late Feb, May, Aug, Nov) 3–4 is fine as long as at least 1–2 stories are not results.
    Don't build the list from one results recap. Every day, search separately for: (1) dramas / sagas / controversies,
    (2) IPOs (debuts, prospectus launches, oversubscription), (3) big famous companies' news of any kind, (4) contracts, deals,
    takeovers, (5) results. Only then choose.
  - **Big ongoing sagas / dramas are a MUST** (e.g. YTL Power–Nvidia–Megaspeed, Zetrix AI sukuk default): always include them
    when there is a new development that day, even if they were in recent episodes and even if it makes the video longer.
    Never drop one to save time.
  - Skip small, quiet stories (e.g. a mid-size developer's 3% profit rise) — they don't earn a slot.
  - **Audience test:** would an ordinary Malaysian viewer care? Small-cap share-price drama with no business story behind it
    (e.g. Mega Fortris sell-off) fails, even when the move is huge.
  - **Less-known companies:** fine when the news is big (e.g. CrowdStrike–Zscaler, Intuit, Gap, Palo Alto), but always explain
    in plain words what the company does / where viewers meet it (TurboTax, Gap clothing stores…). Names almost nobody in
    Malaysia has heard of (e.g. Insmed, Williams-Sonoma) are skipped even with a 15–20% move.
  - A big consumer story's next step (e.g. GTA VI review day → launch day) counts as a new development.
  - US practice (19–20/11): Juns took 5–6 stories per day — saga, mega-IPO, famous AI/chip names, big deals, famous-brand results.
  - **Typical ranking** (Juns's picks, 18–23/11): national/big saga with a new development → famous / household names →
    deals, takeovers, big contracts → IPOs → results from less exciting sectors last.
  - A famous name with solid news can make it 6 stories rather than being dropped.
  - IPOs: MY Main, ACE and LEAP — listing-day debuts and upcoming IPOs (prospectus / price / listing date announced today). US: big, well-known IPOs only.
  - A story can cover a sector (several stocks moving on the same news) or a linked pair (both sides of one deal or dispute). Pure macro is not a story (it goes in the market section).
  - Light or quirky stories (IPO debuts, odd moves, unusual announcements) are optional — only when the day has one. The last slot is whatever fits.
- **Exclusions:** small / low-priced / illiquid stocks only when the news is very big (reported by mainstream press, not just a filing or a price jump).
  No repeat of a story from the previous episode of the same show unless there is new official news or another ±5 % or more move with a known reason
  (ongoing sagas with a new development always qualify).
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

**Tone (Juns, 23/11): more 情绪, medium strength, from the WORDS only** — the voice stays flat as now (per-sentence pitch/speed
was tried and rejected: it sounds like different voices). 1–2 emotional moments per story, matched to the news:
excited for big moves / big news (「哇」「爆了啦」「直接飙」), sympathy for drops (「惨咯」「冤不冤啊」), suspense for sagas
(「重点来了」「剧情越来越精彩」), playful teasing about the situation (「讲真，比连续剧还精彩」). Emotion is about the event,
never about whether to buy or sell, and never mocks investors.

Each TTS sentence must end with 。？！ and must not contain ；. Aim for ~1,600–1,900 Chinese characters (≈5–6 min at 1.2× voice); longer is fine when there are more stories.

## Times inside beats
Any field that wants a time can use `{"$s": k, "f": 0.5, "o": 0.2}` = start of sentence k + 50 % of its length + 0.2 s,
relative to the beat. Plain numbers are seconds after the beat starts.

## Prices: moomoo first (Juns, 23/11)
Fetch closes and daily candles with the moomoo MCP during the run (US: `US.NVDA`; **Malaysia: `BMS.<code>`**, e.g. `BMS.1155`
Maybank, `BMS.5142` Wasco — moomoo DOES support Bursa; realtime quotes are delayed-only, daily K-lines work) and write them
inline, e.g. `"d": [["11/20", o, h, l, c], ...]`. moomoo `quote_ipo_list_my` lists upcoming Bursa IPOs. US after-hours moves:
`quote_history_kline` with `extended_time`. Use the `$yahoo` helper below only as a fallback (and for index sparklines).

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
"cover": {"ds": 125, "lines": [{"t": "美股怎么了？", "s": 170}, {"t": "GTA 6 卖爆都救不了", "s": 100, "c": "#FFD23F"}]}
```
No badge box (Juns, 23/11): date + show name, question line, yellow line only, centred, a bit bigger.
Date/show size `ds` 125. Question line = from the day's hook, ~5–7 characters, size 165–170 (fits 1 line at ≤ 960 px).
Yellow line = the hook's key fact, size ~100 (≤ ~16 chars so it fits one line). Background is automatic.
(`badge` still works if Juns asks for one: {"label", "num", "c"}.)
Catchy but factual; no price predictions.

## Caption
Short and punchy (Juns, 23/11). First line = the hook line (becomes the video title). Then one short title-style line
per story (≈10–20 chars, no explanations), each starting with an emoji that fits the story (e.g. 🔌 chips/data centres,
🏦 banks, 🛢️ oil & gas, 🆕 IPO, ⛽ gas/utilities, 🎮 games, 🛒 retail). No 1️⃣2️⃣3️⃣, no market line, no sources line,
no ad line, no disclaimer line (the video itself carries the disclaimer). End with ~5 hashtags
(#美股 #美股早报 #TapauFinance …; MY: #马股 #马股晚报 #Bursa …). The daily approval message shows this caption preview too.

## Daily text digests (Juns, 23/11)
Two Facebook text posts on the Tapau财经 Page, drafted inside the video runs and approved in the same one reply:
- **马股快报** (in the 马股晚报 run): Malaysian economy & policy (BNM, ringgit, EPF, budget, trade), markets & big companies,
  personal finance (savings, cost of living, property, subsidies).
- **国际快报** (in the 美股早报 run, Juns 23/11): 13–14 items, each 4–6 sentences, in this order:
  🇺🇸 US macro ×0–3, ONLY when there's something important (Fed decision/speech that moves odds, big data release —
  CPI/PCE/jobs/retail sales, a big yields/dollar move); otherwise skip it and give the slots to other news (Juns 23/11) →
  📊 three indexes ×1 (S&P 500 / Nasdaq / Dow closes + main reason + VIX) → 🧩 sectors ×1 (leaders AND laggards
  in one item, why) → 🪙 gold · oil · Bitcoin ×1 (prices, changes, reason for the biggest mover) →
  🏢💻 big companies / tech & AI ×7 (results, deals, AI, big moves incl. after-hours) — BIG, well-known names only
  (Mag 7, mega-caps, chip/AI leaders, brands ordinary Malaysians know; bonus if they have a Malaysia link, e.g. Micron
  in Penang), and only when they had news that day; skip names most readers won't know (Gap, BJ's, Ross…) (Juns 23/11) → 🌏 rest of world /
  🔮 week ahead ×1–2 (China/Asia, Europe/Japan, key dates; only real news). Yields/dollar only as a macro item when they made a big move.
  No big data that day → give the slot to companies; peak earnings day → companies can take 6. Never pad.
- **Overlap with the video is fine** (Juns, 23/11): video stories can appear in the digest too, alongside wider news
  (economy, policy, personal finance / tech).
- 马股快报: 7 items; 国际快报: 13–14 items (above); each 4–6 informative sentences (Juns, 23/11: deeper, but every extra sentence must add something — background, comparison vs last quarter/estimates/usual payout, what's next or what it means for ordinary people; no filler). "What happened / key numbers / context / why it matters" is only a guide, not a fixed template: shape each item to its topic (results → mostly the numbers: revenue, profit, YoY, dividend; policy → what changes and who it affects; deals → who, how much, why; tech/AI → what it is and why it's a big deal) (Juns, 23/11), written entirely in our own words from verified sources (never copy another
  page's sentences or structure). Neutral, no advice/targets; forecasts only when attributed ("瑞银预计…").
- No sponsored items. No posts about party politics as such.
- Format (text only, no image):
```
【Tapau财经｜11/23 马股快报】

🔌 │ AI芯片风波未完
#YTL电力 今天发文澄清，否认把 #Nvidia 芯片转移出去……（三四句）

🏦 │ Maybank净利反升
#Maybank 第三季净利……（三四句）

#Tapau财经 #马股 #马来西亚 #投资 #股票 #Bursa
```
  Header = topic emoji + " │ " + short plain title (no #). Inside the sentences, hashtag 2–3 words per item that
  people actually search/tag, mixed Chinese/English, balanced across company names (#Maybank), topics (#AI #股息 #新股),
  big brands/people/institutions (#Nvidia #美联储) and market words (#令吉 #马股) — not every item the same type
  (Juns, 23/11). No "—" line: one blank line after the last item, then the end tags.
  International version: 【Tapau财经｜11/24 国际快报】, end tags #Tapau财经 #国际财经 #美股 #投资 #股票 #全球经济.
- Posted right after Juns approves (Composio Facebook text post on Page 1541675575685159).
