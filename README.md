<div align="center">
    <a href="https://beta.aipictors.com">
        <picture>
            <img height=125 alt="Aipictors" src="public/icon.svg">
        </picture>
    </a>
</div>
<p align="center">
    <a href="https://remix.run/">Remix</a> / <a href="https://ui.shadcn.com/">shadcn/ui</a> / <a href="https://graphql.org/">GraphQL</a>などで構成されたAipictorsの新しいWebサイト
</p>

# ⚙️ 環境構築

### 1. bun の環境を構築

開発には[**bun**](https://bun.sh/)が必要です。環境に応じてインストールしてください。

```bash
# Linux / macOS / WSL2
curl -fsSL https://bun.sh/install | bash
```

Windows の場合はこちら。

```powershell
powershell -c "irm bun.sh/install.ps1|iex"
# or
winget search --id  Oven-sh.Bun
```

### 2. エディタを整備する

エディタは、[Visual Studio Code](https://code.visualstudio.com/)を推奨しています。更に[推奨されている拡張機能](.vscode/extensions.json)をインストールしてください。

拡張機能は以下のコマンドでまとめてインストールすることもできます。

```bash
bun run init:vscode
```

コマンド「code」がインストールされいない場合は VSCode でコマンドパレットを開き以下を実行してください。

```
> Shell Command: Install 'code' command in PATH
```

コマンドパレットは以下のショートカットで開くことができます。

```
shift + command + P
```

再読み込みを要求された場合は VSCode の再起動を行ってください。
Visual Studio Code の設定については、[settings.json](.vscode/settings.json)を参照してください。

![@recommended](/docs/images//extension.png)

### 3. 開発環境を起動する

1. 依存関係をインストールする

```bash
bun i
```

3. 開発サーバーを起動する。

```bash
bun run dev
```

### 3. アクセスする

[localhost:3000](http://localhost:3000)からアクセスできます。

### 3. コミット前に

下記を実行してビルドエラーが起きないことを確認する。

```bash
bun run check
```

# 📙 ドキュメント

リポジトリ内の README を閲覧する。

README 以外にも、[docs](/docs)ディレクトリにドキュメントがあります。

- [Biome について](/docs/biome.md)
- [lefthook について](/docs/lefthook.md)
- [単体テストについて](/docs/testing.md)

開発で気を付けていることは下記の記事にまとめています。

- [開発で気を付けていること](https://zenn.dev/aipics/articles/a3962af1986502)

# 📣 不具合 / ご意見ご要望

不具合の報告は[こちらから](https://github.com/aipictors/aipictors/issues/new/choose)(GitHub アカウントが必要)。
その他、ご意見ご要望は[Discord](https://discord.gg/aipictors)で受け付けています。
