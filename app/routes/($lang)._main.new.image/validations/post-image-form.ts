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
  enTitle: pipe(
    string(),
    maxLength(120, "タイトルは120文字以内で入力してください"),
  ),
  enCaption: pipe(
    string(),
    maxLength(3000, "キャプションは3000文字以内で入力してください"),
  ),
  thumbnailBase64: string("サムネイル画像を設定してください"),
})
