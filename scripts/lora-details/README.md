# 公式 LoRA の紹介（app/lib/lora-details/lora-details.json）の作り方

/models/lora/:name のページに出す紹介・作例の元データ。生成機の公式 LoRA（generator_parameters, type=lora）1 つにつき 1 件。
作業フォルダは ~/Documents/aipictors-lora-1125（data/・thumbs/ はリポジトリに入れない）。

1. `python3 -I search.py data/candidates.json` — Civitai の人気 LoRA（Illustrious・SDXL・NoobAI・Pony）を集める
2. 生成サービスで使えるもの（allowCommercialUse に Rent）だけにし、実在の人物・版権キャラ・画家名の画風・成人向けを外して選ぶ。Aipictors に Pony のモデルは無いので Illustrious・NoobAI（eps）・SDXL 1.0 の版を使う
3. `python3 -I details.py data/details.json <modelId...>` で版・ファイル・全年齢の作例を取り、名前（`_xl`・`_ilxl`・`_noobai` で終わる名前にすると lora-compat が SDXL と判定する）を付けて data/selected.json に
4. `fetch_put.sh <name> <url> <sha256>` で落として sha256 を照合し、RunPod の Volume `stable-diffusion-webui-reForge/models/Lora/<name>.safetensors` に上げる（Pod は 60 秒ごとに読み直すので再起動は要らない）
5. `thumbs.py` で作例を 640px の webp に。版権キャラが写った画像は外し、作例が残らない LoRA は生成機で作る
6. BRIEF.md の決まりで日英の紹介（data/out.json）を書く
7. `uvx --with pillow python -I build.py` で lora-details.json と R2（bucket assets の loras/<name>/<n>.webp）に上げる一覧を作る
8. core D1 の generator_parameters に type='lora', sd=2 で登録する（display_name・description・thumbnail_url・genre・lora_trigger）
