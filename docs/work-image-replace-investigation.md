# 投稿済み画像作品の画像差し替え: 調査メモ

ユーザ要望: 「小説・コラムは編集画面で差し替えできるのに、画像作品は画像を差し替えられない」

## 現状

### フロント（aipictors）

- 編集画面 `app/routes/($lang)._main.posts.$post.image.edit._index/route.tsx`
  - 既存の画像（メイン + subWorks）を `state.items` に URL のまま読み込む（121–126, 239–241 行付近）。
  - 保存時は `uploadImages()`（413 行付近）で `https://` 以外（= base64）だけアップロードし、`imageUrls` をまとめて `updateWork` に渡している。
    - サムネイル・OGP・`imageWidth/Height`・`mainImageSha256` も `thumbnailBase64` から作り直している（491–564, 648 行付近）。
  - つまり送信側のパイプラインは、差し替え後の画像もそのまま扱える。
- アップローダ `components/edit-image-form-uploader.tsx`
  - `PostFormItemDraggableImages` に `isOnlyMove={true}` を渡しているため、追加・削除・ドロップ・貼り付けが無効。並べ替えとモザイク編集（`SET_EDITED_IMAGE`）しかできない。
  - 単にフラグを外すだけなら差し替え UI は数行で済む。

### バックエンド（aipictors-system）

`application/commands/work/update-work.ts`（UpdateWorkCommand）の画像まわりに、差し替えを有効にする前に直す必要がある問題がある。

1. サブ画像の同期が `imageUrls.length > 1` のときしか走らない（452 行付近）。複数枚の作品を 1 枚に減らすと `sub_works` に古い画像が残る。
2. 「メイン画像で差し替えされるならメイン画像を削除」の処理（472–478 行付近）は、**新しいメイン画像の URL** を `deleteImage()` に渡している。新しい URL が旧サブ画像に含まれなければ削除依頼が飛ぶため、アップロード直後の新画像（または差し替えていない現メイン画像）を消しうる。差し替えを解禁するとこの経路を確実に通るので危険。
   - `deleteImage` は WordPress 側エンドポイントへの POST。どの URL を実際に消すかは WP 側の実装次第なので未確認。
3. 差し替えで不要になった旧メイン画像は削除していない（ストレージに残る）。
4. `works.sub_image_count` を更新していない（作成時のみ設定している）。履歴ログの `imageCount` だけ新しい値になる。
5. `sub_works.create` を `forEach(async …)` で await せずに投げている。エラーを握りつぶし、順序も保証されない。
6. 作成時（`create-work.ts`）は `WorkImageAnalysisRequestedEvent` で画像解析を走らせているが、更新時は走らない。差し替えると AI 評価（bot grading）・画像解析・センシティブ判定などが旧画像のまま残る。
   - 「安全な画像で投稿してから差し替える」と審査をすり抜けられるため、運営判断（再審査・ランキングからの一時除外など）が必要。

## 必要な変更と見積もり

| 項目 | 内容 | 目安 |
| --- | --- | --- |
| BE: update-work の画像同期を修正 | 上記 1・2・4・5 の修正。旧メイン・旧サブで使われなくなった URL だけを削除する | 0.5〜1 日 |
| BE: 差し替え時の再解析 | 画像 URL / sha256 が変わったら `WorkImageAnalysisRequestedEvent` を発火し、bot grading の再評価と旧結果の扱いを決める | 0.5〜1 日 + 仕様決め |
| BE: 審査ポリシー | 差し替え時に moderatorStatus を戻すか、運営通知するか | 仕様決め |
| FE: アップローダ | `isOnlyMove` を外し、追加・削除・差し替えを解禁（最大枚数・合計サイズチェックは新規投稿と共通） | 0.5 日 |
| FE: 確認 | 差し替え時の注意文、PNG 情報の再反映、サムネイル位置のリセット | 0.5 日 |
| 検証 | ステージングで 1 枚→1 枚、複数→1 枚、1 枚→複数、並べ替えのみ、の各ケースで画像・サムネ・OGP・sub_works・ストレージ削除を確認 | 0.5〜1 日 |

合計 3〜4 日程度＋運営側の仕様決め。フロントだけでは安全に解禁できない（バックエンドのデプロイが必須）。
