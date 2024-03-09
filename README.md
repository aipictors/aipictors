<div align="center">
    <a href="https://beta.aipictors.com">
        <picture>
            <img height=125 alt="Aipictors" src="public/icon.svg">
        </picture>
    </a>
</div>
<p align="center">
    <a href="https://nextjs.org/">Next.js (App Router)</a> / <a href="https://ui.shadcn.com/">shadcn/ui</a> / <a href="https://graphql.org/">GraphQL</a>などで構成されたAipictorsの新しいWebサイト
</p>

# ⚙️ 環境構築

### 1. bunの環境を構築

開発には[**bun**](https://bun.sh/)が必要です。環境に応じてインストールしてください。

```bash
# Linux / macOS / WSL2
curl -fsSL https://bun.sh/install | bash
```

Windowsの場合はこちら。

```powershell
# 動作の確認はしていますが、基本的にはWSL2を推奨します。
powershell -c "irm bun.sh/install.ps1|iex"
```

### 2. エディタを整備する

エディタは、[Visual Studio Code](https://code.visualstudio.com/)を推奨しています。更に[推奨されている拡張機能](.vscode/extensions.json)をインストールしてください。

拡張機能は以下のコマンドでまとめてインストールすることもできます。

```bash
bun run ext
```

コマンド「code」がインストールされいない場合はVSCodeでコマンドパレットを開き以下を実行してください。

```
> Shell Command: Install 'code' command in PATH
```

コマンドパレットは以下のショートカットで開くことができます。

```
shift + command + P
```

再読み込みを要求された場合はVSCodeの再起動を行ってください。
Visual Studio Codeの設定については、[settings.json](.vscode/settings.json)を参照してください。

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

リポジトリ内のREADMEを閲覧する。

README以外にも、[docs](/docs)ディレクトリにドキュメントがあります。

- [Biomeについて](/docs/biome.md)
- [lefthookについて](/docs/lefthook.md)
- [単体テストについて](/docs/testing.md)

# 📣 不具合 / ご意見ご要望

不具合の報告は[こちらから](https://github.com/aipictors/aipictors/issues/new/choose)(GitHubアカウントが必要)。
その他、ご意見ご要望は[Discord](https://discord.gg/aipictors)で受け付けています。

