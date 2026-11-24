# モデルの紹介文（app/lib/model-details/model-details.json）の作り方

/models/:model のページに出す「〇〇について」の元データ。生成機のモデル（generator_parameters, type=model）1 つにつき 1 件。

1. 本番 core D1 から生成機のモデルを書き出す（`gp.json`）
   `npx wrangler d1 execute aipictors-core-staging --remote --json --command "SELECT g.id,g.name,g.display_name,g.sd,g.is_deleted del,g.license FROM generator_parameters g WHERE g.type='model' ORDER BY g.id" > data/gp.json`
2. `imageModels` を GraphQL（https://api.aipictors.com/）から `/tmp/im.json` に保存する
3. `python3 -I fetch_civitai.py data/gp.json data/civitai` — ファイル名の [ハッシュ]（AutoV2）で Civitai のモデルを引く
4. ハッシュで見つからないものは `search_civitai.py <名前>` と Hugging Face の検索で探し、`fetch_extra.py` の対応表に足して実行する
5. `python3 -I bundle.py` で 1 モデルずつの元情報（data/bundle_<K>.json）を作る
6. BRIEF.md の決まりで日本語・英語の紹介を書く（data/out_<K>.json）。出典の内容を自分の言葉でまとめ、元に無いことは書かない。性的な内容は書かない
7. out を generatorId 順にまとめて model-details.json に置く

新しいモデルを足したときは、そのモデルの 1 件だけ同じ形で追記すればよい（無くてもページは出る。紹介が出ないだけ）。
