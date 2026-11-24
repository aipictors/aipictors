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
