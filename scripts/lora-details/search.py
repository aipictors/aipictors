import json, sys, time, urllib.request, urllib.parse, os
UA = {"User-Agent": "Mozilla/5.0"}
tok = None
for line in open(os.path.expanduser("~/.config/civitai/token.env")):
    if line.startswith("CIVITAI_API_TOKEN="): tok = line.split("=",1)[1].strip().strip('"')
if tok: UA["Authorization"] = "Bearer " + tok
def get(url):
    for i in range(4):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("fail " + url)
out = {}
for base in ["Illustrious", "SDXL 1.0", "NoobAI", "Pony"]:
    for sort in ["Most Downloaded", "Highest Rated"]:
        url = "https://civitai.com/api/v1/models?" + urllib.parse.urlencode({"types": "LORA", "sort": sort, "period": "AllTime", "baseModels": base, "nsfw": "false", "limit": 100})
        d = get(url)
        for m in d["items"]:
            out.setdefault(m["id"], m)
        print(base, sort, len(d["items"]), file=sys.stderr)
        time.sleep(1)
json.dump(list(out.values()), open(sys.argv[1], "w"), ensure_ascii=False)
print(len(out))
