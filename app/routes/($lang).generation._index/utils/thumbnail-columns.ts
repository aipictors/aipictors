/**
 * 生成履歴のサムネイルサイズ（1〜9）と列数の変換
 * 一覧は thumbnailSize が 9 で 1 列、1 で 9 列（列数 = 10 - サイズ）
 */
export const MIN_THUMBNAIL_COLUMNS = 1

export const MAX_THUMBNAIL_COLUMNS = 9

/** ボタンで直接選べる列数 */
export const QUICK_THUMBNAIL_COLUMNS = [1, 2, 3, 4] as const

const clampColumns = (columns: number) =>
  Math.min(
    MAX_THUMBNAIL_COLUMNS,
    Math.max(MIN_THUMBNAIL_COLUMNS, Math.round(columns)),
  )

export const thumbnailSizeToColumns = (size: number) => clampColumns(10 - size)

export const columnsToThumbnailSize = (columns: number) =>
  10 - clampColumns(columns)

/** 列数を delta だけ増減したときのサムネイルサイズ（範囲外は端で止める） */
export const stepThumbnailSize = (size: number, delta: number) =>
  columnsToThumbnailSize(thumbnailSizeToColumns(size) + delta)
