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

/** これより横長な作品は、石垣状の一覧で 2 列ぶち抜きにする（縦長ばかり大きく見えないように） */
export const WIDE_ASPECT_RATIO = 1.3

export type MasonryBlock<T> =
  | { kind: "columns"; columns: { item: T; index: number }[][] }
  | { kind: "wide"; items: { item: T; index: number }[] }

/**
 * 石垣状の一覧を、列のかたまりと「横長の作品を 2 列ぶち抜きで並べる行」に分ける。
 *
 * 横長の作品は 1 行に columnCount / 2 件まで入る。列の高さがそろうまで（最大で列の数の 2 倍の件数）
 * 横長の行を少し後ろに送り、行の手前に大きな隙間ができないようにする。それ以外の並びは元の順のまま。
 * 1 列のときは分けない
 */
export const splitMasonryBlocks = <T>(
  items: readonly T[],
  columnCount: number,
  toAspectRatio: (item: T) => number,
  extraHeight = 0,
): MasonryBlock<T>[] => {
  const count = Math.max(1, Math.floor(columnCount))
  const perRow = Math.floor(count / 2)
  if (perRow < 1) {
    return [
      {
        kind: "columns",
        columns: splitMasonryColumns(items, count, toAspectRatio, extraHeight),
      },
    ]
  }
  const maxWaitingNarrow = count * 2
  const blocks: MasonryBlock<T>[] = []
  let columns: { item: T; index: number }[][] = []
  let heights: number[] = []
  const resetColumns = () => {
    columns = Array.from({ length: count }, () => [])
    heights = new Array<number>(count).fill(0)
  }
  resetColumns()
  let waiting: { item: T; index: number }[] = []
  let waitedNarrow = 0

  const isBalanced = () => Math.max(...heights) - Math.min(...heights) < 0.5
  const flushWide = () => {
    if (columns.some((column) => column.length > 0)) {
      blocks.push({ kind: "columns", columns })
      resetColumns()
    }
    for (let i = 0; i < waiting.length; i += perRow) {
      blocks.push({ kind: "wide", items: waiting.slice(i, i + perRow) })
    }
    waiting = []
    waitedNarrow = 0
  }

  items.forEach((item, index) => {
    if (toAspectRatio(item) >= WIDE_ASPECT_RATIO) {
      waiting.push({ item, index })
      if (waiting.length >= perRow && isBalanced()) flushWide()
      return
    }
    let shortest = 0
    for (let i = 1; i < count; i++) {
      if (heights[i] < heights[shortest] - 0.001) shortest = i
    }
    columns[shortest].push({ item, index })
    heights[shortest] += 1 / toAspectRatio(item) + extraHeight
    if (waiting.length === 0) return
    waitedNarrow++
    if (
      (waiting.length >= perRow && isBalanced()) ||
      waitedNarrow >= maxWaitingNarrow
    ) {
      flushWide()
    }
  })
  if (waiting.length > 0) {
    flushWide()
  } else if (columns.some((column) => column.length > 0)) {
    blocks.push({ kind: "columns", columns })
  }
  return blocks
}
