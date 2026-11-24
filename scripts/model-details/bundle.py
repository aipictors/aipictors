import json, re, os, html
im = {x['id']: x for x in json.load(open('/tmp/im.json'))['data']['imageModels']}
gp = json.load(open('data/gp.json'))[0]['results']
def strip(s, n=3500):
    s = re.sub(r'<br\s*/?>|</p>|</li>|</h\d>', '\n', s or '')
    s = html.unescape(re.sub(r'<[^>]+>', '', s))
    s = re.sub(r'\n{3,}', '\n\n', s).strip()
    return s[:n]
out = []
for g in gp:
    gid = g['id']; i = im.get(str(gid), {})
    b = {'generatorId': gid, 'displayName': g['display_name'], 'file': g['name'], 'isDeleted': g['del'], 'aipictorsType': i.get('type'), 'aipictorsStyle': i.get('style'), 'aipictorsExplanation': i.get('explanation'), 'dbLicense': g['license']}
    c = json.load(open(f'data/civitai/{gid}.json'))
    m = c.get('model') or {}; v = c.get('version') or {}
    if m and '_error' not in m:
        vv = v if '_error' not in v and v else (m.get('modelVersions') or [{}])[0]
        b['civitai'] = {'url': f"https://civitai.com/models/{m['id']}" + (f"?modelVersionId={vv.get('id')}" if vv.get('id') else ''),
            'name': m.get('name'), 'creator': (m.get('creator') or {}).get('username'), 'tags': m.get('tags'), 'nsfw': m.get('nsfw'),
            'allowCommercialUse': m.get('allowCommercialUse'), 'allowDerivatives': m.get('allowDerivatives'),
            'versionName': vv.get('name'), 'baseModel': vv.get('baseModel'), 'publishedAt': (vv.get('publishedAt') or vv.get('createdAt') or '')[:10],
            'trainedWords': vv.get('trainedWords'), 'versionDescription': strip(vv.get('description'), 1500),
            'description': strip(m.get('description'))}
    hp = f'data/hf/{gid}.json'
    if os.path.exists(hp):
        h = json.load(open(hp))
        b['huggingface'] = {'url': f"https://huggingface.co/{h['repo']}", 'license': ((h['info'] or {}).get('cardData') or {}).get('license'), 'readme': (h['readme'] or '')[:5000]}
    out.append(b)
json.dump(out, open('data/bundles.json', 'w'), ensure_ascii=False, indent=1)
for k in range(4):
    json.dump(out[k::4], open(f'data/bundle_{k}.json', 'w'), ensure_ascii=False, indent=1)
print(len(out), sum('civitai' in b for b in out), sum('huggingface' in b for b in out), [os.path.getsize(f'data/bundle_{k}.json') for k in range(4)])
