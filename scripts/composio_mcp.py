"""Minimal client for Composio Connect MCP (https://connect.composio.dev/mcp) using the consumer key (x-consumer-api-key)."""
import json, os, urllib.request

URL = "https://connect.composio.dev/mcp"

class MCP:
    def __init__(self, key):
        self.key = key.strip(); self.sid = None; self.n = 0
    def _post(self, payload, want=True):
        h = {"x-consumer-api-key": self.key, "Content-Type": "application/json", "Accept": "application/json, text/event-stream"}
        if self.sid: h["Mcp-Session-Id"] = self.sid
        req = urllib.request.Request(URL, data=json.dumps(payload).encode(), headers=h, method="POST")
        with urllib.request.urlopen(req, timeout=900) as r:
            self.sid = r.headers.get("Mcp-Session-Id") or self.sid
            body = r.read().decode("utf-8", "replace")
        if not want or not body.strip(): return None
        if body.lstrip().startswith("{"): return json.loads(body)
        msg = None
        for line in body.splitlines():
            if line.startswith("data:"):
                d = line[5:].strip()
                if d:
                    j = json.loads(d)
                    if "result" in j or "error" in j: msg = j
        return msg
    def rpc(self, method, params=None):
        self.n += 1
        out = self._post({"jsonrpc": "2.0", "id": self.n, "method": method, "params": params or {}})
        if out is None: raise RuntimeError(f"no response to {method}")
        if "error" in out: raise RuntimeError(json.dumps(out["error"])[:800])
        return out["result"]
    def start(self):
        self.rpc("initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "tapau-autopost", "version": "1"}})
        self._post({"jsonrpc": "2.0", "method": "notifications/initialized"}, want=False)
        return self
    def call(self, name, args):
        res = self.rpc("tools/call", {"name": name, "arguments": args})
        text = "".join(c.get("text", "") for c in res.get("content", []) if c.get("type") == "text")
        try: return json.loads(text), res.get("isError")
        except Exception: return text, res.get("isError")
    def execute(self, slug, arguments):
        return self.call("COMPOSIO_MULTI_EXECUTE_TOOL", {"tools": [{"tool_slug": slug, "arguments": arguments}], "sync_response_to_workbench": False, "thought": "tapau-autopost GitHub Actions"})

if __name__ == "__main__":
    m = MCP(os.environ["COMPOSIO_API_KEY"]).start()
    tools = m.rpc("tools/list").get("tools", [])
    print("MCP ok, tools:", len(tools))
    out, err = m.execute("FACEBOOK_LIST_MANAGED_PAGES", {"fields": "id,name"})
    s = json.dumps(out, ensure_ascii=False)
    print("pages call error flag:", err, "| page found:", os.environ.get("FB_PAGE_ID", "") in s)
    if os.environ.get("FB_PAGE_ID", "") not in s: raise SystemExit("Page not visible through Composio")
