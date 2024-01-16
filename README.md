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

### 1. Node.jsの環境を構築

[**Volta**](https://volta.sh/)が必要です。  
[package.json](./package.json)で指定されている、Node.jsとpnpmが自動的にダウンロード / インストールされます。  
Voltaの[Getting Started](https://docs.volta.sh/guide/getting-started)に従い、環境に応じてインストールしてください。  

エディタは、[Visual Studio Code](https://code.visualstudio.com/)を推奨しています。  

<details>
    <summary>
        Voltaを使用しない場合(非推奨)
    </summary>
    <ul>
        <li><a href="https://nodejs.org">Node.js@20</a>
        <li><a href="https://pnpm.io">pnpm@8</a>
    </ul>
    をインストールしてください
</details>

### 2. エディタを整備する

[推奨されている拡張機能](.vscode/extensions.json)をインストールしてください。  
再読み込みを要求された場合はVSCodeの再起動を行ってください。  
Visual Studio Codeの設定については、[settings.json](.vscode/settings.json)を参照してください。  

![@recommended](./public/README/extension.png)

### 3. 開発環境を起動する
1. 依存関係をインストールする

```bash
pnpm i
```

2. GraphQLのコードをビルドする。

```bash
pnpm run predev
```

3. 開発サーバーを起動する。

```bash
pnpm run dev

## Turbopack(非推奨)
pnpm run dev:turbo
```

### 3. アクセスする
[localhost:3000](http://localhost:3000)からアクセスできます。  


## 📙ドキュメント

リポジトリ内のREADMEを閲覧する。

```
pnpm run docs
```

## 不具合 / アイディア等
不具合の報告は[こちらから](https://github.com/aipictors/aipictors/issues/new/choose)(GitHubアカウントが必要)。  
アイディア等は[Discord](https://discord.gg/aipictors)から受け付けています。

## その他

- [Biomeについて](/docs/biome.md)
- [lefthookについて](/docs/lefthook.md)
- [単体テストについて](/docs/testing.md)
