import { maxLength, minLength, object, pipe, string } from "valibot"

export const vPostImageForm = object({
  title: pipe(
    string(),
    minLength(1, "タイトルを入力してください"),
    maxLength(120, "タイトルは120文字以内で入力してください"),
  ),
  caption: pipe(
    string(),
    maxLength(3000, "キャプションは3000文字以内で入力してください"),
  ),
  // 英語は自動翻訳で入り、日本語より長くなることがある（上限はサーバーと同じ）
  enTitle: pipe(
    string(),
    maxLength(1000, "英語のタイトルは1000文字以内で入力してください"),
  ),
  enCaption: pipe(
    string(),
    maxLength(6000, "英語のキャプションは6000文字以内で入力してください"),
  ),
  thumbnailBase64: string("サムネイル画像を設定してください"),
})
