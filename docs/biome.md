# Biome

このリポジトリはBiomeを使用しています。

https://biomejs.dev/

VSCodeで開発する場合はこちらの拡張機能をインストールしてください。

https://marketplace.visualstudio.com/items?itemName=biomejs.biome


## CLI

こちらのコマンドで全てのファイルを整形します。

```ts
$ npm run refactor
```

設定は[こちら](../biome.json)のファイルに記載されます。

# Import文のソート

Import文は自動的にソートされます。

```
import a from "a"
import b from "b"
```

スタイルなど読み込み順を保証したい場合は、Import文の間に空行を入れてください。

```
import b from "b"

import a from "a"
```
