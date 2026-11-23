"""Post an episode video to the Tapau 财经 Facebook Page through Composio Connect MCP.
Env: COMPOSIO_API_KEY (consumer ck_ key), FB_PAGE_ID, VIDEO_URL, EP, MODE (unpublished|publish)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from composio_mcp import MCP

EP = os.environ["EP"]; MODE = os.environ.get("MODE", "unpublished")
if os.path.exists("HOLD") or os.path.exists(f"episodes/{EP}/HOLD"):
    print("HOLD file found - skipping post."); sys.exit(0)
cap_path = f"episodes/{EP}/caption.txt"
caption = open(cap_path, encoding="utf-8").read().strip() if os.path.exists(cap_path) else ""
title = caption.splitlines()[0][:100] if caption else EP
args = {"page_id": os.environ["FB_PAGE_ID"], "file_url": os.environ["VIDEO_URL"], "title": title, "description": caption, "published": MODE == "publish"}
m = MCP(os.environ["COMPOSIO_API_KEY"]).start()
out, err = m.execute("FACEBOOK_CREATE_VIDEO_POST", args)
s = json.dumps(out, ensure_ascii=False)
print(s[:3000])
res = (out.get("data", {}).get("results") or [{}])[0] if isinstance(out, dict) else {}
resp = res.get("response", {}) if isinstance(res, dict) else {}
if err or not (isinstance(out, dict) and out.get("successful")) or not resp.get("successful") or (isinstance(resp.get("data"), dict) and resp["data"].get("unsuccessful")):
    sys.exit("Posting failed.")
data = resp.get("data") or {}
print("Posted:", json.dumps(data, ensure_ascii=False)[:500])

# 封面: upload cover.png as the preferred thumbnail (Composio workbench gives us a file key for it).
vid = str(data.get("id") or data.get("video_id") or "")
cover = os.environ.get("COVER_URL")
if vid and cover and os.path.exists(f"episodes/{EP}/cover.json"):
    code = f"""
import requests, time
p = '/home/user/cover.png'
for i in range(5):
    r = requests.get({cover!r}, timeout=60)
    if r.ok and r.content[:4] == b'\\x89PNG': break
    time.sleep(10)
open(p, 'wb').write(r.content)
up, e1 = upload_local_file(p)
key = (up or {{}}).get('s3key') or (up or {{}}).get('data', {{}}).get('s3key')
res, e2 = run_composio_tool('FACEBOOK_SET_VIDEO_THUMBNAIL', {{'page_id': {os.environ['FB_PAGE_ID']!r}, 'video_id': {vid!r}, 'is_preferred': True, 'source': {{'name': 'cover.png', 'mimetype': 'image/png', 's3key': key}}}})
print('THUMB', bool(key), e1, e2, str(res)[:400])
"""
    out, err = m.call("COMPOSIO_REMOTE_WORKBENCH", {"code_to_execute": code, "thought": "Set the episode cover as the video thumbnail", "current_step": "SET_THUMBNAIL"})
    s = json.dumps(out, ensure_ascii=False)
    print("Thumbnail:", s[:1500])
    if err or "'successful': True" not in s and '"successful": true' not in s:
        print("::warning::Cover thumbnail may not have been set - check the post on Facebook.")
else:
    print("::warning::No video id or cover - thumbnail skipped.")
