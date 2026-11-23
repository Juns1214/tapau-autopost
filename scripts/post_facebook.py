"""Post an episode video to the Tapau 财经 Facebook Page through the Composio API.
Env: COMPOSIO_API_KEY (secret), FB_PAGE_ID, VIDEO_URL, EP, MODE (unpublished|publish), optional COMPOSIO_FB_ACCOUNT."""
import json, os, sys, urllib.request

BASE = "https://backend.composio.dev/api/v3"
KEY = os.environ["COMPOSIO_API_KEY"]
EP = os.environ["EP"]; MODE = os.environ.get("MODE", "unpublished")

def call(method, path, body=None):
    req = urllib.request.Request(BASE + path, method=method, headers={"x-api-key": KEY, "Content-Type": "application/json"},
                                 data=json.dumps(body).encode() if body is not None else None)
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.loads(r.read().decode())

if os.path.exists("HOLD") or os.path.exists(f"episodes/{EP}/HOLD"):
    print("HOLD file found - skipping post."); sys.exit(0)

acct = os.environ.get("COMPOSIO_FB_ACCOUNT")
if not acct:
    res = call("GET", "/connected_accounts?toolkit_slugs=facebook&statuses=ACTIVE&limit=10")
    items = res.get("items", [])
    if not items: sys.exit("No active Composio Facebook connection found.")
    acct = items[0]["id"]

cap_path = f"episodes/{EP}/caption.txt"
caption = open(cap_path, encoding="utf-8").read().strip() if os.path.exists(cap_path) else ""
title = caption.splitlines()[0][:100] if caption else EP
args = {"page_id": os.environ["FB_PAGE_ID"], "file_url": os.environ["VIDEO_URL"], "title": title, "description": caption,
        "published": MODE == "publish"}
out = call("POST", "/tools/execute/FACEBOOK_CREATE_VIDEO_POST", {"connected_account_id": acct, "arguments": args})
print(json.dumps({k: out.get(k) for k in ("successful", "error", "data")}, ensure_ascii=False)[:2000])
if not out.get("successful") or (isinstance(out.get("data"), dict) and out["data"].get("unsuccessful")):
    sys.exit("Posting failed.")
