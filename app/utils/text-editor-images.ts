/** 本文の挿絵を 1 回の画面で上げられる枚数（途中でやめたときに使われない画像が増えすぎないように） */
export const TEXT_EDITOR_IMAGE_UPLOAD_LIMIT = 20

/**
 * 選んだ・ドロップしたファイルから、画像だけを残りの枚数まで取り出す。
 * 上限を超えた分は上げない（使われないまま残る画像を増やさない）
 */
export const pickTextEditorImageFiles = <T extends { type: string }>(
  files: T[],
  remaining: number,
) => {
  const images = files.filter((file) => file.type.startsWith("image/"))
  const picked = images.slice(0, Math.max(0, remaining))
  return { picked, skipped: images.length - picked.length }
}

/**
 * まとめて入れる挿絵を、1 枚ずつの段落とその後ろの空行にする。
 * 画像の間にひと言を書き足しやすいように空行を挟む
 */
export const toImageParagraphs = (urls: string[]) =>
  urls.flatMap((src) => [
    { type: "paragraph", content: [{ type: "image", attrs: { src } }] },
    { type: "paragraph" },
  ])
