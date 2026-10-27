# danbooru-tags.tsv

生成画面のタグ候補（プロンプト入力の補助）で使う辞書。

- 元データ: https://github.com/DominikDoom/a1111-sd-webui-tagcomplete `tags/danbooru.csv`（MIT License, Copyright (c) 2022 Dominik Reh）
- 件数 100 以上のタグだけ残し、別名は先頭 3 つまで（`/` で始まる短縮形は除く）
- 1 行 = `タグ名<TAB>件数<TAB>種類<TAB>別名（カンマ区切り）`
- 種類: 0 一般 / 1 絵師 / 3 作品 / 4 キャラクター / 5 メタ
