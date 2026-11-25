import json, re, subprocess, urllib.request, os, sys
d = json.load(open('data/selected.json'))
os.makedirs('thumbs', exist_ok=True)
for x in d:
    n = x['aipictorsName']; out = []
    for i, im in enumerate(x['images'][:4]):
        url = re.sub(r'/(width|original)=[^/]+/', '/width=768/', im['url'])
        raw = f'thumbs/{n}-{i}.src'; webp = f'thumbs/{n}-{i}.webp'
        if not os.path.exists(webp):
            try:
                urllib.request.urlretrieve(url, raw) if False else open(raw, 'wb').write(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read())
                subprocess.run(['cwebp', '-quiet', '-q', '80', '-resize', '640', '0', raw, '-o', webp], check=True)
                os.remove(raw)
            except Exception as e:
                print('fail', n, i, e); continue
        out.append(webp)
    x['localImages'] = out
    print(n, len(out))
json.dump(d, open('data/selected.json', 'w'), ensure_ascii=False, indent=1)
