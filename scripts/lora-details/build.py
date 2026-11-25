import json, os, re
from PIL import Image
sel = {x['aipictorsName']: x for x in json.load(open('data/selected.json'))}
out = json.load(open('data/out.json'))
GEN = {'masterpiece_quality_ilxl': ['thumbs/masterpiece_quality_ilxl-g0.webp', 'thumbs/masterpiece_quality_ilxl-g1.webp'],
       'glossy_eye_detail_ilxl': ['thumbs/glossy_eye_detail_ilxl-g0.webp', 'thumbs/glossy_eye_detail_ilxl-g1.webp']}
details, uploads = [], []
for o in out:
    s = sel[o['name']]
    imgs = GEN.get(o['name']) or s['keptImages']
    def ratio(p):
        w, h = Image.open(p).size; return w / h
    imgs = sorted(imgs, key=lambda p: ratio(p) > 1.3)  # 横長の比較画像は後ろ
    urls = []
    for i, p in enumerate(imgs[:4]):
        key = f"loras/{o['name']}/{i}.webp"
        uploads.append((p, key)); urls.append(f"https://assets.aipictors.com/{key}")
    acu = s['allowCommercialUse']; acu = acu if isinstance(acu, list) else [acu]
    credit = not s.get('allowNoCredit', True)
    lic_ja = "配布元の利用条件に従います（生成サービスでの利用可" + ("・作者のクレジット表記が必要" if credit else "") + "）"
    lic_en = "Per the creator's terms on Civitai (use on generation services allowed" + ("; credit required" if credit else "") + ")"
    d = {"name": o['name'], "source": {"kind": "civitai", "url": f"https://civitai.com/models/{s['modelId']}?modelVersionId={s['versionId']}", "label": "Civitai"},
         "creator": s['creator'], "baseModel": s['baseModel'], "versionName": s['versionName'] or None, "publishedAt": s['publishedAt'] or None,
         "triggerWords": o['triggerWords'], "weight": o['weight'], "images": urls, "imagesByAipictors": o['name'] in GEN,
         "ja": {"displayName": o['displayName'], "description": o['description'], "summary": o['ja']['summary'], "features": o['ja']['features'], "tips": o['ja']['tips'], "license": lic_ja},
         "en": {"displayName": o['en']['displayName'], "description": o['en']['description'], "summary": o['en']['summary'], "features": o['en']['features'], "tips": o['en']['tips'], "license": lic_en},
         "_genre": o['genre'], "_thumb": urls[0] if urls else None}
    details.append(d)
json.dump(details, open('data/lora-details.full.json', 'w'), ensure_ascii=False, indent=1)
json.dump([{k: v for k, v in d.items() if not k.startswith('_')} for d in details], open('data/lora-details.json', 'w'), ensure_ascii=False, indent=2)
open('data/uploads.tsv', 'w').write(''.join(f"{a}\t{b}\n" for a, b in uploads))
print(len(details), len(uploads), [d['name'] for d in details if not d['images']])
