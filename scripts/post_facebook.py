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
print("Posted:", json.dumps(resp.get("data"), ensure_ascii=False)[:500])
