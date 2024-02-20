<div align="center">
    <a href="https://beta.aipictors.com">
        <picture>
            <img height=125 alt="Aipictors" src="public/icon.svg">
        </picture>
    </a>
</div>
<p align="center">
    Aipictors Nextは<a href="https://nextjs.org/">Next.js(App Router)</a> / <a href="https://ui.shadcn.com/">shadcn/ui</a> / <a href="https://graphql.org/">GraphQL</a>などで構成/開発されている、次世代のAipictorsです。
</p>

## ⚙️環境構築

### 1. bunの環境を構築

[**bun**](https://bun.sh/)が必要です。  
環境に応じてインストールしてください。  

```bash
# Linux / macOS / WSL2
curl -fsSL https://bun.sh/install | bash
```
```powershell
# Windows
# 動作の確認はしていますが、基本的にはWSL2を推奨します。
powershell -c "irm bun.sh/install.ps1|iex"
```

### 2. エディタを整備する

エディタは、[Visual Studio Code](https://code.visualstudio.com/)を推奨しています。  

[推奨されている拡張機能](.vscode/extensions.json)をインストールしてください。  
再読み込みを要求された場合はVSCodeの再起動を行ってください。  
Visual Studio Codeの設定については、[settings.json](.vscode/settings.json)を参照してください。  

![@recommended](/docs/images//extension.png)

### 3. 開発環境を起動する
1. 依存関係をインストールする

```bash
bun i
```

2. GraphQLのコードをビルドする。

```bash
bun run predev
```

3. 開発サーバーを起動する。

```bash
bun run dev
```

### 3. アクセスする
[localhost:3000](http://localhost:3000)からアクセスできます。  


## 📙ドキュメント

リポジトリ内のREADMEを閲覧する。

```
bun run docs
```

## 不具合 / アイディア等
不具合の報告は[こちらから](https://github.com/aipictors/aipictors/issues/new/choose)(GitHubアカウントが必要)。  
アイディア等は[Discord](https://discord.gg/aipictors)から受け付けています。

## その他

- [Biomeについて](/docs/biome.md)
- [lefthookについて](/docs/lefthook.md)
- [単体テストについて](/docs/testing.md)
