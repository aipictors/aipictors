/** 石垣状の一覧で使う縦横比の範囲（極端に縦長・横長な画像は枠に合わせて切り抜く） */
const MIN_ASPECT_RATIO = 0.56
const MAX_ASPECT_RATIO = 1.78

/**
 * 一覧の枠の縦横比（幅 / 高さ）。サイズが分からないときは正方形
 */
export const toMasonryAspectRatio = (width: number, height: number) => {
  if (!(width > 0) || !(height > 0)) return 1
  return Math.min(Math.max(width / height, MIN_ASPECT_RATIO), MAX_ASPECT_RATIO)
}

/**
 * 作品を、いちばん短い列に順に足して列に分ける（アプリの石垣状の一覧と同じ並べ方）
 *
 * データだけで決まるので、サーバーとブラウザで同じ並びになる（hydration がずれない）。
 * extraHeight はタイトルなど画像の下の高さ（列の幅を 1 としたときの割合）
 */
export const splitMasonryColumns = <T>(
  items: readonly T[],
  columnCount: number,
  toAspectRatio: (item: T) => number,
  extraHeight = 0,
): { item: T; index: number }[][] => {
  const count = Math.max(1, Math.floor(columnCount))
  const columns: { item: T; index: number }[][] = Array.from(
    { length: count },
    () => [],
  )
  const heights = new Array<number>(count).fill(0)
  items.forEach((item, index) => {
    let shortest = 0
    for (let i = 1; i < count; i++) {
      // 少しの差なら左を優先する（同じ高さの行で左右に交互に入る）
      if (heights[i] < heights[shortest] - 0.001) shortest = i
    }
    columns[shortest].push({ item, index })
    heights[shortest] += 1 / toAspectRatio(item) + extraHeight
  })
  return columns
}
