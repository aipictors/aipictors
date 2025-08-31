# AI自動生成機能の実装

投稿画面で画像がセットされているときに、AIによってタイトル、説明文、タグ（英語も対応）を自動生成する機能を追加しました。

## 実装内容

### 1. GenerateContentFromImageButton コンポーネント

**ファイル**: `app/routes/($lang)._main.new.image/components/generate-content-from-image-button.tsx`

#### 機能
- 画像をJPEGに変換してアップロード
- 画像URLのキャッシュ機能（同じ画像は再アップロードしない）
- AIによるコンテンツ生成（タイトル、説明文、タグ）
- タグのみ生成モードも対応
- **1日50回までの利用制限**: ローカルストレージで管理
- **利用制限の通知**: 上限到達時にボタンを無効化

#### Props
- `imageBase64`: 生成対象の画像（Base64形式）
- `token`: 認証トークン
- `onContentGenerated`: 生成されたコンテンツを受け取るコールバック
- `tagsOnly`: タグのみ生成するかどうか

#### キャッシュ機能
- SHA256ハッシュを使用して同じ画像を識別
- メモリ内キャッシュで画像URLを保存
- 同じ画像は再アップロードせずにキャッシュされたURLを使用

### 2. PostImageFormUploader の拡張

**ファイル**: `app/routes/($lang)._main.new.image/components/post-image-form-uploader.tsx`

画像アップロード画面に以下のボタンを追加：
- **AI自動生成**: タイトル、説明文、タグを一括生成
- **タグのみ生成**: タグのみを生成

### 3. メイン投稿画面の拡張

**ファイル**: `app/routes/($lang)._main.new.image/route.tsx`

#### 追加機能
- `onContentGenerated` 関数: AI生成されたコンテンツをフォームに反映
- 日本語・英語両対応のタイトル、説明文、タグの自動設定
- **タグ上限制御**: 最大10個までのタグ制限
- **重複チェック**: 既存タグとの重複を防止（大文字小文字を区別しない）
- **通知機能**: タグ上限到達時にユーザーへの警告メッセージ

## GraphQL実装

実際のGraphQL mutationが実装されました：

```graphql
mutation GenerateImageContent($input: GenerateImageContentInput!) {
  generateImageContent(input: $input) {
    title
    description
    tags
    titleEn
    descriptionEn
    tagsEn
  }
}
```

### 入力形式
```json
{
  "input": {
    "imageUrl": "https://example.com/image.jpg",
    "tagsOnly": false  // タグのみ生成する場合はtrue
  }
}
```

### 出力形式
```json
{
  "title": "AIが生成したタイトル",
  "description": "AIが生成した説明文",
  "tags": ["タグ1", "タグ2", "タグ3"],
  "titleEn": "AI Generated Title",
  "descriptionEn": "AI Generated Description",
  "tagsEn": ["Tag1", "Tag2", "Tag3"]
}
```

## 実装手順

### バックエンド実装時
1. **GraphQLスキーマ定義**: `GenerateImageContentInput`型を定義
2. **リゾルバー実装**: AI生成ロジックの実装
3. **型定義の更新**: フロントエンドの型エラー修正

### 使用方法
1. 投稿画面で画像をアップロード
2. 「AI自動生成」または「タグのみ生成」ボタンをクリック
3. 生成されたコンテンツが自動的にフォームに反映される

## 制約事項
- 同じ画像は再アップロードされない（キャッシュ機能）
- 画像形式はJPEGに統一される
- ログインユーザーのみ利用可能
- **バックエンド実装必要**: GraphQLスキーマとリゾルバーの実装が必要
- **タグ上限**: 最大10個まで（上限到達時は警告メッセージを表示）
- **利用制限**: 1日50回まで（ローカルストレージで管理、日付変更時にリセット）

## パフォーマンス
- 画像のハッシュ計算による効率的なキャッシュ
- JPEG圧縮率0.8で画像サイズを最適化
- タグ重複チェックによる無駄な追加を防止
- メモリ内キャッシュで高速なURL取得

## 利用制限機能の実装詳細

### ファイル構成
- `utils/ai-generation-usage.ts`: 利用制限管理ユーティリティ

### 主な機能
1. **1日50回の利用制限**
   - ローカルストレージで利用回数を管理
   - 日付が変わると自動でカウントリセット

2. **利用状況の表示**
   - ボタンに残り利用回数を表示
   - 成功時のトースト通知に残り回数を含める

3. **利用不可時の制御**
   - 上限到達時はボタンを無効化
   - 適切な警告メッセージを表示

### データ構造
```typescript
type UsageData = {
  date: string  // YYYY-MM-DD形式
  count: number // 当日の利用回数
}
```

### 主な関数
- `canUseAiGeneration()`: 利用可能かチェック
- `consumeAiGenerationUsage()`: 利用回数を1回消費
- `getRemainingUsage()`: 残り利用回数を取得
