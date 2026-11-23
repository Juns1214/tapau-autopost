"""Tapau 财经 cloud episode builder.

episodes/<ep>/episode.json  ->  remotion/src/{scenes.json, meta.json}, remotion/public/{mix.m4a, img/*, logo/*}, build/{cover.json, caption.txt}

Steps: data helpers ($yahoo) -> assets (download / logo / screenshot + auto highlight boxes) -> Azure TTS per scene
(full take + per-sentence takes for durations) -> sentence alignment -> pauses -> scenes.json -> ducked music mix.
Env: AZURE_API_KEY, MUSIC_KEY, EP (episode folder name). Run from the repo root.
"""
import datetime, hashlib, json, os, re, subprocess, sys, time, urllib.parse, urllib.request, wave
import numpy as np

ROOT = os.getcwd(); EP = os.environ["EP"]; EPD = f"{ROOT}/episodes/{EP}"
REM = f"{ROOT}/remotion"; PUB = f"{REM}/public"; OUT = f"{ROOT}/build"; CACHE = f"{OUT}/tts_cache"
VOICE = "zh-CN-XiaochenNeural"; RATE = "+20%"; SR = 24000
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36"}
SHOWS = {"us": "美股早报", "my": "马股晚报"}
os.makedirs(OUT, exist_ok=True); os.makedirs(CACHE, exist_ok=True)

def log(*a): print("[build]", *a, flush=True)
def sh(cmd): subprocess.run(cmd, shell=True, check=True)
def dur(w): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", w]))

# ---------------------------------------------------------------- data helpers
_yc = {}
def yahoo(sym, rng="3mo"):
    if (sym, rng) in _yc: return _yc[(sym, rng)]
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(sym)}?range={rng}&interval=1d"
    for i in range(3):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30)); break
        except Exception as e:
            if i == 2: raise
            time.sleep(3)
    r = j["chart"]["result"][0]; q = r["indicators"]["quote"][0]; tz = r["meta"].get("gmtoffset", 0)
    rows = []
    for k, ts in enumerate(r["timestamp"]):
        o, h, l, c = q["open"][k], q["high"][k], q["low"][k], q["close"][k]
        if None in (o, h, l, c): continue
        d = datetime.datetime.utcfromtimestamp(ts + tz).date(); rows.append((d, o, h, l, c))
    _yc[(sym, rng)] = rows; return rows

WD = "一二三四五六日"
def lab(d, how):
    if how == "wd": return f"周{WD[d.weekday()]} {d.month}/{d.day}"
    return f"{d.month}/{d.day}"

def resolve_data(v, end=None):
    """{"$yahoo": "^GSPC", "kind": "closes"|"candles"|"last"|"prev", "n": 8, "labels": "md"|"wd", "dec": 2}"""
    if isinstance(v, dict) and "$yahoo" in v:
        rows = yahoo(v["$yahoo"], v.get("range", "3mo"))
        if end: rows = [r for r in rows if r[0] <= end]
        n = v.get("n", 8); dec = v.get("dec", 2); rows_n = rows[-n:]
        kind = v.get("kind", "closes")
        if kind == "closes": return [round(r[4], dec) for r in rows_n]
        if kind == "candles": return [[lab(r[0], v.get("labels", "md"))] + [round(x, dec) for x in r[1:]] for r in rows_n]
        if kind == "last": return round(rows[-1][4], dec)
        if kind == "prev": return round(rows[-2][4], dec)
        if kind == "pct": return round((rows[-1][4] / rows[-2][4] - 1) * 100, 2)
        raise ValueError(kind)
    if isinstance(v, list): return [resolve_data(x, end) for x in v]
    if isinstance(v, dict): return {a: resolve_data(b, end) for a, b in v.items()}
    return v

# ---------------------------------------------------------------- assets
HIDE = """[id*=cookie],[class*=cookie],[id*=consent],[class*=consent],#onetrust-banner-sdk,#onetrust-consent-sdk,.osano-cm-window,
[class*=newsletter],[class*=Newsletter],[id*=CybotCookiebot],[aria-label*=cookie i]{display:none!important}"""
ASSET_META = {}

def fetch(url, dest):
    for i in range(3):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
            if len(data) < 200: raise RuntimeError("tiny file")
            open(dest, "wb").write(data); return
        except Exception as e:
            if i == 2: raise RuntimeError(f"download failed {url}: {e}")
            time.sleep(3)

def screenshots(items):
    if not items: return
    from playwright.sync_api import sync_playwright
    chrome = subprocess.run("which google-chrome || which chromium || true", shell=True, capture_output=True, text=True).stdout.strip()
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=chrome or None, args=["--no-sandbox"])
        for a in items:
            dest = f"{PUB}/img/{a['file']}"; w, h, dpr = a.get("w", 1000), a.get("h", 600), a.get("dpr", 2)
            ok = False
            for attempt in range(2):
                try:
                    ctx = br.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr, user_agent=UA["User-Agent"], locale="en-US")
                    pg = ctx.new_page(); pg.goto(a["url"], wait_until="domcontentloaded", timeout=60000)
                    pg.wait_for_timeout(a.get("wait", 4000)); pg.add_style_tag(content=HIDE + a.get("css", ""))
                    if a.get("scroll"): pg.evaluate(f"window.scrollTo(0,{a['scroll']})"); pg.wait_for_timeout(800)
                    clip = None
                    if a.get("selector"):
                        bb = pg.locator(a["selector"]).first.bounding_box(); clip = {"x": bb["x"], "y": bb["y"], "width": bb["width"], "height": bb["height"]}
                    elif a.get("clip"): x, y, cw, ch = a["clip"]; clip = {"x": x, "y": y, "width": cw, "height": ch}
                    boxes = []
                    for txt in a.get("highlight", []):
                        loc = pg.get_by_text(txt, exact=False).first; loc.scroll_into_view_if_needed(timeout=5000) if not clip else None
                        bb = loc.bounding_box()
                        if not bb: raise RuntimeError(f"highlight text not found: {txt}")
                        ox, oy = (clip["x"], clip["y"]) if clip else (0, pg.evaluate("window.scrollY") * 0)
                        boxes.append([round((bb["x"] - ox - 6) * dpr), round((bb["y"] - oy - 4) * dpr), round((bb["width"] + 12) * dpr), round((bb["height"] + 8) * dpr)])
                    pg.screenshot(path=dest, clip=clip, full_page=False, type="png")
                    from PIL import Image
                    im = Image.open(dest); ASSET_META[a["file"]] = {"size": list(im.size), "boxes": boxes}
                    ctx.close(); ok = True; break
                except Exception as e:
                    log("screenshot retry", a["url"], e)
                    try: ctx.close()
                    except Exception: pass
            if not ok:
                if a.get("optional"): log("screenshot skipped (optional)", a["file"]); continue
                raise RuntimeError(f"screenshot failed: {a['url']}")
        br.close()

def assets(spec):
    shots = []
    for a in spec.get("assets", []):
        t = a.get("type", "url")
        if t == "logo_av":
            sym = a["sym"]; fetch(f"https://cdn.alphavantage.co/logos/{sym.upper()}.png", f"{PUB}/logo/logo_{sym.lower()}_av.png")
        elif t == "logo":
            fetch(a["url"], f"{PUB}/logo/{a['file']}")
        elif t == "url":
            fetch(a["url"], f"{PUB}/img/{a['file']}")
        elif t == "screenshot":
            shots.append(a)
    screenshots(shots)
    # copy episode-supplied images
    if os.path.isdir(f"{EPD}/img"): sh(f"cp -r '{EPD}/img/.' '{PUB}/img/'")

def apply_doc_meta(b):
    """doc beat with "auto": true takes size + boxes from the screenshot; "boxAt" gives the times."""
    if b.get("t") == "doc" and b.get("auto") and b.get("img") in ASSET_META:
        m = ASSET_META[b["img"]]; b["size"] = m["size"]; at = b.get("boxAt", [0.6 + 0.7 * i for i in range(len(m["boxes"]))])
        b["boxes"] = [bx + [at[i] if i < len(at) else at[-1]] for i, bx in enumerate(m["boxes"])]
        if "zoomTo" in b and m["boxes"]:  # zoom around a highlighted box
            x, y, w, h = m["boxes"][b["zoomTo"]]; W0, H0 = m["size"]; pad = 0.25
            zx, zy = max(0, x - w * pad), max(0, y - h * 2); zw = min(W0 - zx, w * (1 + 2 * pad)); zh = min(H0 - zy, h * 5)
            b["zoom"] = [b.get("zoomScale", 1.8), [round(zx), round(zy), round(zw), round(zh)]]
    return b

# ---------------------------------------------------------------- TTS
def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
def ssml(body): return f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN"><voice name="{VOICE}">{body}</voice></speak>'
def tts(text, path, rate=RATE):
    body = f'<prosody rate="{rate}">{esc(text)}</prosody>'; key = hashlib.md5((VOICE + body).encode()).hexdigest()
    cp = f"{CACHE}/{key}.wav"
    if not os.path.exists(cp):
        req = urllib.request.Request(f"https://eastus.tts.speech.microsoft.com/cognitiveservices/v1", data=ssml(body).encode("utf-8"), method="POST",
            headers={"Ocp-Apim-Subscription-Key": os.environ["AZURE_API_KEY"], "Content-Type": "application/ssml+xml",
                     "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm", "User-Agent": "tapau"})
        for i in range(4):
            try:
                data = urllib.request.urlopen(req, timeout=120).read()
                if len(data) < 2000: raise RuntimeError("short audio")
                open(cp, "wb").write(data); break
            except Exception as e:
                if i == 3: raise RuntimeError(f"Azure TTS failed: {e}")
                time.sleep(2 + 3 * i)
        time.sleep(0.3)
    sh(f"cp {cp} {path}"); return path

def rd(p):
    w = wave.open(p); return np.frombuffer(w.readframes(w.getnframes()), np.int16).copy()
def wr(p, x, sr=SR):
    w = wave.open(p, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(x.astype(np.int16).tobytes()); w.close()
def speech_len(p):
    x = rd(p); idx = np.nonzero(np.abs(x) > 300)[0]; return (idx[-1] - idx[0]) / SR if len(idx) else len(x) / SR

def silences(w):
    o = subprocess.run(["ffmpeg", "-i", w, "-af", "silencedetect=n=-40dB:d=0.12", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", o)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", o)]
    return list(zip(st, en))

def align_wd(w, d):
    """Sentence start times in a full take, from per-sentence durations d (DP over silence onsets)."""
    n = len(d); L = dur(w); sil = silences(w)
    first = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
    last = sil[-1][0] if sil and abs(sil[-1][1] - L) < 0.05 else L
    if n == 1: return [first], L
    onsets = [e for s, e in sil if first + 0.3 < e < last - 0.3]; gaps = {e: e - s for s, e in sil}
    g = 0.35; s = (last - first - (n - 1) * g) / sum(d)
    exp = [first]
    for k in range(1, n): exp.append(exp[-1] + d[k - 1] * s + g)
    m = len(onsets); INF = 1e9
    if m < n - 1:  # not enough pauses found: fall back to proportional estimate
        log("align fallback (few pauses)", w); return exp, L
    cost = [[INF] * m for _ in range(n)]; back = [[-1] * m for _ in range(n)]
    for c in range(m): cost[1][c] = (onsets[c] - exp[1]) ** 2 - 0.05 * gaps[onsets[c]]
    for j in range(2, n):
        for c in range(m):
            best, bi = INF, -1
            for p in range(c):
                if onsets[c] - onsets[p] < 0.6: continue
                if cost[j - 1][p] < best: best, bi = cost[j - 1][p], p
            if bi >= 0: cost[j][c] = best + (onsets[c] - exp[j]) ** 2 - 0.05 * gaps[onsets[c]]; back[j][c] = bi
    c = min(range(m), key=lambda x: cost[n - 1][x])
    if cost[n - 1][c] >= INF: log("align fallback (DP)", w); return exp, L
    T = [0] * n
    for j in range(n - 1, 0, -1): T[j] = onsets[c]; c = back[j][c]
    T[0] = first
    return T, L

def resolve(v, st, Td, ends):
    if isinstance(v, dict) and "$s" in v:
        k = v["$s"]; return round(Td[k] + v.get("f", 0) * (ends[k] - Td[k]) - st + v.get("o", 0), 3)
    if isinstance(v, list): return [resolve(x, st, Td, ends) for x in v]
    if isinstance(v, dict): return {a: resolve(b, st, Td, ends) for a, b in v.items()}
    return v

# ---------------------------------------------------------------- main
def main():
    spec = json.load(open(f"{EPD}/episode.json", encoding="utf-8"))
    show = spec["show"]; date = datetime.date.fromisoformat(spec["date"]); SHOW = SHOWS[show]
    meta = {"show": SHOW, "d1": f"{date.month}月{date.day}日", "short": f"{date.month}/{date.day}",
            "pill": spec.get("pill") or f"{date.day} {date.strftime('%b')} {date.year} · 周{WD[date.weekday()]}{'收盘' if show == 'us' else '收市'}"}
    json.dump(meta, open(f"{REM}/src/meta.json", "w", encoding="utf-8"), ensure_ascii=False)
    spec = resolve_data(spec, end=date)
    assets(spec)

    # ad slot rule
    ad = json.load(open(f"{ROOT}/assets/ad/moomoo_2026-11/ad.json", encoding="utf-8"))
    use_ad = date <= datetime.date.fromisoformat(ad["until"]) and not spec.get("no_ad")
    scenes_in = [s for s in spec["scenes"] if use_ad or not s.get("ad")]

    wh = f"{ROOT}/assets/sfx/whoosh.wav"; SFX = f"{ROOT}/assets/sfx/"; V = f"{OUT}/voice/"; os.makedirs(V, exist_ok=True)
    scenes, parts = [], []
    for i, sc in enumerate(scenes_in):
        if sc.get("intro"):
            aw = f"{V}intro.wav"; d = 2.1
            sh(f"ffmpeg -y -loglevel error -f lavfi -t {d} -i anullsrc=r=44100:cl=stereo -i {wh} -i {SFX}ding.wav -filter_complex \"[1:a]volume=0.6[w];[2:a]adelay=300|300,volume=0.5[g];[0:a][w][g]amix=inputs=3:duration=first:normalize=0\" -ac 2 {aw}")
            fr = int(round(d * 30)); scenes.append({"bg": sc["bg"], "brand": False, "frames": fr, "T": [0], "subs": [["", ""]], "beats": [{"t": "brandintro", "s": 0, "at0": 0}]})
            pw = f"{V}introp.wav"; sh(f"ffmpeg -y -loglevel error -i {aw} -af apad -t {fr / 30:.4f} -ar 44100 -ac 2 {pw}"); parts.append(pw); continue
        if sc.get("ad"):
            sc = {**ad["scene"], **{k: v for k, v in sc.items() if k != "ad"}, "ad": True}
            WAV = f"{ROOT}/assets/ad/moomoo_2026-11/{ad['wav']}"; T, L = align_wd(WAV, ad["durs"]); SUBS = ad["subs"]
        else:
            if sc.get("outro") and not sc.get("sents"):
                sc["sents"] = [[f"以上就是今天的{SHOW}，内容只是新闻整理，不构成投资建议。", f"以上是今天的{SHOW}，内容仅为新闻整理，不构成投资建议", "News summary only, not investment advice"],
                               ["觉得有用就关注我们，我们下个交易日见啦。", "觉得有用就关注我们，下个交易日见啦", "Follow us. See you next trading day"]]
                sc.setdefault("beats", [{"s": 0, "t": "outrou"}]); sc["brand"] = False
            sents = sc["sents"]; full = "".join(s[0] for s in sents).replace("；", "，")
            WAV = tts(full, f"{V}{i:02d}.wav")
            d = [speech_len(tts(s[0].replace("；", "，"), f"{V}{i:02d}_{j}.wav")) for j, s in enumerate(sents)]
            T, L = align_wd(WAV, d); SUBS = [[s[1], s[2]] for s in sents]
        n = len(T); x = rd(WAV); pz = {int(k): v for k, v in sc.get("pause", {}).items()}
        cut = [int(round(t * SR)) for t in T] + [len(x)]
        segs, Tn, acc = [], [], 0.0
        for j in range(n + 1):
            p = pz.get(j, 0.0)
            if j < n:
                a, b = (0 if j == 0 else cut[j]), cut[j + 1]
                if p: segs.append(np.zeros(int(p * SR), np.int16)); acc += p
                Tn.append(T[j] + acc); segs.append(x[a:b])
            elif p: segs.append(np.zeros(int(p * SR), np.int16)); acc += p
        raw = f"{V}{i:02d}r.wav"; wr(raw, np.concatenate(segs)); aw = f"{V}{i:02d}s.wav"
        first_voice = not any(s.get("sents") for s in scenes_in[:i])
        sh(f"ffmpeg -y -loglevel error -i {raw} -i {wh} -filter_complex \"[0:a]aresample=44100,pan=stereo|c0=c0|c1=c0,adelay=150|150,apad=pad_dur=0.35[v];[1:a]volume={0 if first_voice else 0.6}[w];[v][w]amix=inputs=2:duration=first:normalize=0\" {aw}")
        if sc.get("outro"):
            tap = Tn[1] + 0.15 + 0.9; aw2 = f"{V}{i:02d}o.wav"
            sh(f"ffmpeg -y -loglevel error -i {aw} -i {SFX}click.wav -i {SFX}ding.wav -filter_complex \"[1:a]adelay={int(tap*1000)}|{int(tap*1000)}[c];[2:a]adelay={int((tap+0.15)*1000)}|{int((tap+0.15)*1000)},volume=0.6[g];[0:a][c][g]amix=inputs=3:duration=longest:normalize=0,apad=pad_dur=1.0\" {aw2}")
            aw = aw2
        d = dur(aw); fr = int(round(d * 30))
        Td = [t + 0.15 for t in Tn]; ends = [Td[j + 1] - pz.get(j + 1, 0) for j in range(n - 1)] + [d - 0.35]
        beats = []
        for bt in sc["beats"]:
            b = apply_doc_meta(dict(bt)); st = Td[b["s"]] if not (b["s"] == 0 and pz.get(0)) else 0.0
            b = resolve(b, st, Td, ends); b["at0"] = round(st, 3); beats.append(b)
        out = {k: v for k, v in sc.items() if k not in ("beats", "pause", "sents")}
        out.update(frames=fr, T=[round(t, 3) for t in Td], subs=SUBS, beats=beats)
        scenes.append(out); log(i, round(d, 2), [round(t, 1) for t in Td])
        pw = f"{V}{i:02d}p.wav"; sh(f"ffmpeg -y -loglevel error -i {aw} -af apad -t {fr / 30:.4f} -ar 44100 -ac 2 {pw}"); parts.append(pw)

    json.dump(scenes, open(f"{REM}/src/scenes.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(f"{V}list.txt", "w").write("".join(f"file '{p}'\n" for p in parts))
    sh(f"ffmpeg -y -loglevel error -f concat -safe 0 -i {V}list.txt -c:a pcm_s16le {OUT}/voice.wav")
    total = sum(s["frames"] for s in scenes) / 30
    music = f"{OUT}/music.mp3"
    sh(f"openssl enc -d -aes-256-cbc -pbkdf2 -in {ROOT}/assets/music/{spec.get('music', 'news1')}.mp3.enc -out {music} -pass env:MUSIC_KEY")
    sh(f"ffmpeg -y -loglevel error -i {OUT}/voice.wav -stream_loop -1 -i {music} -filter_complex \"[0:a]asplit=2[v][sc];[1:a]aresample=44100,volume=0.068,afade=t=in:d=0.5,afade=t=out:st={total - 2.5}:d=2.5[m];[m][sc]sidechaincompress=threshold=0.022:ratio=3.5:attack=15:release=500[md];[v][md]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-15:TP=-1.5[a]\" -map '[a]' -ar 44100 -ac 2 {OUT}/mix.wav")
    sh(f"ffmpeg -y -loglevel error -i {OUT}/mix.wav -c:a aac -b:a 192k {PUB}/mix.m4a")
    os.remove(music)

    # cover + caption
    cover = dict(spec["cover"]); cover.setdefault("bg", scenes_in[1].get("bg") if len(scenes_in) > 1 else "bg_wallstreet_13801277.jpg")
    cover.setdefault("d1", meta["d1"]); cover.setdefault("d2", SHOW); cover.setdefault("dark", 0.5)
    cover.setdefault("badge", {}); cover["badge"].setdefault("style", "glass")
    json.dump(cover, open(f"{OUT}/cover.json", "w", encoding="utf-8"), ensure_ascii=False)
    open(f"{OUT}/caption.txt", "w", encoding="utf-8").write(spec["caption"].strip() + "\n")
    check_files(scenes, cover)
    log("total seconds", round(total, 1))
    open(f"{OUT}/summary.json", "w").write(json.dumps({"seconds": round(total, 1), "scenes": len(scenes), "ad": use_ad}))

IMG_KEYS = ("bg", "img", "takeImg")
def check_files(scenes, cover):
    missing = set()
    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k in IMG_KEYS and isinstance(v, str) and v and not os.path.exists(f"{PUB}/img/{v}"): missing.add(v)
                if k == "logo" and isinstance(v, str) and v:
                    f = v if "." in v else f"logo_{v}_av.png"
                    if not os.path.exists(f"{PUB}/logo/{f}"): missing.add("logo/" + f)
                walk(v)
        elif isinstance(o, list):
            for x in o: walk(x)
    walk(scenes); walk(cover)
    for row in (cover.get("lines") or []): pass
    if missing: raise SystemExit(f"Missing image files: {sorted(missing)}")

if __name__ == "__main__":
    main()
