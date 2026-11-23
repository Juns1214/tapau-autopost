"""TTS emotion demo: A = current flat delivery, B = per-sentence prosody, C = B + Azure speaking styles (if the voice has them).
Env: AZURE_API_KEY. Writes demo/tts/out/{A,B,C}.mp3 and styles.txt."""
import json, os, subprocess, time, urllib.request

VOICE = "zh-CN-XiaochenNeural"; KEY = os.environ["AZURE_API_KEY"]
BASE = "https://eastus.tts.speech.microsoft.com/cognitiveservices"
D = os.path.dirname(os.path.abspath(__file__)); OUT = f"{D}/out"; TMP = f"{D}/tmp"
os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
sents = json.load(open(f"{D}/script.json", encoding="utf-8"))

PROS = {"neutral": ("+20%", "+0%"), "excited": ("+28%", "+8%"), "sad": ("+12%", "-6%"),
        "suspense": ("+14%", "-3%"), "tease": ("+22%", "+4%")}
PREF = {"excited": ["excited", "cheerful", "advertisement_upbeat", "livecommercial"],
        "sad": ["sad", "depressed", "empathetic", "gentle"],
        "suspense": ["serious", "calm", "narration-relaxed", "chat"],
        "tease": ["cheerful", "chat", "friendly", "affectionate"], "neutral": []}

req = urllib.request.Request(f"{BASE}/voices/list", headers={"Ocp-Apim-Subscription-Key": KEY})
voices = json.load(urllib.request.urlopen(req, timeout=60))
styles = next((v.get("StyleList", []) for v in voices if v["ShortName"] == VOICE), [])
pick = {m: next((s for s in p if s in styles), None) for m, p in PREF.items()}
open(f"{OUT}/styles.txt", "w").write(f"{VOICE} styles: {styles}\nused in C: {pick}\n")
print(open(f"{OUT}/styles.txt").read())

def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
def synth(body, path):
    ssml = ('<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" '
            f'xml:lang="zh-CN"><voice name="{VOICE}">{body}</voice></speak>')
    r = urllib.request.Request(f"{BASE}/v1", data=ssml.encode("utf-8"), method="POST", headers={
        "Ocp-Apim-Subscription-Key": KEY, "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm", "User-Agent": "tapau"})
    for i in range(4):
        try:
            data = urllib.request.urlopen(r, timeout=120).read()
            if len(data) < 2000: raise RuntimeError("short audio")
            open(path, "wb").write(data); return
        except Exception as e:
            if i == 3: raise
            time.sleep(2 + 3 * i)

def body(v, mood, text):
    rate, pitch = PROS[mood] if v in "BC" else ("+20%", "+0%")
    pre = '<break time="300ms"/>' if v in "BC" and mood == "suspense" else ""
    inner = f'{pre}<prosody rate="{rate}" pitch="{pitch}">{esc(text)}</prosody>'
    if v == "C" and pick.get(mood):
        inner = f'<mstts:express-as style="{pick[mood]}" styledegree="1.3">{inner}</mstts:express-as>'
    return inner

subprocess.run(f"ffmpeg -loglevel error -y -f lavfi -i anullsrc=r=24000:cl=mono -t 0.25 {TMP}/gap.wav", shell=True, check=True)
for v in "ABC":
    parts = []
    for j, (mood, text) in enumerate(sents):
        p = f"{TMP}/{v}{j}.wav"; synth(body(v, mood, text), p); parts += [p, f"{TMP}/gap.wav"]; time.sleep(0.3)
    lst = f"{TMP}/{v}.txt"; open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    subprocess.run(f"ffmpeg -loglevel error -y -f concat -safe 0 -i {lst} -af loudnorm=I=-16:TP=-1.5 -c:a libmp3lame -q:a 3 {OUT}/{v}.mp3",
                   shell=True, check=True)
    print("wrote", v)
