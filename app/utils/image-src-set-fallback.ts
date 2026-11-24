/**
 * 縮小版の読み込みに失敗した画像を覚えておく。
 *
 * 縮小版がまだ無い画像は、縮小の Worker が作るまで数秒 404 を返す。srcSet の候補が 404 だと
 * ブラウザは元の画像に戻してくれず、作品ページのメイン画像が出ないままになる。
 * 失敗した画像は srcSet を外して元の画像で出し直す（ページを更新しなくても絵が出る）。
 */
export const markSrcSetFailed = (
  current: ReadonlySet<string>,
  url: string,
): ReadonlySet<string> => {
  if (current.has(url)) return current
  const next = new Set(current)
  next.add(url)
  return next
}

/** この画像は縮小版をあきらめて元の画像で出すかどうか */
export const isSrcSetDisabled = (
  current: ReadonlySet<string>,
  url: string,
): boolean => current.has(url)

/**
 * ハイドレーション前に読み終わった（または失敗した）画像の状態。
 *
 * img.complete は「読み込みに失敗した」ときも true になる。縮小版が 404 で失敗していても
 * onError はハイドレーション前だと呼ばれないので、complete だけで「読み終わり」とすると
 * 枠の高さと下敷きの小さい版が外れ、絵の場所が帯のように潰れたまま更新するまで戻らなかった。
 * 中身の幅が 0 のものは失敗として扱う。
 */
export const toSettledImageState = (image: {
  complete: boolean
  naturalWidth: number
}): "pending" | "loaded" | "failed" => {
  if (!image.complete) return "pending"
  return image.naturalWidth > 0 ? "loaded" : "failed"
}
