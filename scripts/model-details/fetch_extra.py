import json, time, urllib.request, os
def get(url, raw=False):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 aipictors-model-pages'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            b = r.read()
            return b.decode('utf-8', 'replace') if raw else json.loads(b)
    except Exception as e:
        return None if raw else {'_error': str(e)}
civ = {704: 399873, 730: 2168935, 733: 3005406, 734: 3016339}
hf = {2: 'zzzAI19/ChromaFT', 646: 'zzzAI19/ChromaFT', 690: 'zzzAI19/ChromaFT', 14: 'sazyou-roukaku/BracingEvoMix',
      12: 'sazyou-roukaku/chilled_remix', 3: 'Lasorco/lametta', 702: 'Kotajiro/fuduki_mix', 675: 'nondesuno/LimeREmix_MOJITO',
      653: 'JosefJilek/loliDiffusion', 654: 'JosefJilek/loliDiffusion', 655: 'JosefJilek/loliDiffusion',
      730: 'Tongyi-MAI/Z-Image-Turbo', 733: 'OpenMOSS-Team/MOSS-Image', 706: 'black-forest-labs/FLUX.1-schnell', 691: 'zzzAI19/ChromaXL'}
for gid, mid in civ.items():
    p = f'data/civitai/{gid}.json'; d = json.load(open(p))
    d['model'] = get(f'https://civitai.com/api/v1/models/{mid}'); json.dump(d, open(p, 'w'), ensure_ascii=False)
    print(gid, d['model'].get('name', d['model'].get('_error'))); time.sleep(1)
os.makedirs('data/hf', exist_ok=True)
for gid, rid in hf.items():
    info = get(f'https://huggingface.co/api/models/{rid}')
    readme = get(f'https://huggingface.co/{rid}/raw/main/README.md', raw=True)
    json.dump({'repo': rid, 'info': {k: info.get(k) for k in ('id','author','tags','cardData','downloads','likes','createdAt','lastModified','_error')}, 'readme': readme}, open(f'data/hf/{gid}.json', 'w'), ensure_ascii=False)
    print(gid, rid, info.get('_error') or 'ok', len(readme or ''))
    time.sleep(0.5)
