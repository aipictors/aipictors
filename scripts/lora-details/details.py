import json, sys, time, urllib.request, os
UA = {"User-Agent": "Mozilla/5.0"}
for line in open(os.path.expanduser("~/.config/civitai/token.env")):
    if line.startswith("CIVITAI_API_TOKEN="): UA["Authorization"] = "Bearer " + line.split("=",1)[1].strip().strip('"')
def get(url):
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
        except Exception as e: print("retry", url, e, file=sys.stderr); time.sleep(5)
ids = [int(x) for x in sys.argv[2:]]
pref = ["Illustrious", "NoobAI", "SDXL 1.0"]
res = []
for mid in ids:
    m = get(f"https://civitai.com/api/v1/models/{mid}")
    if not m: continue
    vs = [v for v in m["modelVersions"] if v.get("baseModel") in pref and v.get("status","Published") == "Published"]
    if not vs:
        print("SKIP no xl version", mid, m["name"], {v.get("baseModel") for v in m["modelVersions"]}, file=sys.stderr); continue
    vs.sort(key=lambda v: pref.index(v["baseModel"]))  # stable: newest first within base
    v = vs[0]
    f = next((f for f in v["files"] if f.get("primary")), v["files"][0])
    imgs = [i for i in v.get("images", []) if i.get("nsfwLevel", 99) == 1 and i.get("type", "image") == "image"]
    res.append({"modelId": mid, "name": m["name"], "creator": (m.get("creator") or {}).get("username"), "tags": m.get("tags"), "allowCommercialUse": m.get("allowCommercialUse"), "allowNoCredit": m.get("allowNoCredit"), "allowDerivatives": m.get("allowDerivatives"), "description": m.get("description"), "stats": m.get("stats"),
                "versionId": v["id"], "versionName": v["name"], "baseModel": v["baseModel"], "publishedAt": (v.get("publishedAt") or "")[:10], "trainedWords": v.get("trainedWords"), "versionDescription": v.get("description"),
                "file": {"name": f["name"], "sizeKB": f["sizeKB"], "url": f["downloadUrl"], "sha256": (f.get("hashes") or {}).get("SHA256"), "type": f.get("type")},
                "images": [{"url": i["url"], "w": i.get("width"), "h": i.get("height"), "meta": {k: (i.get("meta") or {}).get(k) for k in ("prompt", "negativePrompt", "sampler", "steps", "cfgScale", "Model")} if i.get("meta") else None} for i in imgs[:6]],
                "otherBases": sorted({x.get("baseModel") for x in m["modelVersions"]})})
    print(mid, v["baseModel"], v["name"], f["name"], f["sizeKB"]//1024, "MB", len(imgs), "sfw imgs", file=sys.stderr)
    time.sleep(0.7)
json.dump(res, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
