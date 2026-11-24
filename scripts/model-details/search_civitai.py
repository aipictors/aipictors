import json, sys, time, urllib.request, urllib.parse
for q in sys.argv[1:]:
    url = 'https://civitai.com/api/v1/models?' + urllib.parse.urlencode({'query': q, 'types': 'Checkpoint', 'limit': 5, 'nsfw': 'true'})
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 aipictors-model-pages'})
    try:
        d = json.load(urllib.request.urlopen(req, timeout=30))
        print(q, '=>', [(m['id'], m['name'], m.get('creator', {}).get('username'), [v['name'] for v in m['modelVersions']][:6]) for m in d.get('items', [])])
    except Exception as e:
        print(q, 'ERR', e)
    time.sleep(1)
