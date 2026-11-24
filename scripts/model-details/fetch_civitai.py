import json, re, sys, time, urllib.request, os
out = sys.argv[2]
rows = json.load(open(sys.argv[1]))[0]['results']
os.makedirs(out, exist_ok=True)
def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 aipictors-model-pages'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except Exception as e:
        return {'_error': str(e)}
for x in rows:
    m = re.search(r'\[([0-9a-f]{10})\]', x['name'])
    path = f"{out}/{x['id']}.json"
    if os.path.exists(path): continue
    res = {'gp': x}
    if m:
        v = get(f"https://civitai.com/api/v1/model-versions/by-hash/{m.group(1)}")
        res['version'] = v
        if 'modelId' in v:
            time.sleep(0.7)
            res['model'] = get(f"https://civitai.com/api/v1/models/{v['modelId']}")
    json.dump(res, open(path, 'w'), ensure_ascii=False)
    print(x['id'], x['display_name'], 'ok' if 'model' in res else ('nohash' if not m else res.get('version',{}).get('_error','?')), flush=True)
    time.sleep(0.7)
