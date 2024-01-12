# App

App Routerを使用しています。

https://nextjs.org/docs/app

## Route Groups

特定のページにレイアウトを適用したい場合はRoute Groupsを使用します。

以下の2つのグループには専用のレイアウトが適用されています。

- (beta)
- (main)

## Private Folders

ルーティングに関係のないディレクトリにはアンダースコアを付けています。

https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders

例えば、このようなディレクトリが配置されています。

- _utils
- _components

## Themes
[shadcn/ui](https://ui.shadcn.com/themes)  
[globals.css](./globals.css)

1. --primary と --ring: これらはアクセントカラーとして機能するため、軸の色（#0090f0: 明るいブルー）を使用します。  
これは、UI要素に注目を引くために効果的です。

2. --secondary と --accent: こちらには、ビビッドオレンジ（#fdc00f）を使います。  
これにより、主要なアクセントカラーと調和し、バランスのとれた外観を提供します。

3. --destructive: 通常、警告やエラーメッセージに使われる色です。  
ここでは、オレンジの色相を少し変えて、より暖かみのある赤を提案します。

4. --background, --card, --popover: これらは背景色に関連しています。淡いグレーやオフホワイトを提案します。  
これにより、アクセントカラーがより際立ちます。

5. --foreground, --card-foreground, --popover-foreground: これらはテキストや前面の要素に使われる色です。  
高いコントラストを提供するために、ダークグレーやほぼブラックを提案します。

6. --muted と --muted-foreground: これらは目立たない要素に使用されます。  
淡いグレーまたは暖かみのあるベージュを提案します。

7. --border と --input: これらはUI要素の境界線や入力フィールドに関連しています。  
目立たないが洗練された外観を提供するために、中間のグレーを選びます。